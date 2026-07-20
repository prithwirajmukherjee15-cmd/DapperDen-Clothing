#!/usr/bin/env python3
"""
Dapper Den Backend API Test Suite - WOMEN & KIDS Sections Verification
Tests all backend routes with /api prefix for 115 products (men 60, women 32, kids 23)
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
# NEW TESTS - WOMEN & KIDS Sections Verification
# ============================================================================

def test_products_count_115():
    """NEW: Test GET /api/products returns exactly 115 products"""
    try:
        resp = requests.get(f"{BASE_URL}/products", timeout=10)
        if resp.status_code == 200:
            products = resp.json()
            if isinstance(products, list) and len(products) == 115:
                log_test("NEW: GET /api/products returns exactly 115 products", True)
                return True, products
            else:
                log_test("NEW: GET /api/products returns exactly 115 products", False, 
                        f"Expected 115 products, got {len(products) if isinstance(products, list) else 'non-list'}")
                return False, []
        else:
            log_test("NEW: GET /api/products returns exactly 115 products", False, 
                    f"Status {resp.status_code}: {resp.text[:200]}")
            return False, []
    except Exception as e:
        log_test("NEW: GET /api/products returns exactly 115 products", False, str(e))
        return False, []


def test_gender_filters():
    """NEW: Test gender filters - men (60), women (32), kids (23)"""
    gender_counts = {"men": 60, "women": 32, "kids": 23}
    all_passed = True
    
    for gender, expected_count in gender_counts.items():
        try:
            resp = requests.get(f"{BASE_URL}/products?gender={gender}", timeout=10)
            if resp.status_code == 200:
                products = resp.json()
                if isinstance(products, list) and len(products) == expected_count:
                    # Verify all products have gender field matching
                    all_match = all(p.get("gender") == gender for p in products)
                    if all_match:
                        log_test(f"NEW: GET /api/products?gender={gender} returns {expected_count} products", True)
                    else:
                        log_test(f"NEW: GET /api/products?gender={gender} returns {expected_count} products", False, 
                                "Some products don't have matching gender field")
                        all_passed = False
                else:
                    log_test(f"NEW: GET /api/products?gender={gender} returns {expected_count} products", False, 
                            f"Expected {expected_count} products, got {len(products) if isinstance(products, list) else 'non-list'}")
                    all_passed = False
            else:
                log_test(f"NEW: GET /api/products?gender={gender} returns {expected_count} products", False, 
                        f"Status {resp.status_code}")
                all_passed = False
        except Exception as e:
            log_test(f"NEW: GET /api/products?gender={gender} returns {expected_count} products", False, str(e))
            all_passed = False
    
    return all_passed


def test_gender_category_combos_women():
    """NEW: Test gender+category combos for women"""
    combos = {
        "t-shirts": 8,
        "hoodies": 8,
        "joggers": 8,
        "dresses": 8
    }
    all_passed = True
    
    for category, expected_count in combos.items():
        try:
            resp = requests.get(f"{BASE_URL}/products?gender=women&category={category}", timeout=10)
            if resp.status_code == 200:
                products = resp.json()
                if isinstance(products, list) and len(products) == expected_count:
                    # Verify all products match both gender and category
                    all_match = all(p.get("gender") == "women" and p.get("category") == category for p in products)
                    if all_match:
                        log_test(f"NEW: GET /api/products?gender=women&category={category} returns {expected_count}", True)
                    else:
                        log_test(f"NEW: GET /api/products?gender=women&category={category} returns {expected_count}", False, 
                                "Some products don't match gender/category")
                        all_passed = False
                else:
                    log_test(f"NEW: GET /api/products?gender=women&category={category} returns {expected_count}", False, 
                            f"Expected {expected_count} products, got {len(products) if isinstance(products, list) else 'non-list'}")
                    all_passed = False
            else:
                log_test(f"NEW: GET /api/products?gender=women&category={category} returns {expected_count}", False, 
                        f"Status {resp.status_code}")
                all_passed = False
        except Exception as e:
            log_test(f"NEW: GET /api/products?gender=women&category={category} returns {expected_count}", False, str(e))
            all_passed = False
    
    return all_passed


def test_gender_category_combos_kids():
    """NEW: Test gender+category combos for kids"""
    combos = {
        "t-shirts": 8,
        "hoodies": 8,
        "joggers": 7
    }
    all_passed = True
    
    for category, expected_count in combos.items():
        try:
            resp = requests.get(f"{BASE_URL}/products?gender=kids&category={category}", timeout=10)
            if resp.status_code == 200:
                products = resp.json()
                if isinstance(products, list) and len(products) == expected_count:
                    # Verify all products match both gender and category
                    all_match = all(p.get("gender") == "kids" and p.get("category") == category for p in products)
                    if all_match:
                        log_test(f"NEW: GET /api/products?gender=kids&category={category} returns {expected_count}", True)
                    else:
                        log_test(f"NEW: GET /api/products?gender=kids&category={category} returns {expected_count}", False, 
                                "Some products don't match gender/category")
                        all_passed = False
                else:
                    log_test(f"NEW: GET /api/products?gender=kids&category={category} returns {expected_count}", False, 
                            f"Expected {expected_count} products, got {len(products) if isinstance(products, list) else 'non-list'}")
                    all_passed = False
            else:
                log_test(f"NEW: GET /api/products?gender=kids&category={category} returns {expected_count}", False, 
                        f"Status {resp.status_code}")
                all_passed = False
        except Exception as e:
            log_test(f"NEW: GET /api/products?gender=kids&category={category} returns {expected_count}", False, str(e))
            all_passed = False
    
    return all_passed


def test_categories_by_gender():
    """NEW: Test GET /api/categories?gender= returns correct categories"""
    gender_category_counts = {
        "women": 4,
        "kids": 3,
        "men": 6
    }
    all_passed = True
    
    for gender, expected_count in gender_category_counts.items():
        try:
            resp = requests.get(f"{BASE_URL}/categories?gender={gender}", timeout=10)
            if resp.status_code == 200:
                categories = resp.json()
                if isinstance(categories, list) and len(categories) == expected_count:
                    log_test(f"NEW: GET /api/categories?gender={gender} returns {expected_count} categories", True)
                else:
                    log_test(f"NEW: GET /api/categories?gender={gender} returns {expected_count} categories", False, 
                            f"Expected {expected_count} categories, got {len(categories) if isinstance(categories, list) else 'non-list'}")
                    all_passed = False
            else:
                log_test(f"NEW: GET /api/categories?gender={gender} returns {expected_count} categories", False, 
                        f"Status {resp.status_code}")
                all_passed = False
        except Exception as e:
            log_test(f"NEW: GET /api/categories?gender={gender} returns {expected_count} categories", False, str(e))
            all_passed = False
    
    return all_passed


def test_global_image_uniqueness(products):
    """NEW: Test GLOBAL image uniqueness across ALL 115 products"""
    try:
        if not products:
            log_test("NEW: GLOBAL image uniqueness across ALL 115 products", False, "No products provided")
            return False
        
        all_images = []
        for p in products:
            images = p.get("images", [])
            all_images.extend(images)
        
        # Check for duplicates
        unique_images = set(all_images)
        
        if len(all_images) == len(unique_images):
            log_test("NEW: GLOBAL image uniqueness across ALL 115 products", True, 
                    f"Total images: {len(all_images)}, all unique")
            return True
        else:
            duplicates = len(all_images) - len(unique_images)
            log_test("NEW: GLOBAL image uniqueness across ALL 115 products", False, 
                    f"Found {duplicates} duplicate(s). Total: {len(all_images)}, Unique: {len(unique_images)}")
            return False
    except Exception as e:
        log_test("NEW: GLOBAL image uniqueness across ALL 115 products", False, str(e))
        return False


def test_new_women_kids_slugs():
    """NEW: Test sample new women/kids slugs resolve correctly"""
    slugs = [
        "w-sakura-dress",
        "w-orbit-hoodie",
        "w-volt-jogger",
        "k-ninja-tee",
        "k-orbit-hoodie",
        "k-weekend-jogger"
    ]
    
    all_passed = True
    
    for slug in slugs:
        try:
            resp = requests.get(f"{BASE_URL}/products/{slug}", timeout=10)
            if resp.status_code == 200:
                product = resp.json()
                required_fields = ["id", "slug", "name", "category", "collection", "price", 
                                 "mrp", "discount", "images", "sizes", "rating", "reviews", "description", "gender"]
                has_all = all(field in product for field in required_fields)
                
                # Verify images and sizes are non-empty lists
                images_valid = isinstance(product.get("images"), list) and len(product.get("images", [])) > 0
                sizes_valid = isinstance(product.get("sizes"), list) and len(product.get("sizes", [])) > 0
                
                if has_all and images_valid and sizes_valid and product.get("slug") == slug:
                    log_test(f"NEW: GET /api/products/{slug} returns 200 with valid data", True)
                else:
                    issues = []
                    if not has_all:
                        missing = [f for f in required_fields if f not in product]
                        issues.append(f"Missing fields: {missing}")
                    if not images_valid:
                        issues.append("images not a non-empty list")
                    if not sizes_valid:
                        issues.append("sizes not a non-empty list")
                    if product.get("slug") != slug:
                        issues.append("slug mismatch")
                    log_test(f"NEW: GET /api/products/{slug} returns 200 with valid data", False, 
                            "; ".join(issues))
                    all_passed = False
            else:
                log_test(f"NEW: GET /api/products/{slug} returns 200 with valid data", False, 
                        f"Status {resp.status_code}")
                all_passed = False
        except Exception as e:
            log_test(f"NEW: GET /api/products/{slug} returns 200 with valid data", False, str(e))
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


def test_kids_age_based_sizes():
    """NEW: Test kids products have age-based sizes (e.g., '2-3Y')"""
    try:
        resp = requests.get(f"{BASE_URL}/products?gender=kids", timeout=10)
        if resp.status_code == 200:
            products = resp.json()
            if isinstance(products, list) and len(products) > 0:
                # Check first few kids products for age-based sizes
                sample_product = products[0]
                sizes = sample_product.get("sizes", [])
                
                # Age-based sizes should contain 'Y' (e.g., '2-3Y', '4-5Y')
                has_age_sizes = any('Y' in str(size) for size in sizes)
                
                if has_age_sizes:
                    log_test("NEW: Kids products have age-based sizes (e.g., '2-3Y')", True, 
                            f"Sample sizes: {sizes[:3]}")
                    return True
                else:
                    log_test("NEW: Kids products have age-based sizes (e.g., '2-3Y')", False, 
                            f"Expected age-based sizes with 'Y', got: {sizes}")
                    return False
            else:
                log_test("NEW: Kids products have age-based sizes (e.g., '2-3Y')", False, 
                        "No kids products found")
                return False
        else:
            log_test("NEW: Kids products have age-based sizes (e.g., '2-3Y')", False, 
                    f"Status {resp.status_code}")
            return False
    except Exception as e:
        log_test("NEW: Kids products have age-based sizes (e.g., '2-3Y')", False, str(e))
        return False


# ============================================================================
# REGRESSION TESTS
# ============================================================================

def test_category_hoodies_no_gender():
    """REGRESSION: Test GET /api/products?category=hoodies (no gender) returns hoodies across all genders (>10)"""
    try:
        resp = requests.get(f"{BASE_URL}/products?category=hoodies", timeout=10)
        if resp.status_code == 200:
            products = resp.json()
            if isinstance(products, list) and len(products) > 10:
                # Verify all are hoodies
                all_hoodies = all(p.get("category") == "hoodies" for p in products)
                if all_hoodies:
                    log_test("REGRESSION: GET /api/products?category=hoodies (no gender) returns >10 hoodies", True, 
                            f"Found {len(products)} hoodies across all genders")
                    return True
                else:
                    log_test("REGRESSION: GET /api/products?category=hoodies (no gender) returns >10 hoodies", False, 
                            "Some products are not hoodies")
                    return False
            else:
                log_test("REGRESSION: GET /api/products?category=hoodies (no gender) returns >10 hoodies", False, 
                        f"Expected >10 hoodies, got {len(products) if isinstance(products, list) else 'non-list'}")
                return False
        else:
            log_test("REGRESSION: GET /api/products?category=hoodies (no gender) returns >10 hoodies", False, 
                    f"Status {resp.status_code}")
            return False
    except Exception as e:
        log_test("REGRESSION: GET /api/products?category=hoodies (no gender) returns >10 hoodies", False, str(e))
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
            "name": "Priya Sharma",
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
                    "id": "w-orbit-hoodie",
                    "name": "Orbit Zip Hoodie",
                    "slug": "w-orbit-hoodie",
                    "image": "https://images.unsplash.com/photo-1663573688938-2b3e7ea2ab33",
                    "price": 2099,
                    "size": "M",
                    "color": "Black",
                    "qty": 1
                }
            ],
            "total": 2099,
            "subtotal": 2099,
            "discount": 0,
            "shipping": 0,
            "coupon": None,
            "payment_method": "UPI",
            "address": {
                "name": "Priya Sharma",
                "phone": "9876543210",
                "line1": "123 Brigade Road",
                "city": "Bangalore",
                "state": "Karnataka",
                "pincode": "560001"
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
    print("WOMEN & KIDS Sections Verification (115 products)")
    print("="*70 + "\n")
    
    # ========================================================================
    # NEW TESTS - WOMEN & KIDS Sections
    # ========================================================================
    print("🆕 NEW TESTS - WOMEN & KIDS Sections Verification")
    print("-" * 70)
    
    # 1. Test 115 products total
    passed, products = test_products_count_115()
    
    # 2. Test gender filters (men 60, women 32, kids 23)
    test_gender_filters()
    
    # 3. Test gender+category combos for women
    test_gender_category_combos_women()
    
    # 4. Test gender+category combos for kids
    test_gender_category_combos_kids()
    
    # 5. Test GET /api/categories?gender= for women, kids, men
    test_categories_by_gender()
    
    # 6. Test GLOBAL image uniqueness across ALL 115 products
    if products:
        test_global_image_uniqueness(products)
    
    # 7. Test new women/kids slugs
    test_new_women_kids_slugs()
    
    # 8. Test non-existent slug returns 404
    test_nonexistent_slug()
    
    # 9. Test kids products have age-based sizes
    test_kids_age_based_sizes()
    
    # ========================================================================
    # REGRESSION TESTS
    # ========================================================================
    print("\n🔄 REGRESSION TESTS")
    print("-" * 70)
    
    # 10. Test category filter without gender (hoodies across all genders)
    test_category_hoodies_no_gender()
    
    # 11. Coupon tests
    test_coupon_dapper10()
    test_coupon_flat300_below_min()
    test_coupon_flat300_above_min()
    
    # 12. Auth protection tests (without token)
    test_auth_me_without_token()
    test_orders_without_token()
    
    # 13. Seed test user
    print("\n👤 SEEDING TEST USER")
    print("-" * 70)
    token, user_id = seed_test_user()
    
    if not token:
        print("❌ Cannot continue with auth-protected tests without token")
        print_summary()
        sys.exit(1)
    
    # 14. Auth tests with token
    print("🔓 AUTH TESTS (with Bearer token)")
    print("-" * 70)
    test_auth_me_with_token(token)
    
    # 15. Orders tests
    test_create_order(token)
    test_list_orders(token)
    
    # Print summary
    all_passed = print_summary()
    
    sys.exit(0 if all_passed else 1)


if __name__ == "__main__":
    main()
