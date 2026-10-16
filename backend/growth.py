"""Growth and retention features: referral codes, one-time reward codes,
abandoned-bag reminders, post-delivery fit feedback and drop alerts.

server.py calls init() with its database, email sender and helpers, so this
module never imports server (and tests can swap the database out)."""
import re
import secrets
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from urllib.parse import quote, urlencode

from fastapi import APIRouter, BackgroundTasks, Header, HTTPException
from pydantic import BaseModel, Field

import emails
from catalog import PRODUCTS

router = APIRouter()
_cfg = {}

REFERRAL_VALUE = 200          # friend's discount and the referrer's reward, in ₹
REFERRAL_MIN_ORDER = 999
REMINDER_MIN_AGE = timedelta(hours=1)
REMINDER_MAX_AGE = timedelta(hours=48)
FIT_MIN_RESPONSES = 3         # don't show a fit score until a few people have answered
DROP_COLLECTION = "anime-legends"
IST = timezone(timedelta(hours=5, minutes=30))
PRODUCTS_BY_ID = {p["id"]: p for p in PRODUCTS}
_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"  # no 0/O or 1/I mix-ups


def init(get_db, send_email, require_admin, price_items, site_url, support_email=""):
    _cfg.update(get_db=get_db, send_email=send_email, require_admin=require_admin,
                price_items=price_items, site_url=site_url, support_email=support_email)


def db():
    return _cfg["get_db"]()


def _rand(n: int) -> str:
    return "".join(secrets.choice(_CODE_CHARS) for _ in range(n))


def _now():
    return datetime.now(timezone.utc)


def _aware(dt):
    return dt.replace(tzinfo=timezone.utc) if isinstance(dt, datetime) and dt.tzinfo is None else dt


async def ensure_indexes():
    d = db()
    await d.orders.create_index("referral_code", unique=True, sparse=True)
    await d.coupons.create_index("code", unique=True)
    await d.checkouts.create_index("checkout_id", unique=True)
    await d.feedback.create_index([("order_id", 1), ("product_id", 1)], unique=True)
    await d.drop_alerts.create_index("email", unique=True, partialFilterExpression={"email": {"$type": "string"}})
    await d.drop_alerts.create_index("whatsapp", unique=True, partialFilterExpression={"whatsapp": {"$type": "string"}})


# ---------- Referrals and reward codes ----------
def new_referral_code(name: str) -> str:
    letters = re.sub(r"[^A-Za-z]", "", (name or "").split(" ")[0]).upper()[:5] or "FRIEND"
    return f"{letters}{_rand(4)}"


def referral_link(code: str) -> str:
    return f"{_cfg['site_url']}/?{urlencode({'ref': code})}"


def whatsapp_share_url(code: str) -> str:
    text = (f"I got my streetwear from Dapper Den. Use my code {code} for ₹{REFERRAL_VALUE} off your first order "
            f"(above ₹{REFERRAL_MIN_ORDER}): {referral_link(code)}")
    return f"https://wa.me/?text={quote(text)}"


async def find_code(code: str) -> Optional[dict]:
    """A one-time reward code, or a customer's referral code, in the shape of a COUPONS entry."""
    if not code:
        return None
    reward = await db().coupons.find_one({"code": code})
    if reward:
        if reward.get("used"):
            return None
        return {"type": "flat", "value": reward["value"], "min": reward.get("min", 0), "kind": "reward",
                "label": f"₹{reward['value']} reward for referring a friend"}
    if await db().orders.find_one({"referral_code": code}, {"_id": 0, "order_id": 1}):
        return {"type": "flat", "value": REFERRAL_VALUE, "min": REFERRAL_MIN_ORDER, "kind": "referral",
                "label": f"₹{REFERRAL_VALUE} off your first order, from a friend"}
    return None


