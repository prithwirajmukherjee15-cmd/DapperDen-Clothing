#!/usr/bin/env python3
"""
Dapper Den Backend API Test Suite
Tests all backend routes with /api prefix
"""
import requests
import json
import sys
from datetime import datetime, timedelta, timezone
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment
ROOT_DIR = Path(__file__).parent / "backend"
load_dotenv(ROOT_DIR / '.env')

# Configuration
BASE_URL = "https://dapper-design-build.preview.emergentagent.com/api"
MONGO_URL = os.environ.get('MONGO_URL')
DB_NAME = os.environ.get('DB_NAME', 'test_database')

# Test results tracking
test_results = {
    "passed": [],
    "failed": [],
    "total": 0
}


def log_test(name, passed, details=""):
    """Log test result"""
    test_results["total"] += 1
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status}: {name}")
    if details:
        print(f"   {details}")
    
    if passed:
        test_results["passed"].append(name)
    else:
        test_results["failed"].append({"name": name, "details": details})


def test_catalog_products():
    """Test GET /api/products - should return 26 products"""
    try:
        resp = requests.get(f"{BASE_URL}/products", timeout=10)
        if resp.status_code == 200:
            products = resp.json()
            if isinstance(products, list) and len(products) == 26:
                log_test("GET /api/products returns 26 products", True)
                return True
            else:
                log_test("GET /api/products returns 26 products", False, 
                        f"Expected 26 products, got {len(products) if isinstance(products, list) else 'non-list'}")
                return False
        else:
            log_test("GET /api/products returns 26 products", False, 
                    f"Status {resp.status_code}: {resp.text[:200]}")
            return False
    except Exception as e:
        log_test("GET /api/products returns 26 products", False, str(e))
        return False


def test_catalog_filter_category():
    """Test GET /api/products?category=hoodies"""
    try:
        resp = requests.get(f"{BASE_URL}/products?category=hoodies", timeout=10)
        if resp.status_code == 200:
            products = resp.json()
            if isinstance(products, list) and len(products) > 0:
                # Check all are hoodies
                all_hoodies = all(p.get("category") == "hoodies" for p in products)
                if all_hoodies:
                    log_test("GET /api/products?category=hoodies filters correctly", True, 
                            f"Found {len(products)} hoodies")
                    return True
                else:
                    log_test("GET /api/products?category=hoodies filters correctly", False, 
                            "Some products are not hoodies")
                    return False
            else:
                log_test("GET /api/products?category=hoodies filters correctly", False, 
                        f"Expected non-empty array, got {len(products) if isinstance(products, list) else 'non-list'}")
                return False
        else:
            log_test("GET /api/products?category=hoodies filters correctly", False, 
                    f"Status {resp.status_code}")
            return False
    except Exception as e:
        log_test("GET /api/products?category=hoodies filters correctly", False, str(e))
        return False


def test_catalog_filter_collection():
    """Test GET /api/products?collection=cosmic-heroes"""
    try:
        resp = requests.get(f"{BASE_URL}/products?collection=cosmic-heroes", timeout=10)
        if resp.status_code == 200:
            products = resp.json()
            if isinstance(products, list) and len(products) > 0:
                all_cosmic = all(p.get("collection") == "cosmic-heroes" for p in products)
                if all_cosmic:
                    log_test("GET /api/products?collection=cosmic-heroes filters correctly", True, 
                            f"Found {len(products)} products")
                    return True
                else:
                    log_test("GET /api/products?collection=cosmic-heroes filters correctly", False, 
                            "Some products are not from cosmic-heroes")
                    return False
            else:
                log_test("GET /api/products?collection=cosmic-heroes filters correctly", False, 
                        "Expected non-empty array")
                return False
        else:
            log_test("GET /api/products?collection=cosmic-heroes filters correctly", False, 
                    f"Status {resp.status_code}")
            return False
    except Exception as e:
        log_test("GET /api/products?collection=cosmic-heroes filters correctly", False, str(e))
        return False


