"""
Live regression tests for a running Dapper Den backend (real MongoDB).
Not run by default — point BACKEND_URL at a deployment and run:
    BACKEND_URL=https://your-api.onrender.com pytest tests/test_backend_regression.py -o addopts=""
Note: this creates a real test order in the target database.
"""
import os
import pytest
import requests

BASE_URL = os.environ.get('BACKEND_URL', 'http://localhost:8001').rstrip('/')
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


# ---------- Root ----------
def test_root(s):
    r = s.get(f"{API}/")
    assert r.status_code == 200
    assert r.json().get("message") == "Dapper Den API"


# ---------- Products ----------
def test_products_list(s):
    r = s.get(f"{API}/products")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list) and len(data) > 0
    assert "slug" in data[0] and "name" in data[0]


def test_products_gender_filter(s):
    r = s.get(f"{API}/products", params={"gender": "women"})
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    if data:
        assert all(p.get("gender") == "women" for p in data)


def test_products_category_filter(s):
    # pick a category dynamically
    all_p = s.get(f"{API}/products").json()
    cat = all_p[0]["category"]
    r = s.get(f"{API}/products", params={"category": cat})
    assert r.status_code == 200
    data = r.json()
    assert all(p["category"] == cat for p in data)


def test_product_detail_known_slug(s):
    r = s.get(f"{API}/products/dapper-design-build")
    # if this specific slug doesn't exist, fall back to first product
    if r.status_code == 404:
        first = s.get(f"{API}/products").json()[0]
        r = s.get(f"{API}/products/{first['slug']}")
    assert r.status_code == 200
    assert "slug" in r.json()


def test_product_detail_unknown_slug(s):
    r = s.get(f"{API}/products/this-slug-does-not-exist-xyz")
    assert r.status_code == 404


# ---------- Search ----------
def test_search_returns_matches(s):
    r = s.get(f"{API}/search", params={"q": "tee"})
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_search_empty_query(s):
    r = s.get(f"{API}/search", params={"q": ""})
    assert r.status_code == 200
    assert r.json() == []


# ---------- Coupons ----------
@pytest.mark.parametrize("code", ["DAPPER10", "STREET20", "FLAT300"])
def test_coupon_valid_codes(s, code):
    r = s.post(f"{API}/coupon/validate", json={"code": code, "subtotal": 5000})
    assert r.status_code == 200
    data = r.json()
    assert data.get("valid") is True, f"{code} rejected: {data}"
    assert data.get("code") == code
    assert isinstance(data.get("discount"), (int, float))
    assert data["discount"] > 0


def test_coupon_invalid_code(s):
    r = s.post(f"{API}/coupon/validate", json={"code": "NOTREAL", "subtotal": 5000})
    assert r.status_code == 200
    assert r.json().get("valid") is False


# ---------- Orders (Mongo write + read) ----------
@pytest.fixture(scope="module")
def created_order(s):
    product = s.get(f"{API}/products").json()[0]
    payload = {
        "items": [{"id": product["id"], "size": product["sizes"][0], "color": "Colour 1", "qty": 2}],
        "coupon": None,
        "payment_method": "COD",
        "address": {
            "name": "TEST User", "email": "test@example.com",
            "phone": "9876543210", "line": "1 Test Rd",
            "city": "Mumbai", "stateName": "MH", "pincode": "400001"
        }
    }
    r = s.post(f"{API}/orders", json=payload)
    assert r.status_code == 200, f"Order create failed: {r.status_code} {r.text}"
    data = r.json()
    assert data.get("order_id", "").startswith("DD")
    assert data["status"] == "Confirmed"
    assert data["subtotal"] == product["price"] * 2
    assert "_id" not in data  # Mongo _id must not leak
    return data


def test_create_order_writes_to_mongo(created_order):
    assert created_order["order_id"]


def test_track_order_success(s, created_order):
    r = s.get(f"{API}/orders/track", params={
        "order_id": created_order["order_id"], "phone": "9876543210"
    })
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["order_id"] == created_order["order_id"]
    assert "_id" not in data
    assert data["address"]["phone"] == "9876543210"


def test_track_order_wrong_phone(s, created_order):
    r = s.get(f"{API}/orders/track", params={
        "order_id": created_order["order_id"], "phone": "1111111111"
    })
    assert r.status_code == 403


def test_track_order_unknown_id(s):
    r = s.get(f"{API}/orders/track", params={
        "order_id": "DD000000", "phone": "9876543210"
    })
    assert r.status_code == 404


def test_track_order_lowercase_id_normalized(s, created_order):
    r = s.get(f"{API}/orders/track", params={
        "order_id": created_order["order_id"].lower(), "phone": "9876543210"
    })
    assert r.status_code == 200


# ---------- Removed auth endpoints ----------
def test_auth_me_removed(s):
    r = s.get(f"{API}/auth/me")
    assert r.status_code == 404