async def check_referral_use(code: str, phone: str):
    """Referral codes are for a new customer's first order, and not for the referrer themselves."""
    phone10 = (phone or "")[-10:]
    referrer = await db().orders.find_one({"referral_code": code}, {"_id": 0, "address": 1})
    if referrer and str((referrer.get("address") or {}).get("phone", ""))[-10:] == phone10:
        raise HTTPException(status_code=400, detail="You can't use your own referral code, but your friends can")
    if await db().orders.find_one({"address.phone": phone}, {"_id": 0, "order_id": 1}):
        raise HTTPException(status_code=400, detail="Referral codes are for a first order only")


async def claim_reward(code: str) -> bool:
    res = await db().coupons.update_one({"code": code, "used": False}, {"$set": {"used": True, "used_at": _now()}})
    return getattr(res, "modified_count", 0) == 1


async def release_reward(code: str):
    await db().coupons.update_one({"code": code}, {"$set": {"used": False}})


async def after_order(order: dict):
    """Runs after the order emails: reward the referrer when a friend used their code."""
    if order.get("coupon_kind") != "referral":
        return
    referrer = await db().orders.find_one({"referral_code": order["coupon"]}, {"_id": 0})
    if not referrer:
        return
    reward = {"code": f"THANKS{_rand(6)}", "value": REFERRAL_VALUE, "min": REFERRAL_MIN_ORDER, "used": False,
              "owner_phone": (referrer.get("address") or {}).get("phone"), "from_order": order["order_id"],
              "created_at": _now()}
    await db().coupons.insert_one(dict(reward))
    await db().orders.update_one({"referral_code": order["coupon"]}, {"$inc": {"referrals": 1}})
    friend = emails.first_name(order)
    await _cfg["send_email"]((referrer.get("address") or {}).get("email"),
                             f"{friend} just ordered with your code — here's ₹{REFERRAL_VALUE} off",
                             emails.referral_reward_html(referrer, reward["code"], friend, _cfg["site_url"], _cfg["support_email"]),
                             tag="referral-reward")


# ---------- Abandoned-bag reminders ----------
class CheckoutItem(BaseModel):
    id: str
    size: str
    color: str
    qty: int = Field(ge=1, le=20)


class CheckoutStart(BaseModel):
    items: List[CheckoutItem] = Field(min_length=1, max_length=50)
    name: str = Field(default="", max_length=100)
    phone: str = Field(default="", max_length=15)
    email: Optional[str] = Field(default=None, max_length=200)


@router.post("/checkouts")
async def start_checkout(payload: CheckoutStart):
    """Saved when a shopper finishes the address step, so an unfinished bag can be recovered."""
    items = _cfg["price_items"](payload.items)
    doc = {"checkout_id": secrets.token_urlsafe(9), "items": items, "name": payload.name.strip(),
           "phone": payload.phone.strip(), "email": (payload.email or "").strip() or None,
           "converted": False, "reminded_at": None, "created_at": _now()}
    await db().checkouts.insert_one(dict(doc))
    return {"checkout_id": doc["checkout_id"]}


@router.get("/checkouts/{checkout_id}")
async def restore_checkout(checkout_id: str):
    """Bag contents only (no personal details), for the 'complete your order' link."""
    c = await db().checkouts.find_one({"checkout_id": checkout_id}, {"_id": 0, "items": 1})
    if not c:
        raise HTTPException(status_code=404, detail="This bag link has expired")
    out = []
    for i in c["items"]:
        p = PRODUCTS_BY_ID.get(i["id"])
        if p:
            out.append({**i, "price": p["price"], "mrp": p["mrp"], "image": p["images"][0]})
    return {"items": out}


async def mark_checkout_converted(checkout_id: Optional[str], phone: str, order_id: str):
    q = {"checkout_id": checkout_id} if checkout_id else {"phone": phone, "converted": False}
    await db().checkouts.update_many(q, {"$set": {"converted": True, "order_id": order_id}})