def test_product_by_slug():
    """Test GET /api/products/nebula-drift-tee"""
    try:
        resp = requests.get(f"{BASE_URL}/products/nebula-drift-tee", timeout=10)
        if resp.status_code == 200:
            product = resp.json()
            required_fields = ["slug", "name", "price", "images", "colors", "sizes"]
            has_all = all(field in product for field in required_fields)
            if has_all and product.get("slug") == "nebula-drift-tee":
                log_test("GET /api/products/nebula-drift-tee returns product", True)
                return True
            else:
                missing = [f for f in required_fields if f not in product]
                log_test("GET /api/products/nebula-drift-tee returns product", False, 
                        f"Missing fields: {missing}" if missing else "Slug mismatch")
                return False
        else:
            log_test("GET /api/products/nebula-drift-tee returns product", False, 
                    f"Status {resp.status_code}")
            return False
    except Exception as e:
        log_test("GET /api/products/nebula-drift-tee returns product", False, str(e))
        return False


def test_product_not_found():
    """Test GET /api/products/does-not-exist returns 404"""
    try:
        resp = requests.get(f"{BASE_URL}/products/does-not-exist", timeout=10)
        if resp.status_code == 404:
            log_test("GET /api/products/does-not-exist returns 404", True)
            return True
        else:
            log_test("GET /api/products/does-not-exist returns 404", False, 
                    f"Expected 404, got {resp.status_code}")
            return False
    except Exception as e:
        log_test("GET /api/products/does-not-exist returns 404", False, str(e))
        return False


def test_search_with_query():
    """Test GET /api/search?q=hoodie"""
    try:
        resp = requests.get(f"{BASE_URL}/search?q=hoodie", timeout=10)
        if resp.status_code == 200:
            results = resp.json()
            if isinstance(results, list) and len(results) > 0:
                log_test("GET /api/search?q=hoodie returns results", True, 
                        f"Found {len(results)} results")
                return True
            else:
                log_test("GET /api/search?q=hoodie returns results", False, 
                        "Expected non-empty array")
                return False
        else:
            log_test("GET /api/search?q=hoodie returns results", False, 
                    f"Status {resp.status_code}")
            return False
    except Exception as e:
        log_test("GET /api/search?q=hoodie returns results", False, str(e))
        return False


def test_search_empty():
    """Test GET /api/search?q= returns empty array"""
    try:
        resp = requests.get(f"{BASE_URL}/search?q=", timeout=10)
        if resp.status_code == 200:
            results = resp.json()
            if isinstance(results, list) and len(results) == 0:
                log_test("GET /api/search?q= returns empty array", True)
                return True
            else:
                log_test("GET /api/search?q= returns empty array", False, 
                        f"Expected empty array, got {len(results)} items")
                return False
        else:
            log_test("GET /api/search?q= returns empty array", False, 
                    f"Status {resp.status_code}")
            return False
    except Exception as e:
        log_test("GET /api/search?q= returns empty array", False, str(e))
        return False


