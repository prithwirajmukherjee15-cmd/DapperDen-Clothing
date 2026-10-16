from fastapi import FastAPI, APIRouter, HTTPException, BackgroundTasks, Header
from fastapi.responses import HTMLResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import secrets
import asyncio
import resend
from pathlib import Path
from pydantic import BaseModel, Field
from pymongo.errors import DuplicateKeyError
from typing import List, Optional
from datetime import datetime, timezone

import emails
from catalog import CATEGORIES, COLLECTIONS, PRODUCTS, COUPONS, CATEGORIES_BY_GENDER

PRODUCTS_BY_ID = {p["id"]: p for p in PRODUCTS}
FREE_SHIPPING_MIN = 1499
SHIPPING_FEE = 99

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '').strip()
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev').strip()
SITE_URL = os.environ.get('SITE_URL', 'https://dapper-denn.netlify.app').strip().rstrip('/')
SUPPORT_EMAIL = os.environ.get('SUPPORT_EMAIL', '').strip()
ORDER_NOTIFY_EMAIL = os.environ.get('ORDER_NOTIFY_EMAIL', '').strip()
ADMIN_TOKEN = os.environ.get('ADMIN_TOKEN', '').strip()
if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

CORS_ORIGINS = [o.strip() for o in os.environ.get('CORS_ORIGINS', '*').split(',') if o.strip()] or ['*']

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ---------- Models ----------
# Prices, totals and product details are never taken from the client: the order
# is priced from the catalog on the server. Extra fields the client sends
# (name, price, total, ...) are ignored.
class OrderItem(BaseModel):
    id: str
    size: str
    color: str
    qty: int = Field(ge=1, le=20)