def restore_url(checkout_id: str) -> str:
    return f"{_cfg['site_url']}/cart?{urlencode({'restore': checkout_id})}"


@router.post("/admin/reminders/run")
async def run_reminders(x_admin_token: str = Header(default="")):
    """Email one reminder for each bag left at checkout 1–48 hours ago. Call it hourly from a scheduler."""
    _cfg["require_admin"](x_admin_token)
    now = _now()
    due = await db().checkouts.find({"converted": False, "reminded_at": None,
                                     "created_at": {"$lte": now - REMINDER_MIN_AGE, "$gte": now - REMINDER_MAX_AGE}},
                                    {"_id": 0}).to_list(500)
    sent = skipped = 0
    for c in due:
        ordered = c.get("phone") and await db().orders.find_one(
            {"address.phone": c["phone"], "created_at": {"$gte": _aware(c["created_at"])}}, {"_id": 0, "order_id": 1})
        if ordered or not c.get("email"):
            await db().checkouts.update_one({"checkout_id": c["checkout_id"]},
                                            {"$set": {"converted": bool(ordered), "reminded_at": now}})
            skipped += 1
            continue
        await _cfg["send_email"](c["email"], "You left something in your bag",
                                 emails.reminder_html(c, restore_url(c["checkout_id"]), _cfg["site_url"], _cfg["support_email"]),
                                 tag="bag-reminder")
        await db().checkouts.update_one({"checkout_id": c["checkout_id"]}, {"$set": {"reminded_at": now}})
        sent += 1
    return {"sent": sent, "skipped": skipped}


# ---------- Post-delivery fit feedback ----------
FITS = ("small", "right", "large")


def feedback_url(order: dict) -> str:
    return f"{_cfg['site_url']}/feedback?{urlencode({'order': order['order_id'], 'token': order.get('feedback_token', '')})}"


async def _order_for_feedback(order_id: str, token: str) -> dict:
    order = await db().orders.find_one({"order_id": order_id.strip().upper()}, {"_id": 0})
    if not order or not token or not secrets.compare_digest(str(order.get("feedback_token", "")), token):
        raise HTTPException(status_code=404, detail="This feedback link isn't valid")
    return order


@router.get("/feedback")
async def feedback_form(order_id: str, token: str):
    order = await _order_for_feedback(order_id, token)
    done = await db().feedback.find({"order_id": order["order_id"]}, {"_id": 0}).to_list(50)
    items, seen = [], set()
    for i in order["items"]:
        if i["id"] in seen:
            continue
        seen.add(i["id"])
        items.append({"product_id": i["id"], "name": i["name"], "image": i["image"], "size": i["size"]})
    return {"order_id": order["order_id"], "first_name": emails.first_name(order), "items": items, "submitted": bool(done)}


class FitAnswer(BaseModel):
    product_id: str
    fit: str
    rating: Optional[int] = Field(default=None, ge=1, le=5)


class FeedbackIn(BaseModel):
    order_id: str
    token: str
    answers: List[FitAnswer] = Field(min_length=1, max_length=50)
    comment: str = Field(default="", max_length=1000)


@router.post("/feedback")
async def submit_feedback(payload: FeedbackIn):
    order = await _order_for_feedback(payload.order_id, payload.token)
    sizes = {i["id"]: i["size"] for i in order["items"]}
    for a in payload.answers:
        if a.product_id not in sizes:
            raise HTTPException(status_code=400, detail="That product isn't in this order")
        if a.fit not in FITS:
            raise HTTPException(status_code=400, detail="Fit must be small, right or large")
    for a in payload.answers:
        await db().feedback.update_one(
            {"order_id": order["order_id"], "product_id": a.product_id},
            {"$set": {"order_id": order["order_id"], "product_id": a.product_id, "size": sizes[a.product_id], "fit": a.fit,
                      "rating": a.rating, "comment": payload.comment.strip(), "created_at": _now()}},
            upsert=True)
    return {"ok": True}


