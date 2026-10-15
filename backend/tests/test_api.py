"""Offline API tests — run with `pytest` from backend/, no MongoDB needed."""
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
    assert data["total"] == subtotal + shipping
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
    html = server._order_email_html({
        "order_id": "DD1",
        "items": [{"name": "Tee", "image": "x.jpg", "size": "M", "color": "<script>", "qty": 1, "price": 10}],
        "address": {"name": "<a href='http://evil'>Click</a>", "line": "<img src=x>", "city": "C",
                    "stateName": "S", "pincode": "1", "phone": "9"},
    })
    assert "<script>" not in html
    assert "<a href='http://evil'>" not in html
    assert "<img src=x>" not in html
    assert "&lt;img src=x&gt;" in html