def test_catalog_endpoint():
    """Test GET /api/catalog returns products, collections, categories"""
    try:
        resp = requests.get(f"{BASE_URL}/catalog", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            has_all = all(key in data for key in ["products", "collections", "categories"])
            if has_all:
                log_test("GET /api/catalog returns full catalog", True, 
                        f"Products: {len(data['products'])}, Collections: {len(data['collections'])}, Categories: {len(data['categories'])}")
                return True
            else:
                missing = [k for k in ["products", "collections", "categories"] if k not in data]
                log_test("GET /api/catalog returns full catalog", False, 
                        f"Missing keys: {missing}")
                return False
        else:
            log_test("GET /api/catalog returns full catalog", False, 
                    f"Status {resp.status_code}")
            return False
    except Exception as e:
        log_test("GET /api/catalog returns full catalog", False, str(e))
        return False


def test_coupon_valid_percent():
    """Test POST /api/coupon/validate with DAPPER10"""
    try:
        payload = {"code": "DAPPER10", "subtotal": 2000}
        resp = requests.post(f"{BASE_URL}/coupon/validate", json=payload, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if data.get("valid") and data.get("discount") == 200:
                log_test("POST /api/coupon/validate DAPPER10 (10%)", True, 
                        f"Discount: ₹{data['discount']}")
                return True
            else:
                log_test("POST /api/coupon/validate DAPPER10 (10%)", False, 
                        f"Expected valid=True, discount=200, got {data}")
                return False
        else:
            log_test("POST /api/coupon/validate DAPPER10 (10%)", False, 
                    f"Status {resp.status_code}")
            return False
    except Exception as e:
        log_test("POST /api/coupon/validate DAPPER10 (10%)", False, str(e))
        return False


def test_coupon_below_min():
    """Test POST /api/coupon/validate FLAT300 below minimum"""
    try:
        payload = {"code": "FLAT300", "subtotal": 1000}
        resp = requests.post(f"{BASE_URL}/coupon/validate", json=payload, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if not data.get("valid"):
                log_test("POST /api/coupon/validate FLAT300 below min", True, 
                        "Correctly rejected")
                return True
            else:
                log_test("POST /api/coupon/validate FLAT300 below min", False, 
                        "Should be invalid but got valid=True")
                return False
        else:
            log_test("POST /api/coupon/validate FLAT300 below min", False, 
                    f"Status {resp.status_code}")
            return False
    except Exception as e:
        log_test("POST /api/coupon/validate FLAT300 below min", False, str(e))
        return False


def test_coupon_valid_flat():
    """Test POST /api/coupon/validate FLAT300 above minimum"""
    try:
        payload = {"code": "FLAT300", "subtotal": 2000}
        resp = requests.post(f"{BASE_URL}/coupon/validate", json=payload, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if data.get("valid") and data.get("discount") == 300:
                log_test("POST /api/coupon/validate FLAT300 above min", True, 
                        f"Discount: ₹{data['discount']}")
                return True
            else:
                log_test("POST /api/coupon/validate FLAT300 above min", False, 
                        f"Expected valid=True, discount=300, got {data}")
                return False
        else:
            log_test("POST /api/coupon/validate FLAT300 above min", False, 
                    f"Status {resp.status_code}")
            return False
    except Exception as e:
        log_test("POST /api/coupon/validate FLAT300 above min", False, str(e))
        return False


def test_coupon_invalid():
    """Test POST /api/coupon/validate with invalid code"""
    try:
        payload = {"code": "NONSENSE", "subtotal": 2000}
        resp = requests.post(f"{BASE_URL}/coupon/validate", json=payload, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if not data.get("valid"):
                log_test("POST /api/coupon/validate invalid code", True, 
                        "Correctly rejected")
                return True
            else:
                log_test("POST /api/coupon/validate invalid code", False, 
                        "Should be invalid but got valid=True")
                return False
        else:
            log_test("POST /api/coupon/validate invalid code", False, 
                    f"Status {resp.status_code}")
            return False
    except Exception as e:
        log_test("POST /api/coupon/validate invalid code", False, str(e))
        return False


def test_auth_me_without_token():
    """Test GET /api/auth/me without auth returns 401"""
    try:
        resp = requests.get(f"{BASE_URL}/auth/me", timeout=10)
        if resp.status_code == 401:
            log_test("GET /api/auth/me without auth returns 401", True)
            return True
        else:
            log_test("GET /api/auth/me without auth returns 401", False, 
                    f"Expected 401, got {resp.status_code}")
            return False
    except Exception as e:
        log_test("GET /api/auth/me without auth returns 401", False, str(e))
        return False


def test_orders_without_token():
    """Test GET /api/orders without auth returns 401"""
    try:
        resp = requests.get(f"{BASE_URL}/orders", timeout=10)
        if resp.status_code == 401:
            log_test("GET /api/orders without auth returns 401", True)
            return True
        else:
            log_test("GET /api/orders without auth returns 401", False, 
                    f"Expected 401, got {resp.status_code}")
            return False
    except Exception as e:
        log_test("GET /api/orders without auth returns 401", False, str(e))
        return False


def seed_test_user():
    """Seed a test user and session in MongoDB"""
    try:
        client = MongoClient(MONGO_URL)
        db = client[DB_NAME]
        
        # Create test user
        user_id = f"test-user-{int(datetime.now().timestamp())}"
        email = f"test.user.{int(datetime.now().timestamp())}@example.com"
        session_token = f"test_session_{int(datetime.now().timestamp())}"
        
        # Insert user
        db.users.insert_one({
            "user_id": user_id,
            "email": email,
            "name": "Test User",
            "picture": "https://via.placeholder.com/150",
            "wishlist": [],
            "created_at": datetime.now(timezone.utc)
        })
        
        # Insert session
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        db.user_sessions.insert_one({
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": expires_at,
            "created_at": datetime.now(timezone.utc)
        })
        
        client.close()
        
        print(f"\n🔑 Test user seeded:")
        print(f"   User ID: {user_id}")
        print(f"   Email: {email}")
        print(f"   Session Token: {session_token}\n")
        
        return session_token, user_id
    except Exception as e:
        print(f"❌ Failed to seed test user: {e}")
        return None, None


def test_auth_me_with_token(token):
    """Test GET /api/auth/me with Bearer token"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        resp = requests.get(f"{BASE_URL}/auth/me", headers=headers, timeout=10)
        if resp.status_code == 200:
            user = resp.json()
            required_fields = ["user_id", "email", "name"]
            has_all = all(field in user for field in required_fields)
            if has_all:
                log_test("GET /api/auth/me with Bearer token", True, 
                        f"User: {user.get('email')}")
                return True
            else:
                missing = [f for f in required_fields if f not in user]
                log_test("GET /api/auth/me with Bearer token", False, 
                        f"Missing fields: {missing}")
                return False
        else:
            log_test("GET /api/auth/me with Bearer token", False, 
                    f"Status {resp.status_code}: {resp.text[:200]}")
            return False
    except Exception as e:
        log_test("GET /api/auth/me with Bearer token", False, str(e))
        return False


def test_create_order(token):
    """Test POST /api/orders with Bearer token"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        payload = {
            "items": [
                {
                    "id": "nebula-drift-tee",
                    "name": "Nebula Drift Oversized Tee",
                    "slug": "nebula-drift-tee",
                    "image": "https://images.pexels.com/photos/37186394/pexels-photo-37186394.jpeg",
                    "price": 1299,
                    "size": "L",
                    "color": "Black",
                    "qty": 2
                }
            ],
            "total": 2598,
            "subtotal": 2598,
            "discount": 0,
            "shipping": 0,
            "coupon": None,
            "payment_method": "COD",
            "address": {
                "name": "John Doe",
                "phone": "9876543210",
                "line1": "123 Street",
                "city": "Mumbai",
                "state": "Maharashtra",
                "pincode": "400001"
            }
        }
        resp = requests.post(f"{BASE_URL}/orders", json=payload, headers=headers, timeout=10)
        if resp.status_code == 200:
            order = resp.json()
            if order.get("order_id") and order.get("status") == "Confirmed":
                log_test("POST /api/orders creates order", True, 
                        f"Order ID: {order.get('order_id')}")
                return True, order.get("order_id")
            else:
                log_test("POST /api/orders creates order", False, 
                        f"Missing order_id or status != Confirmed: {order}")
                return False, None
        else:
            log_test("POST /api/orders creates order", False, 
                    f"Status {resp.status_code}: {resp.text[:200]}")
            return False, None
    except Exception as e:
        log_test("POST /api/orders creates order", False, str(e))
        return False, None


def test_list_orders(token):
    """Test GET /api/orders with Bearer token"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        resp = requests.get(f"{BASE_URL}/orders", headers=headers, timeout=10)
        if resp.status_code == 200:
            orders = resp.json()
            if isinstance(orders, list) and len(orders) > 0:
                log_test("GET /api/orders lists orders", True, 
                        f"Found {len(orders)} order(s)")
                return True
            else:
                log_test("GET /api/orders lists orders", False, 
                        "Expected non-empty array")
                return False
        else:
            log_test("GET /api/orders lists orders", False, 
                    f"Status {resp.status_code}: {resp.text[:200]}")
            return False
    except Exception as e:
        log_test("GET /api/orders lists orders", False, str(e))
        return False


def test_wishlist_get(token):
    """Test GET /api/wishlist with Bearer token"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        resp = requests.get(f"{BASE_URL}/wishlist", headers=headers, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if "wishlist" in data and isinstance(data["wishlist"], list):
                log_test("GET /api/wishlist returns wishlist", True, 
                        f"Wishlist: {data['wishlist']}")
                return True
            else:
                log_test("GET /api/wishlist returns wishlist", False, 
                        f"Expected {{'wishlist': []}}, got {data}")
                return False
        else:
            log_test("GET /api/wishlist returns wishlist", False, 
                    f"Status {resp.status_code}: {resp.text[:200]}")
            return False
    except Exception as e:
        log_test("GET /api/wishlist returns wishlist", False, str(e))
        return False


def test_wishlist_toggle_add(token):
    """Test POST /api/wishlist/toggle to add item"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        payload = {"product_id": "orbit-hoodie"}
        resp = requests.post(f"{BASE_URL}/wishlist/toggle", json=payload, headers=headers, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if "wishlist" in data and "orbit-hoodie" in data["wishlist"]:
                log_test("POST /api/wishlist/toggle adds item", True, 
                        f"Wishlist: {data['wishlist']}")
                return True
            else:
                log_test("POST /api/wishlist/toggle adds item", False, 
                        f"Expected orbit-hoodie in wishlist, got {data}")
                return False
        else:
            log_test("POST /api/wishlist/toggle adds item", False, 
                    f"Status {resp.status_code}: {resp.text[:200]}")
            return False
    except Exception as e:
        log_test("POST /api/wishlist/toggle adds item", False, str(e))
        return False


def test_wishlist_toggle_remove(token):
    """Test POST /api/wishlist/toggle to remove item"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        payload = {"product_id": "orbit-hoodie"}
        resp = requests.post(f"{BASE_URL}/wishlist/toggle", json=payload, headers=headers, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if "wishlist" in data and "orbit-hoodie" not in data["wishlist"]:
                log_test("POST /api/wishlist/toggle removes item", True, 
                        f"Wishlist: {data['wishlist']}")
                return True
            else:
                log_test("POST /api/wishlist/toggle removes item", False, 
                        f"Expected orbit-hoodie removed, got {data}")
                return False
        else:
            log_test("POST /api/wishlist/toggle removes item", False, 
                    f"Status {resp.status_code}: {resp.text[:200]}")
            return False
    except Exception as e:
        log_test("POST /api/wishlist/toggle removes item", False, str(e))
        return False


def print_summary():
    """Print test summary"""
    print("\n" + "="*70)
    print("TEST SUMMARY")
    print("="*70)
    print(f"Total Tests: {test_results['total']}")
    print(f"Passed: {len(test_results['passed'])} ✅")
    print(f"Failed: {len(test_results['failed'])} ❌")
    
    if test_results['failed']:
        print("\n❌ FAILED TESTS:")
        for fail in test_results['failed']:
            print(f"  • {fail['name']}")
            if fail['details']:
                print(f"    {fail['details']}")
    
    print("="*70 + "\n")
    
    return len(test_results['failed']) == 0


def main():
    """Run all tests"""
    print("\n" + "="*70)
    print("DAPPER DEN BACKEND API TEST SUITE")
    print("="*70 + "\n")
    
    # 1. CATALOG TESTS (public, no auth)
    print("📦 CATALOG TESTS")
    print("-" * 70)
    test_catalog_products()
    test_catalog_filter_category()
    test_catalog_filter_collection()
    test_product_by_slug()
    test_product_not_found()
    test_search_with_query()
    test_search_empty()
    test_catalog_endpoint()
    
    # 2. COUPON TESTS
    print("\n🎟️  COUPON TESTS")
    print("-" * 70)
    test_coupon_valid_percent()
    test_coupon_below_min()
    test_coupon_valid_flat()
    test_coupon_invalid()
    
    # 3. AUTH TESTS (without token)
    print("\n🔒 AUTH TESTS (without token)")
    print("-" * 70)
    test_auth_me_without_token()
    test_orders_without_token()
    
    # 4. SEED TEST USER
    print("\n👤 SEEDING TEST USER")
    print("-" * 70)
    token, user_id = seed_test_user()
    
    if not token:
        print("❌ Cannot continue with auth-protected tests without token")
        print_summary()
        sys.exit(1)
    
    # 5. AUTH TESTS (with token)
    print("🔓 AUTH TESTS (with Bearer token)")
    print("-" * 70)
    test_auth_me_with_token(token)
    
    # 6. ORDERS TESTS
    print("\n📋 ORDERS TESTS")
    print("-" * 70)
    test_create_order(token)
    test_list_orders(token)
    
    # 7. WISHLIST TESTS
    print("\n❤️  WISHLIST TESTS")
    print("-" * 70)
    test_wishlist_get(token)
    test_wishlist_toggle_add(token)
    test_wishlist_toggle_remove(token)
    
    # Print summary
    all_passed = print_summary()
    
    sys.exit(0 if all_passed else 1)


if __name__ == "__main__":
    main()
