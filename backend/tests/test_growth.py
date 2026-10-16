"""Offline tests for the growth features: prepaid nudge, referrals, reward codes,
abandoned-bag reminders, fit feedback and drop alerts."""
from datetime import datetime, timedelta, timezone

import pytest

import growth
import server
from catalog import PRODUCTS

PRODUCT = PRODUCTS[0]
SIZE = PRODUCT["sizes"][0]


def address(phone="9876543210", email="a@example.com", name="Asha Rao"):
    return {"name": name, "phone": phone, "email": email, "pincode": "400001", "line": "1 Test Rd",
            "city": "Mumbai", "stateName": "Maharashtra"}


def order(client, qty=2, **kw):
    payload = {"items": [{"id": PRODUCT["id"], "size": SIZE, "color": "Colour 1", "qty": qty}],
               "payment_method": kw.pop("payment_method", "UPI"), "address": kw.pop("address", address()), **kw}
    return client.post("/api/orders", json=payload)


@pytest.fixture
def sent(monkeypatch):
    log = []

    async def fake_send(to, subject, html_body, text_body=None, tag=""):
        log.append({"to": to, "subject": subject, "html": html_body, "tag": tag})

    monkeypatch.setattr(server, "send_email", fake_send)
    monkeypatch.setattr(server, "ADMIN_TOKEN", "s3cret")
    return log


ADMIN = {"x-admin-token": "s3cret"}


# ---------- Prepaid nudge ----------
def test_prepaid_orders_get_50_off_and_cod_does_not(client):
    upi = order(client).json()
    cod = order(client, payment_method="Cash on Delivery", address=address(phone="9000000002")).json()
    assert upi["prepaid_discount"] == 50 and cod["prepaid_discount"] == 0
    assert cod["total"] - upi["total"] == 50


def test_receipt_shows_paid_online_line(client, sent):
    order(client)
    receipt = next(m for m in sent if m["tag"] == "receipt")
    assert "Paid online" in receipt["html"]


# ---------- Referrals ----------
def test_every_order_gets_a_referral_code_shared_in_the_receipt(client, sent):
    o = order(client).json()
    assert o["referral_code"].startswith("ASHA") and len(o["referral_code"]) == 8
    receipt = next(m for m in sent if m["tag"] == "receipt")
    assert o["referral_code"] in receipt["html"] and "wa.me" in receipt["html"]
    assert "feedback_token" not in o  # never sent to the browser


def test_referral_gives_friend_200_and_rewards_referrer(client, sent):
    ref = order(client).json()["referral_code"]
    check = client.post("/api/coupon/validate", json={"code": ref.lower(), "subtotal": 1500}).json()
    assert check["valid"] and check["discount"] == 200
    friend = order(client, coupon=ref, address=address(phone="9111111111", email="friend@example.com", name="Ravi K")).json()
    assert friend["discount"] == 200 and friend["coupon_kind"] == "referral"
    reward_mail = next(m for m in sent if m["tag"] == "referral-reward")
    assert reward_mail["to"] == "a@example.com" and "Ravi" in reward_mail["subject"]
    reward = client.fake_db.coupons.docs[0]
    assert reward["value"] == 200 and not reward["used"]
    # the reward code works once
    third = address(phone="9222222222", email="x@example.com")
    assert order(client, coupon=reward["code"], address=third).status_code == 200
    again = order(client, coupon=reward["code"], address=address(phone="9333333333"))
    assert again.status_code == 400


def test_referral_rules(client):
    ref = order(client).json()["referral_code"]
    own = order(client, coupon=ref)  # same phone as the referrer
    assert own.status_code == 400 and "own referral" in own.json()["detail"]
    order(client, address=address(phone="9444444444"))
    repeat = order(client, coupon=ref, address=address(phone="9444444444"))
    assert repeat.status_code == 400 and "first order" in repeat.json()["detail"]
    small = client.post("/api/coupon/validate", json={"code": ref, "subtotal": 500}).json()
    assert not small["valid"]


# ---------- Abandoned-bag reminders ----------
def _start(client, **kw):
    body = {"items": [{"id": PRODUCT["id"], "size": SIZE, "color": "Colour 1", "qty": 1}],
            "name": "Meera S", "phone": "9555555555", "email": "meera@example.com", **kw}
    return client.post("/api/checkouts", json=body).json()["checkout_id"]


def _age(client, checkout_id, hours):
    doc = next(d for d in client.fake_db.checkouts.docs if d["checkout_id"] == checkout_id)
    doc["created_at"] = datetime.now(timezone.utc) - timedelta(hours=hours)


