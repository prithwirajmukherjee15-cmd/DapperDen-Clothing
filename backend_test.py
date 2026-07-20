#!/usr/bin/env python3
"""
Dapper Den Backend API Test Suite - Regression + New Verification
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


# ============================================================================
# NEW TESTS - Bug Fix Verification
# ============================================================================

def test_products_count_60():
    """NEW: Test GET /api/products returns exactly 60 products"""
    try:
        resp = requests.get(f"{BASE_URL}/products", timeout=10)
        if resp.status_code == 200:
            products = resp.json()
            if isinstance(products, list) and len(products) == 60:
                log_test("NEW: GET /api/products returns exactly 60 products", True)
                return True, products
            else:
                log_test("NEW: GET /api/products returns exactly 60 products", False, 
                        f"Expected 60 products, got {len(products) if isinstance(products, list) else 'non-list'}")
                return False, []
        else:
            log_test("NEW: GET /api/products returns exactly 60 products", False, 
                    f"Status {resp.status_code}: {resp.text[:200]}")
            return False, []
    except Exception as e:
        log_test("NEW: GET /api/products returns exactly 60 products", False, str(e))
        return False, []


def test_category_filters():
    """NEW: Test each category returns exactly 10 products"""
    categories = ["t-shirts", "oversized", "hoodies", "joggers", "shirts", "accessories"]
    all_passed = True
    
    for category in categories:
        try:
            resp = requests.get(f"{BASE_URL}/products?category={category}", timeout=10)
            if resp.status_code == 200:
                products = resp.json()
                if isinstance(products, list) and len(products) == 10:
                    # Verify all products belong to this category
                    all_match = all(p.get("category") == category for p in products)
                    if all_match:
                        log_test(f"NEW: GET /api/products?category={category} returns exactly 10", True)
                    else:
                        log_test(f"NEW: GET /api/products?category={category} returns exactly 10", False, 
                                "Some products don't match category")
                        all_passed = False
                else:
                    log_test(f"NEW: GET /api/products?category={category} returns exactly 10", False, 
                            f"Expected 10 products, got {len(products) if isinstance(products, list) else 'non-list'}")
                    all_passed = False
            else:
                log_test(f"NEW: GET /api/products?category={category} returns exactly 10", False, 
                        f"Status {resp.status_code}")
                all_passed = False
        except Exception as e:
            log_test(f"NEW: GET /api/products?category={category} returns exactly 10", False, str(e))
            all_passed = False
    
    return all_passed


def test_no_duplicate_primary_images(products):
    """NEW: Test no duplicate PRIMARY images (images[0])"""
    try:
        if not products:
            log_test("NEW: No duplicate PRIMARY images", False, "No products provided")
            return False
        
        primary_images = []
        for p in products:
            images = p.get("images", [])
            if images and len(images) > 0:
                primary_images.append(images[0])
        
        # Check for duplicates
        unique_images = set(primary_images)
        
        if len(primary_images) == 60 and len(unique_images) == 60:
            log_test("NEW: No duplicate PRIMARY images", True, 
                    f"All 60 products have unique primary images")
            return True
        else:
            duplicates = len(primary_images) - len(unique_images)
            log_test("NEW: No duplicate PRIMARY images", False, 
                    f"Found {duplicates} duplicate(s). Total: {len(primary_images)}, Unique: {len(unique_images)}")
            return False
    except Exception as e:
        log_test("NEW: No duplicate PRIMARY images", False, str(e))
        return False


def test_new_slugs():
    """NEW: Test sample new slugs resolve correctly"""
    slugs = [
        "titan-oversized",
        "shogun-hoodie", 
        "ninja-jogger",
        "sensei-shirt",
        "neon-shades",
        "volt-sneakers",
        "orbit-beanie"
    ]
    
    all_passed = True
    
    for slug in slugs:
        try:
            resp = requests.get(f"{BASE_URL}/products/{slug}", timeout=10)
            if resp.status_code == 200:
                product = resp.json()
                required_fields = ["slug", "name", "price", "images", "colors", "sizes"]
                has_all = all(field in product for field in required_fields)
                if has_all and product.get("slug") == slug:
                    log_test(f"NEW: GET /api/products/{slug} returns valid product", True)
                else:
                    log_test(f"NEW: GET /api/products/{slug} returns valid product", False, 
                            "Missing required fields or slug mismatch")
                    all_passed = False
            else:
                log_test(f"NEW: GET /api/products/{slug} returns valid product", False, 
                        f"Status {resp.status_code}")
                all_passed = False
        except Exception as e:
            log_test(f"NEW: GET /api/products/{slug} returns valid product", False, str(e))
            all_passed = False
    
    return all_passed


def test_nonexistent_slug():
    """NEW: Test non-existent slug returns 404"""
    try:
        resp = requests.get(f"{BASE_URL}/products/does-not-exist-slug-xyz", timeout=10)
        if resp.status_code == 404:
            log_test("NEW: Non-existent slug returns 404", True)
            return True
        else:
            log_test("NEW: Non-existent slug returns 404", False, 
                    f"Expected 404, got {resp.status_code}")
            return False
    except Exception as e:
        log_test("NEW: Non-existent slug returns 404", False, str(e))
        return False


def test_collection_cosmic_heroes():
    """NEW: Test GET /api/products?collection=cosmic-heroes returns only that collection"""
    try:
        resp = requests.get(f"{BASE_URL}/products?collection=cosmic-heroes", timeout=10)
        if resp.status_code == 200:
            products = resp.json()
            if isinstance(products, list) and len(products) > 0:
                all_cosmic = all(p.get("collection") == "cosmic-heroes" for p in products)
                if all_cosmic:
                    log_test("NEW: GET /api/products?collection=cosmic-heroes filters correctly", True, 
                            f"Found {len(products)} products")
                    return True
                else:
                    log_test("NEW: GET /api/products?collection=cosmic-heroes filters correctly", False, 
                            "Some products are not from cosmic-heroes collection")
                    return False
            else:
                log_test("NEW: GET /api/products?collection=cosmic-heroes filters correctly", False, 
                        "Expected non-empty array")
                return False
        else:
            log_test("NEW: GET /api/products?collection=cosmic-heroes filters correctly", False, 
                    f"Status {resp.status_code}")
            return False
    except Exception as e:
        log_test("NEW: GET /api/products?collection=cosmic-heroes filters correctly", False, str(e))
        return False


# ============================================================================
# REGRESSION TESTS
# ============================================================================

def test_search_with_query():
    """REGRESSION: Test GET /api/search?q=hoodie returns non-empty"""
    try:
        resp = requests.get(f"{BASE_URL}/search?q=hoodie", timeout=10)
        if resp.status_code == 200:
            results = resp.json()
            if isinstance(results, list) and len(results) > 0:
                log_test("REGRESSION: GET /api/search?q=hoodie returns results", True, 
                        f"Found {len(results)} results")
                return True
            else:
                log_test("REGRESSION: GET /api/search?q=hoodie returns results", False, 
                        "Expected non-empty array")
                return False
        else:
            log_test("REGRESSION: GET /api/search?q=hoodie returns results", False, 
                    f"Status {resp.status_code}")
            return False
    except Exception as e:
        log_test("REGRESSION: GET /api/search?q=hoodie returns results", False, str(e))
        return False


def test_search_empty():
    """REGRESSION: Test GET /api/search?q= returns empty array"""
    try:
        resp = requests.get(f"{BASE_URL}/search?q=", timeout=10)
        if resp.status_code == 200:
            results = resp.json()
            if isinstance(results, list) and len(results) == 0:
                log_test("REGRESSION: GET /api/search?q= returns empty array", True)
                return True
            else:
                log_test("REGRESSION: GET /api/search?q= returns empty array", False, 
                        f"Expected empty array, got {len(results)} items")
                return False
        else:
            log_test("REGRESSION: GET /api/search?q= returns empty array", False, 
                    f"Status {resp.status_code}")
            return False
    except Exception as e:
        log_test("REGRESSION: GET /api/search?q= returns empty array", False, str(e))
        return False


def test_coupon_dapper10():
    """REGRESSION: Test POST /api/coupon/validate with DAPPER10"""
    try:
        payload = {"code": "DAPPER10", "subtotal": 2000}
        resp = requests.post(f"{BASE_URL}/coupon/validate", json=payload, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if data.get("valid") and data.get("discount") == 200:
                log_test("REGRESSION: DAPPER10 subtotal 2000 -> valid, discount 200", True)
                return True
            else:
                log_test("REGRESSION: DAPPER10 subtotal 2000 -> valid, discount 200", False, 
                        f"Expected valid=True, discount=200, got {data}")
                return False
        else:
            log_test("REGRESSION: DAPPER10 subtotal 2000 -> valid, discount 200", False, 
                    f"Status {resp.status_code}")
            return False
    except Exception as e:
        log_test("REGRESSION: DAPPER10 subtotal 2000 -> valid, discount 200", False, str(e))
        return False


def test_coupon_flat300_below_min():
    """REGRESSION: Test POST /api/coupon/validate FLAT300 below minimum"""
    try:
        payload = {"code": "FLAT300", "subtotal": 1000}
        resp = requests.post(f"{BASE_URL}/coupon/validate", json=payload, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if not data.get("valid"):
                log_test("REGRESSION: FLAT300 subtotal 1000 -> invalid", True)
                return True
            else:
                log_test("REGRESSION: FLAT300 subtotal 1000 -> invalid", False, 
                        "Should be invalid but got valid=True")
                return False
        else:
            log_test("REGRESSION: FLAT300 subtotal 1000 -> invalid", False, 
                    f"Status {resp.status_code}")
            return False
    except Exception as e:
        log_test("REGRESSION: FLAT300 subtotal 1000 -> invalid", False, str(e))
        return False


def test_coupon_flat300_above_min():
    """REGRESSION: Test POST /api/coupon/validate FLAT300 above minimum"""
    try:
        payload = {"code": "FLAT300", "subtotal": 2000}
        resp = requests.post(f"{BASE_URL}/coupon/validate", json=payload, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if data.get("valid") and data.get("discount") == 300:
                log_test("REGRESSION: FLAT300 subtotal 2000 -> valid, discount 300", True)
                return True
            else:
                log_test("REGRESSION: FLAT300 subtotal 2000 -> valid, discount 300", False, 
                        f"Expected valid=True, discount=300, got {data}")
                return False
        else:
            log_test("REGRESSION: FLAT300 subtotal 2000 -> valid, discount 300", False, 
                    f"Status {resp.status_code}")
            return False
    except Exception as e:
        log_test("REGRESSION: FLAT300 subtotal 2000 -> valid, discount 300", False, str(e))
        return False


def test_coupon_invalid():
    """REGRESSION: Test POST /api/coupon/validate with bogus code"""
    try:
        payload = {"code": "BOGUS123", "subtotal": 2000}
        resp = requests.post(f"{BASE_URL}/coupon/validate", json=payload, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if not data.get("valid"):
                log_test("REGRESSION: Bogus coupon -> invalid", True)
                return True
            else:
                log_test("REGRESSION: Bogus coupon -> invalid", False, 
                        "Should be invalid but got valid=True")
                return False
        else:
            log_test("REGRESSION: Bogus coupon -> invalid", False, 
                    f"Status {resp.status_code}")
            return False
    except Exception as e:
        log_test("REGRESSION: Bogus coupon -> invalid", False, str(e))
        return False


def test_auth_me_without_token():
    """REGRESSION: Test GET /api/auth/me without token returns 401"""
    try:
        resp = requests.get(f"{BASE_URL}/auth/me", timeout=10)
        if resp.status_code == 401:
            log_test("REGRESSION: GET /api/auth/me without token -> 401", True)
            return True
        else:
            log_test("REGRESSION: GET /api/auth/me without token -> 401", False, 
                    f"Expected 401, got {resp.status_code}")
            return False
    except Exception as e:
        log_test("REGRESSION: GET /api/auth/me without token -> 401", False, str(e))
        return False


def test_orders_without_token():
    """REGRESSION: Test GET /api/orders without token returns 401"""
    try:
        resp = requests.get(f"{BASE_URL}/orders", timeout=10)
        if resp.status_code == 401:
            log_test("REGRESSION: GET /api/orders without token -> 401", True)
            return True
        else:
            log_test("REGRESSION: GET /api/orders without token -> 401", False, 
                    f"Expected 401, got {resp.status_code}")
            return False
    except Exception as e:
        log_test("REGRESSION: GET /api/orders without token -> 401", False, str(e))
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
    """REGRESSION: Test GET /api/auth/me with Bearer token"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        resp = requests.get(f"{BASE_URL}/auth/me", headers=headers, timeout=10)
        if resp.status_code == 200:
            user = resp.json()
            required_fields = ["user_id", "email", "name"]
            has_all = all(field in user for field in required_fields)
            if has_all:
                log_test("REGRESSION: GET /api/auth/me with token returns user", True)
                return True
            else:
                missing = [f for f in required_fields if f not in user]
                log_test("REGRESSION: GET /api/auth/me with token returns user", False, 
                        f"Missing fields: {missing}")
                return False
        else:
            log_test("REGRESSION: GET /api/auth/me with token returns user", False, 
                    f"Status {resp.status_code}: {resp.text[:200]}")
            return False
    except Exception as e:
        log_test("REGRESSION: GET /api/auth/me with token returns user", False, str(e))
        return False


