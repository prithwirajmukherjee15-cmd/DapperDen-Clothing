# Dapper Den — Premium Streetwear E-commerce (PRD)

## Problem Statement
Pixel-perfect premium dark streetwear store ("Dapper Den") replicating The Souled Store flow.
Stack: React + FastAPI + MongoDB. 3D scroll animations (Framer Motion), cinematic videos,
non-copyright imagery, Series-C funding aesthetic.

## Core Requirements
- Dark streetwear premium aesthetic, magnetic cursor, video hero, world-tour lookbook
- 115 strictly-typed products across Men/Women/Kids with image color variants
- Emergent Google Auth (httpOnly cookies), cart, coupon validation, orders
- Strict: category-accurate images, zero repeats, min 10 products/category

## Architecture
- Frontend: /app/frontend/src — pages (Home, CategoryHub, PLP, PDP, Cart, Checkout, Account, Search, AuthCallback, Help)
  - context: AuthContext, DataContext, CartContext (cart in localStorage `dd_cart`)
  - components: Navbar, Footer, VideoHero, GlobalLookbook, ProductCard, TiltCard, PaymentGateway
  - mock/india.js — INDIAN_CITIES, INDIAN_STATES, INDIAN_BANKS
- Backend: /app/backend — server.py (auth/orders/coupon/products), catalog.py (in-memory 115-product seed)

## Implemented (updated 2026-07-20)
- Full storefront, 3D animations, videos, 115-product catalog, Google auth, cart, coupons, orders
- E2E guest journey validated by testing agent (iteration_1.json) — 100% pass
- **Post-purchase suite (2026-07-20, all verified):**
  - Order Emails: branded HTML confirmation via Resend (`send_order_email` in server.py).
    **MOCKED** until RESEND_API_KEY set in backend/.env — currently logs the email instead of sending.
    Recipient = user email (logged-in) or address.email (guest).
  - No-Cost EMI: PaymentGateway shows EMI method only when amount ≥ ₹3000; 5 issuers × 3/6/9/12-month tenures, 0% interest.
  - Guest Order Tracking: /track page (Order ID + phone lookup → GET /api/orders/track), 5-stage progress tracker.
    Guest orders now persist (POST /orders no longer requires auth; stores guest:true).
  - Saved Addresses: GET/POST/DELETE /api/addresses (auth). Account "Addresses" tab CRUD + Checkout saved-address picker with "save this address" toggle.

## Env vars added
- backend/.env: RESEND_API_KEY (empty = MOCKED), SENDER_EMAIL (onboarding@resend.dev)
- **Checkout upgrade (2026-07-20):**
  - Address step: dropdowns for major Indian cities + all states/UTs, structured address line, country locked to India
  - Payment step: authentic Razorpay-style sandbox gateway (/components/PaymentGateway.jsx)
    - Methods: Cards (Visa/MC/Amex/RuPay/Diners auto-detect), UPI (GPay/PhonePe/Paytm/BHIM/VPA),
      Razorpay quick-pay, Paytm, Netbanking (15 banks), Wallets, COD
    - Card brand detection, live formatting, validation; processing → success overlay animation
  - Confirmation page: frozen paid amount, payment label, ship-to, order id
  - Backend order.payment_method accepts free-text label (no schema change needed)

## Backlog (P1/P2)
- Gate /api/auth/me polling for guests to avoid noisy 401s (low)
- Persist guest orders for "Track Order" (currently only logged-in orders persist)
- Migrate catalog.py to MongoDB if dynamic product editing is needed
- Real EMI options / saved cards / address book