def test_restore_link_returns_bag_without_personal_details(client):
    cid = _start(client)
    items = client.get(f"/api/checkouts/{cid}").json()["items"]
    assert items[0]["id"] == PRODUCT["id"] and items[0]["price"] == PRODUCT["price"]
    assert "phone" not in str(items) and "meera" not in str(items).lower()
    assert client.get("/api/checkouts/nope").status_code == 404


def test_reminders_go_once_only_to_unfinished_bags(client, sent):
    abandoned = _start(client)
    finished = _start(client, phone="9666666666", email="done@example.com")
    too_new = _start(client, phone="9777777777", email="new@example.com")
    for cid in (abandoned, finished):
        _age(client, cid, 3)
    order(client, checkout_id=finished, address=address(phone="9666666666"))
    assert client.post("/api/admin/reminders/run", headers={"x-admin-token": "wrong"}).status_code == 403
    r = client.post("/api/admin/reminders/run", headers=ADMIN).json()
    reminders = [m for m in sent if m["tag"] == "bag-reminder"]
    assert r["sent"] == 1 and [m["to"] for m in reminders] == ["meera@example.com"]
    assert f"/cart?restore={abandoned}" in reminders[0]["html"]
    assert client.post("/api/admin/reminders/run", headers=ADMIN).json()["sent"] == 0  # never twice
    assert too_new  # created just now, so not due yet


# ---------- Fit feedback ----------
def _delivered(client, sent, phone="9876543210"):
    o = order(client, address=address(phone=phone)).json()
    client.post(f"/api/admin/orders/{o['order_id']}/status", json={"status": "Delivered"}, headers=ADMIN)
    mail = next(m for m in reversed(sent) if m["tag"] == "status")
    token = mail["html"].split("token=")[1].split("'")[0].split("&")[0]
    return o, token


def test_delivered_email_asks_how_it_fit(client, sent):
    _, token = _delivered(client, sent)
    mail = next(m for m in sent if m["tag"] == "status")
    assert "HOW DID IT FIT" in mail["html"] and token


def test_fit_feedback_needs_the_token_and_feeds_the_product_score(client, sent):
    slug = PRODUCT["slug"]
    assert client.get(f"/api/products/{slug}/fit").json() == {"responses": 0, "enough": False}
    for i, fit in enumerate(["right", "right", "small"]):
        o, token = _delivered(client, sent, phone=f"98000000{i:02d}")
        assert client.get("/api/feedback", params={"order_id": o["order_id"], "token": "bad"}).status_code == 404
        form = client.get("/api/feedback", params={"order_id": o["order_id"], "token": token}).json()
        assert form["items"][0]["product_id"] == PRODUCT["id"] and not form["submitted"]
        r = client.post("/api/feedback", json={"order_id": o["order_id"], "token": token,
                                               "answers": [{"product_id": PRODUCT["id"], "fit": fit, "rating": 5}]})
        assert r.status_code == 200
    fit = client.get(f"/api/products/{slug}/fit").json()
    assert fit["enough"] and fit["true_to_size"] == 67 and fit["runs_small"] == 33 and fit["avg_rating"] == 5.0


# ---------- Drop alerts ----------
def test_next_drop_is_friday_8pm_ist():
    wed = datetime(2026, 10, 14, 6, 0, tzinfo=timezone.utc)
    d = growth.next_drop(wed).astimezone(growth.IST)
    assert d.weekday() == 4 and d.hour == 20 and d.day == 16
    after = growth.next_drop(datetime(2026, 10, 16, 15, 0, tzinfo=timezone.utc)).astimezone(growth.IST)
    assert after.day == 23


def test_drop_signup_validates_dedupes_and_sends_code(client, sent):
    assert client.post("/api/drop-alerts", json={"email": "fan@example.com"}).status_code == 400  # no consent
    assert client.post("/api/drop-alerts", json={"consent": True}).status_code == 400
    assert client.post("/api/drop-alerts", json={"email": "nope", "consent": True}).status_code == 400
    r = client.post("/api/drop-alerts", json={"email": "Fan@Example.com", "whatsapp": "+91 98765 43210", "consent": True}).json()
    assert r["code"] == "EARLYDROP" and r["subscribers"] == 1 and not r["already"]
    again = client.post("/api/drop-alerts", json={"email": "fan@example.com", "consent": True}).json()
    assert again["already"] and again["subscribers"] == 1
    assert [m["tag"] for m in sent] == ["drop-confirm"]
    info = client.get("/api/drop").json()
    assert info["collection"] == "anime-legends" and len(info["preview"]) == 4 and info["subscribers"] == 1
    listed = client.get("/api/admin/drop-alerts", headers=ADMIN).json()
    assert listed["count"] == 1 and listed["with_whatsapp"] == 1
    assert client.post("/api/coupon/validate", json={"code": "EARLYDROP", "subtotal": 2000}).json()["discount"] == 300
