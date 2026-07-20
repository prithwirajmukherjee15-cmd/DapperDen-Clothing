from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import httpx
import asyncio
import resend
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone, timedelta

from catalog import CATEGORIES, COLLECTIONS, PRODUCTS, COUPONS, CATEGORIES_BY_GENDER

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '').strip()
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

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


class AddressIn(BaseModel):
    label: Optional[str] = "Home"
    name: str
    phone: str
    pincode: str
    line: str
    city: str
    stateName: str


def _format_inr(v) -> str:
    try:
        return "₹" + f"{int(round(float(v))):,}"
    except Exception:
        return f"₹{v}"


def _order_email_html(order: dict) -> str:
    rows = "".join(
        f"""<tr>
          <td style='padding:12px 0;border-bottom:1px solid #ececec;'>
            <table role='presentation' cellpadding='0' cellspacing='0'><tr>
              <td><img src='{i.get('image','')}' width='56' height='64' style='border-radius:8px;object-fit:cover;display:block;' /></td>
              <td style='padding-left:14px;font-family:Arial,sans-serif;'>
                <div style='font-size:14px;font-weight:bold;color:#111;'>{i.get('name','')}</div>
                <div style='font-size:12px;color:#888;'>Size {i.get('size','')} &middot; {i.get('color','')} &middot; Qty {i.get('qty',1)}</div>
              </td>
            </tr></table>
          </td>
          <td align='right' style='padding:12px 0;border-bottom:1px solid #ececec;font-family:Arial,sans-serif;font-size:14px;color:#111;font-weight:bold;'>{_format_inr(i.get('price',0)*i.get('qty',1))}</td>
        </tr>"""
        for i in order.get("items", [])
    )
    addr = order.get("address", {})
    return f"""
    <div style='background:#0a0a0b;padding:32px 0;font-family:Arial,sans-serif;'>
      <table role='presentation' width='560' align='center' cellpadding='0' cellspacing='0' style='background:#ffffff;border-radius:16px;overflow:hidden;'>
        <tr><td style='background:#0a0a0b;padding:24px 32px;'>
          <span style='font-size:22px;font-weight:800;color:#ffffff;letter-spacing:1px;'>DAPPER<span style='color:#c6ff3d;'>DEN</span></span>
        </td></tr>
        <tr><td style='padding:32px 32px 8px;'>
          <div style='font-size:22px;font-weight:800;color:#111;'>Order Confirmed! 🎉</div>
          <div style='font-size:14px;color:#666;margin-top:6px;'>Hey {addr.get('name','there').split(' ')[0]}, your drip is locked in. Order <b>#{order.get('order_id')}</b>.</div>
        </td></tr>
        <tr><td style='padding:16px 32px;'>
          <table role='presentation' width='100%' cellpadding='0' cellspacing='0'>{rows}</table>
        </td></tr>
        <tr><td style='padding:8px 32px 24px;'>
          <table role='presentation' width='100%' cellpadding='0' cellspacing='0' style='font-size:14px;color:#111;'>
            <tr><td style='color:#666;padding:4px 0;'>Payment</td><td align='right'>{order.get('payment_method','Paid')}</td></tr>
            <tr><td style='color:#666;padding:4px 0;'>Amount Paid</td><td align='right' style='font-weight:800;'>{_format_inr(order.get('total',0))}</td></tr>
            <tr><td style='color:#666;padding:4px 0;'>Delivery</td><td align='right'>3–5 business days</td></tr>
          </table>
          <div style='margin-top:16px;padding:16px;background:#f6f6f6;border-radius:12px;font-size:13px;color:#444;'>
            <b>Shipping to</b><br/>{addr.get('line','')}<br/>{addr.get('city','')}, {addr.get('stateName','')} – {addr.get('pincode','')}<br/>Phone: {addr.get('phone','')}
          </div>
        </td></tr>
        <tr><td style='background:#0a0a0b;padding:20px 32px;text-align:center;'>
          <span style='font-size:12px;color:#888;'>Dapper Den &middot; Premium streetwear engineered for the bold.</span>
        </td></tr>
      </table>
    </div>"""