@router.get("/products/{slug}/fit")
async def product_fit(slug: str):
    p = next((x for x in PRODUCTS if x["slug"] == slug), None)
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    rows = await db().feedback.find({"product_id": p["id"]}, {"_id": 0, "fit": 1, "rating": 1}).to_list(5000)
    n = len(rows)
    if n < FIT_MIN_RESPONSES:
        return {"responses": n, "enough": False}
    pct = {f: round(100 * sum(r["fit"] == f for r in rows) / n) for f in FITS}
    ratings = [r["rating"] for r in rows if r.get("rating")]
    return {"responses": n, "enough": True, "true_to_size": pct["right"], "runs_small": pct["small"],
            "runs_large": pct["large"], "avg_rating": round(sum(ratings) / len(ratings), 1) if ratings else None}


# ---------- Drop alerts ----------
def next_drop(now: Optional[datetime] = None) -> datetime:
    """Drops land every Friday at 8 pm IST (the 'new drop every Friday' promise in the trust bar)."""
    now = (now or _now()).astimezone(IST)
    days = (4 - now.weekday()) % 7
    drop = (now + timedelta(days=days)).replace(hour=20, minute=0, second=0, microsecond=0)
    if drop <= now:
        drop += timedelta(days=7)
    return drop.astimezone(timezone.utc)


@router.get("/drop")
async def drop_info():
    col = DROP_COLLECTION
    count = await db().drop_alerts.count_documents({})
    preview = [p for p in PRODUCTS if p["collection"] == col][:4]
    return {"collection": col, "drops_at": next_drop().isoformat(), "subscribers": count, "preview": preview}


class DropSignup(BaseModel):
    email: Optional[str] = Field(default=None, max_length=200)
    whatsapp: Optional[str] = Field(default=None, max_length=15)
    consent: bool = False
    source: str = Field(default="drop-page", max_length=40)


EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


@router.post("/drop-alerts")
async def join_drop(payload: DropSignup, background: BackgroundTasks):
    email = (payload.email or "").strip().lower() or None
    wa = re.sub(r"\D", "", payload.whatsapp or "")[-10:] or None
    if not email and not wa:
        raise HTTPException(status_code=400, detail="Add an email or a WhatsApp number")
    if email and not EMAIL_RE.match(email):
        raise HTTPException(status_code=400, detail="That email doesn't look right")
    if wa and len(wa) != 10:
        raise HTTPException(status_code=400, detail="Enter a 10-digit WhatsApp number")
    if not payload.consent:
        raise HTTPException(status_code=400, detail="Tick the box so we're allowed to message you about the drop")
    existing = await db().drop_alerts.find_one({"$or": [q for q in ({"email": email} if email else None,
                                                                    {"whatsapp": wa} if wa else None) if q]}, {"_id": 0})
    if not existing:
        await db().drop_alerts.insert_one({"email": email, "whatsapp": wa, "collection": DROP_COLLECTION,
                                           "source": payload.source, "created_at": _now()})
        if email:
            background.add_task(_cfg["send_email"], email, "You're on the Dapper Den drop list",
                                emails.drop_confirm_html(next_drop(), "EARLYDROP", _cfg["site_url"], _cfg["support_email"]),
                                None, "drop-confirm")
    return {"ok": True, "already": bool(existing), "code": "EARLYDROP",
            "subscribers": await db().drop_alerts.count_documents({})}


@router.get("/admin/drop-alerts")
async def list_drop_alerts(x_admin_token: str = Header(default="")):
    _cfg["require_admin"](x_admin_token)
    rows = await db().drop_alerts.find({}, {"_id": 0}).sort("created_at", -1).limit(500).to_list(500)
    return {"count": await db().drop_alerts.count_documents({}),
            "with_email": sum(1 for r in rows if r.get("email")), "with_whatsapp": sum(1 for r in rows if r.get("whatsapp")),
            "latest": rows}
