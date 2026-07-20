from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import httpx
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone, timedelta

from catalog import CATEGORIES, COLLECTIONS, PRODUCTS, COUPONS

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

EMERGENT_SESSION_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"
COOKIE_NAME = "session_token"

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ---------- Models ----------
class OrderItem(BaseModel):
    id: str
    name: str
    slug: str
    image: str
    price: float
    size: str
    color: str
    qty: int


class OrderCreate(BaseModel):
    items: List[OrderItem]
    total: float
    subtotal: float
    discount: float = 0
    shipping: float = 0
    coupon: Optional[str] = None
    payment_method: str
    address: dict


class WishlistUpdate(BaseModel):
    product_id: str


# ---------- Auth helper ----------
async def get_current_user(request: Request) -> Optional[dict]:
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        return None
    session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session:
        return None
    expires_at = session["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        return None
    user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    return user


async def require_user(request: Request) -> dict:
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user


# ---------- Auth routes ----------
@api_router.post("/auth/session")
async def process_session(request: Request, response: Response):
    session_id = request.headers.get("X-Session-ID")
    if not session_id:
        raise HTTPException(status_code=400, detail="Missing X-Session-ID header")

    async with httpx.AsyncClient(timeout=15) as http:
        r = await http.get(EMERGENT_SESSION_URL, headers={"X-Session-ID": session_id})
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid session")
    data = r.json()

    email = data["email"]
    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        user_id = existing["user_id"]
        await db.users.update_one({"user_id": user_id}, {"$set": {"name": data.get("name"), "picture": data.get("picture")}})
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id,
            "email": email,
            "name": data.get("name"),
            "picture": data.get("picture"),
            "wishlist": [],
            "created_at": datetime.now(timezone.utc),
        })

    session_token = data["session_token"]
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc),
    })

    response.set_cookie(
        key=COOKIE_NAME, value=session_token, httponly=True, secure=True,
        samesite="none", path="/", max_age=7 * 24 * 60 * 60,
    )
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return {"user": _clean_user(user)}


@api_router.get("/auth/me")
async def auth_me(request: Request):
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return _clean_user(user)


@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get(COOKIE_NAME)
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    response.delete_cookie(COOKIE_NAME, path="/")
    return {"ok": True}


def _clean_user(user: dict) -> dict:
    if not user:
        return {}
    user.pop("created_at", None)
    return user


# ---------- Catalog routes ----------
@api_router.get("/catalog")
async def get_catalog():
    return {"products": PRODUCTS, "collections": COLLECTIONS, "categories": CATEGORIES}


@api_router.get("/products")
async def get_products(category: Optional[str] = None, collection: Optional[str] = None):
    items = PRODUCTS
    if category:
        items = [p for p in items if p["category"] == category]
    if collection:
        items = [p for p in items if p["collection"] == collection]
    return items


@api_router.get("/products/{slug}")
async def get_product(slug: str):
    p = next((x for x in PRODUCTS if x["slug"] == slug), None)
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return p


@api_router.get("/search")
async def search(q: str = ""):
    s = q.lower().strip()
    if not s:
        return []
    return [p for p in PRODUCTS if s in p["name"].lower() or s in p["category"].lower() or s in p["collection"].replace("-", " ").lower()]


@api_router.post("/coupon/validate")
async def validate_coupon(payload: dict):
    code = (payload.get("code") or "").strip().upper()
    subtotal = payload.get("subtotal", 0)
    c = COUPONS.get(code)
    if not c:
        return {"valid": False, "message": "Invalid coupon code"}
    if c.get("min") and subtotal < c["min"]:
        return {"valid": False, "message": f"Add items worth more to use {code}"}
    discount = round(subtotal * c["value"] / 100) if c["type"] == "percent" else c["value"]
    return {"valid": True, "code": code, "label": c["label"], "discount": discount}


# ---------- Wishlist ----------
@api_router.get("/wishlist")
async def get_wishlist(user: dict = Depends(require_user)):
    return {"wishlist": user.get("wishlist", [])}


@api_router.post("/wishlist/toggle")
async def toggle_wishlist(payload: WishlistUpdate, user: dict = Depends(require_user)):
    wl = user.get("wishlist", [])
    if payload.product_id in wl:
        wl.remove(payload.product_id)
    else:
        wl.append(payload.product_id)
    await db.users.update_one({"user_id": user["user_id"]}, {"$set": {"wishlist": wl}})
    return {"wishlist": wl}


# ---------- Orders ----------
@api_router.post("/orders")
async def create_order(payload: OrderCreate, user: dict = Depends(require_user)):
    order_id = "DD" + str(uuid.uuid4().int)[:6]
    doc = {
        "order_id": order_id,
        "user_id": user["user_id"],
        "items": [i.dict() for i in payload.items],
        "total": payload.total,
        "subtotal": payload.subtotal,
        "discount": payload.discount,
        "shipping": payload.shipping,
        "coupon": payload.coupon,
        "payment_method": payload.payment_method,
        "address": payload.address,
        "status": "Confirmed",
        "created_at": datetime.now(timezone.utc),
    }
    await db.orders.insert_one(doc)
    doc.pop("_id", None)
    doc["created_at"] = doc["created_at"].isoformat()
    return doc


@api_router.get("/orders")
async def list_orders(user: dict = Depends(require_user)):
    cursor = db.orders.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1)
    orders = await cursor.to_list(100)
    for o in orders:
        if isinstance(o.get("created_at"), datetime):
            o["created_at"] = o["created_at"].isoformat()
    return orders


@api_router.get("/")
async def root():
    return {"message": "Dapper Den API"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