class Address(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    phone: str = Field(min_length=10, max_length=15)
    email: Optional[str] = Field(default=None, max_length=200)
    pincode: str = Field(min_length=6, max_length=6)
    line: str = Field(min_length=1, max_length=300)
    city: str = Field(min_length=1, max_length=100)
    stateName: str = Field(min_length=1, max_length=100)


class OrderCreate(BaseModel):
    items: List[OrderItem] = Field(min_length=1, max_length=50)
    coupon: Optional[str] = None
    payment_method: str = Field(min_length=1, max_length=60)
    address: Address


class CouponRequest(BaseModel):
    code: str = ""
    subtotal: float = 0


# ---------- Email ----------
def _sender() -> str:
    return SENDER_EMAIL if "<" in SENDER_EMAIL else f"Dapper Den <{SENDER_EMAIL}>"


async def send_email(to: Optional[str], subject: str, html_body: str, text_body: Optional[str] = None, tag: str = ""):
    if not to:
        logger.info("[EMAIL %s] No recipient — skipped", tag)
        return
    if not RESEND_API_KEY:
        logger.info("[EMAIL %s - MOCKED] Would send '%s' to %s (set RESEND_API_KEY to send for real)", tag, subject, to)
        return
    params = {"from": _sender(), "to": [to], "subject": subject, "html": html_body}
    if text_body:
        params["text"] = text_body
    if SUPPORT_EMAIL:
        params["reply_to"] = SUPPORT_EMAIL
    try:
        await asyncio.to_thread(resend.Emails.send, params)
        logger.info("[EMAIL %s] Sent '%s' to %s", tag, subject, to)
    except Exception as ex:
        logger.error("[EMAIL %s] Failed to send '%s' to %s: %s", tag, subject, to, ex)


async def send_order_emails(order: dict):
    oid, total = order.get("order_id"), emails.inr(order.get("total", 0))
    await send_email(
        (order.get("address") or {}).get("email"),
        f"Order #{oid} confirmed — your Dapper Den receipt",
        emails.receipt_html(order, SITE_URL, SUPPORT_EMAIL),
        emails.receipt_text(order, SITE_URL),
        tag="receipt",
    )
    method = "COD" if emails.is_cod(order) else order.get("payment_method", "")
    await send_email(ORDER_NOTIFY_EMAIL, f"New order #{oid} — {total} ({method})",
                     emails.owner_alert_html(order, SITE_URL), tag="owner-alert")


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


def apply_coupon(code: str, subtotal: float) -> dict:
    code = (code or "").strip().upper()
    c = COUPONS.get(code)
    if not c:
        return {"valid": False, "message": "Invalid coupon code"}
    if c.get("min") and subtotal < c["min"]:
        return {"valid": False, "message": f"Add items worth more to use {code}"}
    discount = round(subtotal * c["value"] / 100) if c["type"] == "percent" else c["value"]
    return {"valid": True, "code": code, "label": c["label"], "discount": min(discount, subtotal)}


@api_router.post("/coupon/validate")
async def validate_coupon(payload: CouponRequest):
    return apply_coupon(payload.code, payload.subtotal)


# ---------- Orders (guest) ----------
def _new_order_id() -> str:
    return "DD" + str(secrets.randbelow(10**10)).zfill(10)


def _price_items(items: List[OrderItem]) -> List[dict]:
    priced = []
    for i in items:
        p = PRODUCTS_BY_ID.get(i.id)
        if not p:
            raise HTTPException(status_code=400, detail=f"Product {i.id} is no longer available")
        if i.size not in p.get("sizes", []):
            raise HTTPException(status_code=400, detail=f"Size {i.size} is not available for {p['name']}")
        priced.append({
            "id": p["id"], "name": p["name"], "slug": p["slug"], "image": p["images"][0],
            "price": p["price"], "size": i.size, "color": i.color[:40], "qty": i.qty,
        })
    return priced


@api_router.post("/orders")
async def create_order(payload: OrderCreate, background: BackgroundTasks):
    items = _price_items(payload.items)
    subtotal = sum(i["price"] * i["qty"] for i in items)
    discount = 0
    coupon = None
    if payload.coupon:
        c = apply_coupon(payload.coupon, subtotal)
        if not c["valid"]:
            raise HTTPException(status_code=400, detail=f"Coupon {payload.coupon.upper()} can't be applied: {c['message']}")
        discount, coupon = c["discount"], c["code"]
    shipping = 0 if subtotal >= FREE_SHIPPING_MIN else SHIPPING_FEE
    total = max(0, subtotal - discount) + shipping

    doc = {
        "items": items,
        "total": total,
        "subtotal": subtotal,
        "discount": discount,
        "shipping": shipping,
        "coupon": coupon,
        "payment_method": payload.payment_method,
        "address": payload.address.model_dump(),
        "status": "Confirmed",
        "created_at": datetime.now(timezone.utc),
    }
    for _ in range(5):
        doc["order_id"] = _new_order_id()
        try:
            await db.orders.insert_one(doc)
            break
        except DuplicateKeyError:
            doc.pop("_id", None)
    else:
        raise HTTPException(status_code=503, detail="Could not allocate an order ID, please retry")
    doc.pop("_id", None)

    doc["created_at"] = doc["created_at"].isoformat()
    # Emails go out after the response so a slow mail provider never delays checkout.
    background.add_task(send_order_emails, dict(doc))
    return doc


async def _find_order_for_customer(order_id: str, phone: str) -> dict:
    oid = order_id.strip().upper()
    order = await db.orders.find_one({"order_id": oid}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    saved_phone = str((order.get("address") or {}).get("phone", ""))
    if not phone.strip() or saved_phone[-10:] != phone.strip()[-10:]:
        raise HTTPException(status_code=403, detail="Phone number does not match this order")
    if isinstance(order.get("created_at"), datetime):
        order["created_at"] = order["created_at"].isoformat()
    return order


@api_router.get("/orders/track")
async def track_order(order_id: str, phone: str):
    return await _find_order_for_customer(order_id, phone)


@api_router.get("/orders/receipt", response_class=HTMLResponse)
async def order_receipt(order_id: str, phone: str):
    """Printable receipt page (same design as the confirmation email)."""
    order = await _find_order_for_customer(order_id, phone)
    return HTMLResponse(emails.receipt_page(order, SITE_URL, SUPPORT_EMAIL))


# ---------- Admin: order status updates ----------
ORDER_STATUSES = emails.STAGES + ["Cancelled"]


class StatusUpdate(BaseModel):
    status: str
    notify: bool = True


def _require_admin(token: str):
    if not ADMIN_TOKEN or not secrets.compare_digest(token.encode(), ADMIN_TOKEN.encode()):
        raise HTTPException(status_code=403, detail="Not allowed")


@api_router.get("/admin/orders")
async def list_orders(limit: int = 50, x_admin_token: str = Header(default="")):
    """Most recent orders first. Disabled unless ADMIN_TOKEN is set on the server."""
    _require_admin(x_admin_token)
    limit = max(1, min(limit, 200))
    return await db.orders.find({}, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)


@api_router.post("/admin/orders/{order_id}/status")
async def update_order_status(order_id: str, payload: StatusUpdate, background: BackgroundTasks,
                              x_admin_token: str = Header(default="")):
    """Move an order along (Packed → Shipped → ...) and email the customer.
    Disabled unless ADMIN_TOKEN is set on the server."""
    _require_admin(x_admin_token)
    if payload.status not in ORDER_STATUSES:
        raise HTTPException(status_code=400, detail=f"Status must be one of: {', '.join(ORDER_STATUSES)}")
    oid = order_id.strip().upper()
    order = await db.orders.find_one({"order_id": oid}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    now = datetime.now(timezone.utc)
    await db.orders.update_one({"order_id": oid}, {
        "$set": {"status": payload.status, "updated_at": now},
        "$push": {"status_history": {"status": payload.status, "at": now}},
    })
    changed = order.get("status") != payload.status
    order["status"] = payload.status
    if payload.notify and changed:
        background.add_task(
            send_email, (order.get("address") or {}).get("email"),
            f"Order #{oid}: {payload.status}", emails.status_html(order, SITE_URL, SUPPORT_EMAIL), tag="status")
    return {"order_id": oid, "status": payload.status}


@api_router.get("/")
async def root():
    return {"message": "Dapper Den API"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=False,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def ensure_indexes():
    try:
        await db.orders.create_index("order_id", unique=True)
    except Exception as e:
        logger.error("Could not create orders.order_id index: %s", e)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
