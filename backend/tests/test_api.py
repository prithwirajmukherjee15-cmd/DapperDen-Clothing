"""Offline API tests — run with `pytest` from backend/, no MongoDB needed."""
import pytest

import server
from catalog import PRODUCTS

PRODUCT = PRODUCTS[0]
ADDRESS = {
    "name": "Test User", "phone": "9876543210", "email": "test@example.com",
    "pincode": "400001", "line": "1 Test Rd", "city": "Mumbai", "stateName": "Maharashtra",
}


def order_payload(**overrides):
    payload = {
        "items": [{"id": PRODUCT["id"], "size": PRODUCT["sizes"][0], "color": "Colour 1", "qty": 2}],
        "payment_method": "UPI",
        "address": ADDRESS,
    }
    payload.update(overrides)
    return payload


def test_order_is_priced_on_the_server(client):
    tampered = order_payload()
    tampered["items"][0].update({"price": 1, "name": "<b>free</b>"})
    tampered.update({"total": 1, "subtotal": 1, "discount": 999999})
    r = client.post("/api/orders", json=tampered)
    assert r.status_code == 200, r.text
    data = r.json()
    subtotal = PRODUCT["price"] * 2
    shipping = 0 if subtotal >= server.FREE_SHIPPING_MIN else server.SHIPPING_FEE
    assert data["subtotal"] == subtotal
    assert data["discount"] == 0
    assert data["prepaid_discount"] == server.PREPAID_DISCOUNT  # paid by UPI, not cash on delivery
    assert data["total"] == subtotal - server.PREPAID_DISCOUNT + shipping
    assert data["items"][0]["price"] == PRODUCT["price"]
    assert data["items"][0]["name"] == PRODUCT["name"]
    assert "_id" not in data


def test_order_applies_coupon_on_the_server(client):
    r = client.post("/api/orders", json=order_payload(coupon="dapper10"))
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["coupon"] == "DAPPER10"
    assert data["discount"] == round(data["subtotal"] * 10 / 100)


def test_order_rejects_invalid_coupon(client):
    r = client.post("/api/orders", json=order_payload(coupon="NOTREAL"))
    assert r.status_code == 400


def test_order_rejects_unknown_product_and_size(client):
    bad_id = order_payload(items=[{"id": "nope", "size": "M", "color": "x", "qty": 1}])
    assert client.post("/api/orders", json=bad_id).status_code == 400
    bad_size = order_payload(items=[{"id": PRODUCT["id"], "size": "XXXXL", "color": "x", "qty": 1}])
    assert client.post("/api/orders", json=bad_size).status_code == 400


def test_order_rejects_bad_quantity_and_empty_cart(client):
    zero = order_payload(items=[{"id": PRODUCT["id"], "size": PRODUCT["sizes"][0], "color": "x", "qty": 0}])
    assert client.post("/api/orders", json=zero).status_code == 422
    assert client.post("/api/orders", json=order_payload(items=[])).status_code == 422


def test_order_id_retries_on_collision(client, monkeypatch):
    ids = iter(["DD0000000001", "DD0000000001", "DD0000000002"])
    monkeypatch.setattr(server, "_new_order_id", lambda: next(ids))
    first = client.post("/api/orders", json=order_payload()).json()
    second = client.post("/api/orders", json=order_payload()).json()
    assert first["order_id"] == "DD0000000001"
    assert second["order_id"] == "DD0000000002"


def test_track_order(client):
    order = client.post("/api/orders", json=order_payload()).json()
    ok = client.get("/api/orders/track", params={"order_id": order["order_id"].lower(), "phone": "9876543210"})
    assert ok.status_code == 200 and ok.json()["order_id"] == order["order_id"]
    wrong = client.get("/api/orders/track", params={"order_id": order["order_id"], "phone": "1111111111"})
    assert wrong.status_code == 403


def test_coupon_validate_bad_subtotal_is_422_not_500(client):
    r = client.post("/api/coupon/validate", json={"code": "STREET20", "subtotal": "abc"})
    assert r.status_code == 422


def test_order_email_escapes_customer_input():
    import emails

    html = emails.receipt_html({
        "order_id": "DD1",
        "items": [{"name": "Tee", "image": "x.jpg", "size": "M", "color": "<script>", "qty": 1, "price": 10}],
        "address": {"name": "<a href='http://evil'>Click</a>", "line": "<img src=x>", "city": "C",
                    "stateName": "S", "pincode": "1", "phone": "9"},
    }, "https://shop.example")
    assert "<script>" not in html
    assert "<a href='http://evil'>" not in html
    assert "<img src=x>" not in html
    assert "&lt;img src=x&gt;" in html


