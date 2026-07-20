# Dapper Den — Premium Streetwear E-commerce (PRD)

## Problem Statement
Pixel-perfect premium dark streetwear store ("Dapper Den"). Stack: React + FastAPI + MongoDB.
3D scroll animations (Framer Motion), cinematic videos, non-copyright imagery, Series-C vibe.

## Deployment model (updated 2026-07-20)
- **Guest-only** (no login/auth). Runs independently on Render + MongoDB Atlas — NOT Emergent deployment.
- All Emergent branding/dependencies removed from the codebase (index.html, package.json visual-edits, analytics).
- Browser tab shows DD brand favicon (frontend/public/favicon.svg) + title "Dapper Den — Premium Streetwear".

## Core Requirements
- Dark streetwear premium aesthetic, magnetic cursor, video hero, world-tour lookbook
- 115 strictly-typed products across Men/Women/Kids with image color variants
- Cart, coupon validation, checkout, orders, guest order tracking, wishlist (localStorage)
- Category-accurate images, zero repeats, min 10 products/category

## Architecture
- Frontend: /app/frontend/src — pages (Home, CategoryHub, PLP, PDP, Cart, Checkout, Search, Help, TrackOrder, Wishlist)
  - context: DataContext, CartContext (cart + wishlist in localStorage). NO AuthContext (removed).
  - components: Navbar, Footer, VideoHero, GlobalLookbook, ProductCard, TiltCard, PaymentGateway
  - mock/india.js — INDIAN_CITIES, INDIAN_STATES, INDIAN_BANKS
- Backend: /app/backend/server.py (products/categories/search/coupon/orders/orders-track), catalog.py (in-memory 115-product seed)
  - NO auth endpoints (removed). Orders are guest; stored in MongoDB `orders`.
- Deploy files: /app/render.yaml, /app/DEPLOYMENT.md, backend/.env.example, frontend/.env.example

## Env vars (set in Render dashboard; .env is gitignored)
- Backend: MONGO_URL, DB_NAME=dapperden, CORS_ORIGINS=*, RESEND_API_KEY (empty=MOCKED), SENDER_EMAIL
- Frontend: REACT_APP_BACKEND_URL (backend URL, no trailing slash, no /api)

## Implemented
- Full storefront, 3D animations, videos, 115-product catalog, cart, coupons, orders — verified.
- Checkout: Indian city/state dropdowns, authentic Razorpay-style payment sandbox
  (Cards/UPI/EMI/Razorpay/Paytm/Netbanking/Wallets/COD), processing→success animation, confirmation page.
- No-Cost EMI (amount ≥ ₹3000, 3/6/9/12 months), guest order tracking (/track), wishlist (/wishlist).
- Order confirmation emails via Resend (`send_order_email`) — MOCKED until RESEND_API_KEY set.
- Removed Google login + all Emergent references; production `yarn build` passes; Render-ready.

## Backlog (P1/P2)
- Shipment status update emails (Packed/Shipped/Delivered)
- Reorder button from Track/Orders
- Optional: standalone Google OAuth if user accounts are needed later
- Migrate catalog.py to MongoDB for dynamic product editing
