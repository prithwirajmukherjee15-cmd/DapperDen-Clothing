from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import html
import secrets
import asyncio
import resend
from pathlib import Path
from pydantic import BaseModel, Field
from pymongo.errors import DuplicateKeyError
from typing import List, Optional
from datetime import datetime, timezone

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
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
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
def _format_inr(v) -> str:
    try:
        return "₹" + f"{int(round(float(v))):,}"
    except Exception:
        return f"₹{v}"


def _e(v) -> str:
    return html.escape(str(v if v is not None else ""), quote=True)


def _order_email_html(order: dict) -> str:
    rows = "".join(
        f"""<tr>
          <td style='padding:12px 0;border-bottom:1px solid #ececec;'>
            <table role='presentation' cellpadding='0' cellspacing='0'><tr>
              <td><img src='{_e(i.get('image',''))}' width='56' height='64' style='border-radius:8px;object-fit:cover;display:block;' /></td>
              <td style='padding-left:14px;font-family:Arial,sans-serif;'>
                <div style='font-size:14px;font-weight:bold;color:#111;'>{_e(i.get('name',''))}</div>
                <div style='font-size:12px;color:#888;'>Size {_e(i.get('size',''))} &middot; {_e(i.get('color',''))} &middot; Qty {_e(i.get('qty',1))}</div>
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
          <div style='font-size:22px;font-weight:800;color:#111;'>Order Confirmed! &#127881;</div>
          <div style='font-size:14px;color:#666;margin-top:6px;'>Hey {_e((addr.get('name') or 'there').split(' ')[0])}, your drip is locked in. Order <b>#{_e(order.get('order_id'))}</b>.</div>
        </td></tr>
        <tr><td style='padding:16px 32px;'>
          <table role='presentation' width='100%' cellpadding='0' cellspacing='0'>{rows}</table>
        </td></tr>
        <tr><td style='padding:8px 32px 24px;'>
          <table role='presentation' width='100%' cellpadding='0' cellspacing='0' style='font-size:14px;color:#111;'>
            <tr><td style='color:#666;padding:4px 0;'>Payment</td><td align='right'>{_e(order.get('payment_method','Paid'))}</td></tr>
            <tr><td style='color:#666;padding:4px 0;'>Amount Paid</td><td align='right' style='font-weight:800;'>{_format_inr(order.get('total',0))}</td></tr>
            <tr><td style='color:#666;padding:4px 0;'>Delivery</td><td align='right'>3&ndash;5 business days</td></tr>
          </table>
          <div style='margin-top:16px;padding:16px;background:#f6f6f6;border-radius:12px;font-size:13px;color:#444;'>
            <b>Shipping to</b><br/>{_e(addr.get('line',''))}<br/>{_e(addr.get('city',''))}, {_e(addr.get('stateName',''))} &ndash; {_e(addr.get('pincode',''))}<br/>Phone: {_e(addr.get('phone',''))}
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
async def create_order(payload: OrderCreate):
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

    recipient = payload.address.email
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
    if not phone.strip() or saved_phone[-10:] != phone.strip()[-10:]:
        raise HTTPException(status_code=403, detail="Phone number does not match this order")
    if isinstance(order.get("created_at"), datetime):
        order["created_at"] = order["created_at"].isoformat()
    return order


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