@pytest.fixture
def sent(monkeypatch):
    """Capture outgoing emails instead of sending them."""
    log = []

    async def fake_send(to, subject, html_body, text_body=None, tag=""):
        log.append({"to": to, "subject": subject, "html": html_body, "text": text_body, "tag": tag})

    monkeypatch.setattr(server, "send_email", fake_send)
    monkeypatch.setattr(server, "ORDER_NOTIFY_EMAIL", "owner@example.com")
    return log


def test_order_sends_branded_receipt_and_owner_alert(client, sent):
    order = client.post("/api/orders", json=order_payload(coupon="DAPPER10")).json()
    receipt = next(m for m in sent if m["tag"] == "receipt")
    alert = next(m for m in sent if m["tag"] == "owner-alert")
    assert receipt["to"] == ADDRESS["email"]
    assert order["order_id"] in receipt["subject"]
    for text in ["DAPPER", "RECEIPT", PRODUCT["name"], "DAPPER10", "Total paid",
                 f"/track?order={order['order_id']}&amp;phone=9876543210"]:
        assert text in receipt["html"], text
    assert "Total paid" in receipt["text"]
    assert alert["to"] == "owner@example.com" and order["order_id"] in alert["subject"]


def test_cod_receipt_says_amount_due(client, sent):
    client.post("/api/orders", json=order_payload(payment_method="Cash on Delivery"))
    receipt = next(m for m in sent if m["tag"] == "receipt")
    assert "Amount due on delivery" in receipt["html"]
    assert "Total paid" not in receipt["html"]


def test_receipt_page_requires_matching_phone(client):
    order = client.post("/api/orders", json=order_payload()).json()
    ok = client.get("/api/orders/receipt", params={"order_id": order["order_id"], "phone": "9876543210"})
    assert ok.status_code == 200 and "text/html" in ok.headers["content-type"]
    assert "Print / Save as PDF" in ok.text and order["order_id"] in ok.text
    bad = client.get("/api/orders/receipt", params={"order_id": order["order_id"], "phone": "1111111111"})
    assert bad.status_code == 403


def test_admin_endpoints_disabled_without_token(client, monkeypatch):
    monkeypatch.setattr(server, "ADMIN_TOKEN", "")
    assert client.get("/api/admin/orders", headers={"x-admin-token": ""}).status_code == 403
    assert client.post("/api/admin/orders/DD1/status", json={"status": "Shipped"},
                       headers={"x-admin-token": ""}).status_code == 403


def test_admin_status_update_emails_customer(client, sent, monkeypatch):
    monkeypatch.setattr(server, "ADMIN_TOKEN", "s3cret")
    order = client.post("/api/orders", json=order_payload()).json()
    sent.clear()
    wrong = client.post(f"/api/admin/orders/{order['order_id']}/status", json={"status": "Shipped"},
                        headers={"x-admin-token": "nope"})
    assert wrong.status_code == 403
    bad = client.post(f"/api/admin/orders/{order['order_id']}/status", json={"status": "Lost"},
                      headers={"x-admin-token": "s3cret"})
    assert bad.status_code == 400
    r = client.post(f"/api/admin/orders/{order['order_id']}/status", json={"status": "Shipped"},
                    headers={"x-admin-token": "s3cret"})
    assert r.status_code == 200
    assert [m["tag"] for m in sent] == ["status"]
    assert "ON THE WAY" in sent[0]["html"]
    tracked = client.get("/api/orders/track", params={"order_id": order["order_id"], "phone": "9876543210"}).json()
    assert tracked["status"] == "Shipped"
    listed = client.get("/api/admin/orders", headers={"x-admin-token": "s3cret"}).json()
    assert listed[0]["order_id"] == order["order_id"]


def test_health_reports_db_status(client, monkeypatch):
    assert client.get("/api/health").json()["db"] == "ok"

    async def broken(name):
        from pymongo.errors import OperationFailure
        raise OperationFailure("bad auth : authentication failed", code=8000, details={"codeName": "AtlasError"})

    monkeypatch.setattr(client.fake_db, "command", broken)
    r = client.get("/api/health")
    assert r.status_code == 503
    assert r.json()["reason"] == "OperationFailure (code 8000: AtlasError)"