def test_create_order(token):
    """REGRESSION: Test POST /api/orders with Bearer token"""
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
                "name": "Arjun Mehta",
                "phone": "9876543210",
                "line1": "456 MG Road",
                "city": "Mumbai",
                "state": "Maharashtra",
                "pincode": "400001"
            }
        }
        resp = requests.post(f"{BASE_URL}/orders", json=payload, headers=headers, timeout=10)
        if resp.status_code == 200:
            order = resp.json()
            if order.get("order_id") and order.get("status") == "Confirmed":
                log_test("REGRESSION: POST /api/orders creates order (order_id, status Confirmed)", True, 
                        f"Order ID: {order.get('order_id')}")
                return True
            else:
                log_test("REGRESSION: POST /api/orders creates order (order_id, status Confirmed)", False, 
                        f"Missing order_id or status != Confirmed: {order}")
                return False
        else:
            log_test("REGRESSION: POST /api/orders creates order (order_id, status Confirmed)", False, 
                    f"Status {resp.status_code}: {resp.text[:200]}")
            return False
    except Exception as e:
        log_test("REGRESSION: POST /api/orders creates order (order_id, status Confirmed)", False, str(e))
        return False


def test_list_orders(token):
    """REGRESSION: Test GET /api/orders with Bearer token"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        resp = requests.get(f"{BASE_URL}/orders", headers=headers, timeout=10)
        if resp.status_code == 200:
            orders = resp.json()
            if isinstance(orders, list) and len(orders) > 0:
                log_test("REGRESSION: GET /api/orders lists orders", True, 
                        f"Found {len(orders)} order(s)")
                return True
            else:
                log_test("REGRESSION: GET /api/orders lists orders", False, 
                        "Expected non-empty array")
                return False
        else:
            log_test("REGRESSION: GET /api/orders lists orders", False, 
                    f"Status {resp.status_code}: {resp.text[:200]}")
            return False
    except Exception as e:
        log_test("REGRESSION: GET /api/orders lists orders", False, str(e))
        return False


def test_wishlist_toggle_add(token):
    """REGRESSION: Test POST /api/wishlist/toggle to add item"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        payload = {"product_id": "orbit-hoodie"}
        resp = requests.post(f"{BASE_URL}/wishlist/toggle", json=payload, headers=headers, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if "wishlist" in data and "orbit-hoodie" in data["wishlist"]:
                log_test("REGRESSION: Wishlist toggle add works", True)
                return True
            else:
                log_test("REGRESSION: Wishlist toggle add works", False, 
                        f"Expected orbit-hoodie in wishlist, got {data}")
                return False
        else:
            log_test("REGRESSION: Wishlist toggle add works", False, 
                    f"Status {resp.status_code}: {resp.text[:200]}")
            return False
    except Exception as e:
        log_test("REGRESSION: Wishlist toggle add works", False, str(e))
        return False


def test_wishlist_toggle_remove(token):
    """REGRESSION: Test POST /api/wishlist/toggle to remove item"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        payload = {"product_id": "orbit-hoodie"}
        resp = requests.post(f"{BASE_URL}/wishlist/toggle", json=payload, headers=headers, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if "wishlist" in data and "orbit-hoodie" not in data["wishlist"]:
                log_test("REGRESSION: Wishlist toggle remove works", True)
                return True
            else:
                log_test("REGRESSION: Wishlist toggle remove works", False, 
                        f"Expected orbit-hoodie removed, got {data}")
                return False
        else:
            log_test("REGRESSION: Wishlist toggle remove works", False, 
                    f"Status {resp.status_code}: {resp.text[:200]}")
            return False
    except Exception as e:
        log_test("REGRESSION: Wishlist toggle remove works", False, str(e))
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
    print("Regression + New Verification")
    print("="*70 + "\n")
    
    # ========================================================================
    # NEW TESTS - Bug Fix Verification
    # ========================================================================
    print("🆕 NEW TESTS - Bug Fix Verification")
    print("-" * 70)
    
    # 1. Test 60 products
    passed, products = test_products_count_60()
    
    # 2. Test category filters (10 each)
    test_category_filters()
    
    # 3. Test no duplicate primary images
    if products:
        test_no_duplicate_primary_images(products)
    
    # 4. Test new slugs
    test_new_slugs()
    
    # 5. Test non-existent slug
    test_nonexistent_slug()
    
    # 6. Test collection filter
    test_collection_cosmic_heroes()
    
    # ========================================================================
    # REGRESSION TESTS
    # ========================================================================
    print("\n🔄 REGRESSION TESTS")
    print("-" * 70)
    
    # 7. Search tests
    test_search_with_query()
    test_search_empty()
    
    # 8. Coupon tests
    test_coupon_dapper10()
    test_coupon_flat300_below_min()
    test_coupon_flat300_above_min()
    test_coupon_invalid()
    
    # 9. Auth protection tests (without token)
    test_auth_me_without_token()
    test_orders_without_token()
    
    # 10. Seed test user
    print("\n👤 SEEDING TEST USER")
    print("-" * 70)
    token, user_id = seed_test_user()
    
    if not token:
        print("❌ Cannot continue with auth-protected tests without token")
        print_summary()
        sys.exit(1)
    
    # 11. Auth tests with token
    print("🔓 AUTH TESTS (with Bearer token)")
    print("-" * 70)
    test_auth_me_with_token(token)
    
    # 12. Orders tests
    test_create_order(token)
    test_list_orders(token)
    
    # 13. Wishlist tests
    test_wishlist_toggle_add(token)
    test_wishlist_toggle_remove(token)
    
    # Print summary
    all_passed = print_summary()
    
    sys.exit(0 if all_passed else 1)


if __name__ == "__main__":
    main()