async def send_order_email(order: dict, recipient: Optional[str]):
    if not recipient:
        logger.info("[ORDER EMAIL] No recipient email for order %s — skipped", order.get("order_id"))
        return
    subject = f"Your Dapper Den order #{order.get('order_id')} is confirmed"
    html = _order_email_html(order)
    if not RESEND_API_KEY:
        logger.info("[ORDER EMAIL - MOCKED] Would send '%s' to %s (set RESEND_API_KEY to send for real)", subject, recipient)
        return
    try:
        params = {"from": SENDER_EMAIL, "to": [recipient], "subject": subject, "html": html}
        await asyncio.to_thread(resend.Emails.send, params)
        logger.info("[ORDER EMAIL] Sent to %s for order %s", recipient, order.get("order_id"))
    except Exception as e:
        logger.error("[ORDER EMAIL] Failed for order %s: %s", order.get("order_id"), e)


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
async def get_products(category: Optional[str] = None, collection: Optional[str] = None, gender: Optional[str] = None):
    items = PRODUCTS
    if gender:
        items = [p for p in items if p.get("gender", "men") == gender]
    if category:
        items = [p for p in items if p["category"] == category]
    if collection:
        items = [p for p in items if p["collection"] == collection]
    return items


@api_router.get("/categories")
async def get_categories(gender: str = "men"):
    return CATEGORIES_BY_GENDER.get(gender, CATEGORIES)


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
async def create_order(payload: OrderCreate, request: Request):
    user = await get_current_user(request)
    order_id = "DD" + str(uuid.uuid4().int)[:6]
    doc = {
        "order_id": order_id,
        "user_id": user["user_id"] if user else None,
        "guest": user is None,
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

    recipient = user["email"] if user else (payload.address or {}).get("email")
    await send_order_email(doc, recipient)

    doc["created_at"] = doc["created_at"].isoformat()
    return doc


@api_router.get("/orders/track")
async def track_order(order_id: str, phone: str):
    oid = order_id.strip().upper()
    order = await db.orders.find_one({"order_id": oid}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    saved_phone = str((order.get("address") or {}).get("phone", ""))
    if saved_phone[-10:] != phone.strip()[-10:] or not phone.strip():
        raise HTTPException(status_code=403, detail="Phone number does not match this order")
    if isinstance(order.get("created_at"), datetime):
        order["created_at"] = order["created_at"].isoformat()
    return order


@api_router.get("/orders")
async def list_orders(user: dict = Depends(require_user)):
    cursor = db.orders.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1)
    orders = await cursor.to_list(100)
    for o in orders:
        if isinstance(o.get("created_at"), datetime):
            o["created_at"] = o["created_at"].isoformat()
    return orders


# ---------- Saved Addresses ----------
@api_router.get("/addresses")
async def get_addresses(user: dict = Depends(require_user)):
    return {"addresses": user.get("addresses", [])}


@api_router.post("/addresses")
async def add_address(payload: AddressIn, user: dict = Depends(require_user)):
    addresses = user.get("addresses", [])
    entry = payload.dict()
    entry["id"] = "addr_" + uuid.uuid4().hex[:10]
    addresses.append(entry)
    await db.users.update_one({"user_id": user["user_id"]}, {"$set": {"addresses": addresses}})
    return {"addresses": addresses}


@api_router.delete("/addresses/{address_id}")
async def delete_address(address_id: str, user: dict = Depends(require_user)):
    addresses = [a for a in user.get("addresses", []) if a.get("id") != address_id]
    await db.users.update_one({"user_id": user["user_id"]}, {"$set": {"addresses": addresses}})
    return {"addresses": addresses}


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
