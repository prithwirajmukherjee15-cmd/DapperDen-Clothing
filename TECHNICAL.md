# Dapper Den: technical overview

How the store is built and how to run it. For what Dapper Den is and why it exists, start with the [README](README.md).

## Architecture

| Part | Stack | Hosted on |
|---|---|---|
| Storefront | React 19, React Router 7, Tailwind CSS 3, Framer Motion, shadcn/ui | Netlify (`frontend/`) |
| API | Python 3.11, FastAPI, Motor (async MongoDB driver) | Render (`backend/`) |
| Database | MongoDB: the `orders` collection, with a unique index on `order_id` | MongoDB Atlas |
| Email | Resend: receipts, shipping updates, new-order alerts | Resend |

The product catalogue (115 products, 6 themed collections, coupons) lives in `backend/catalog.py`. The storefront also bundles a copy, so it can still browse if the API is asleep.

```
frontend/src/
  pages/         Home, CategoryHub, PLP, PDP, Cart, Checkout, Search, TrackOrder, Wishlist, Help
  components/    Navbar (search suggestions), PaymentGateway (sandbox), ProductCard, VideoHero, ...
  context/       DataContext (catalogue), CartContext (bag + wishlist in localStorage)
backend/
  server.py      API routes, order pricing, email sending
  emails.py      Branded receipt, shipping-update and owner-alert emails (HTML + text)
  catalog.py     Products, categories, collections, coupons
  tests/         Offline API tests (fake database) + a live regression suite
```

## API

All routes are under `/api`.

| Method | Route | What it does |
|---|---|---|
| GET | `/products`, `/products/{slug}`, `/categories`, `/catalog`, `/search?q=` | Catalogue and search |
| POST | `/coupon/validate` | Checks a coupon against a subtotal |
| POST | `/orders` | Places a guest order (priced on the server) and queues the emails |
| GET | `/orders/track?order_id=&phone=` | Order status; the phone number must match the order |
| GET | `/orders/receipt?order_id=&phone=` | Printable receipt page (same design as the email) |
| GET | `/admin/orders` | Latest orders. Needs the `x-admin-token` header |
| POST | `/admin/orders/{id}/status` | Moves an order to Packed, Shipped, Out for Delivery, Delivered or Cancelled, and emails the customer. Needs `x-admin-token` |
| GET | `/health` | Whether the API can reach MongoDB, and whether emails are live or mocked |
| POST | `/checkouts` | Saves the bag when a shopper finishes the address step (for bag reminders) |
| GET | `/checkouts/{id}` | Bag contents only, for the "complete your order" link |
| POST | `/admin/reminders/run` | Emails one reminder per bag left 1 to 48 hours ago. Call hourly. Needs `x-admin-token` |
| GET, POST | `/feedback?order_id=&token=`, `/feedback` | The "How did it fit?" form, secured by a per-order token |
| GET | `/products/{slug}/fit` | Fit score once three or more buyers have answered |
| GET | `/drop` | Next drop time (Friday 8 PM IST), list size and a preview of the collection |
| POST | `/drop-alerts` | Drop-list sign-up (email and/or WhatsApp, with consent; records `source`) |
| GET | `/admin/drop-alerts` | The drop list. Needs `x-admin-token` |

Referral and reward codes go through `/coupon/validate` and `/orders` like any other coupon. The growth features live in `backend/growth.py`.

## Guarantees

- **Prices come from the server.** An order sends only product IDs, sizes, colours, quantities and an optional coupon. Subtotal, coupon discount, shipping (free from ₹1,499, otherwise ₹99) and total are all worked out from the catalogue. Unknown products, invalid sizes, quantities outside 1 to 20 and invalid coupons are rejected.
- **No fake confirmations.** The payment screen waits for the order to be saved. If saving fails, it shows the error and the bag is kept.
- **Unique order IDs.** IDs are `DD` plus 10 random digits, backed by a unique database index and a retry if two ever collide.
- **Safe emails.** Everything a customer typed is HTML-escaped. Emails are sent after the response, so a slow mail provider never delays checkout.
- **Coupon rules are enforced on the server.** One coupon per order; referral codes only on a new customer's first order and never by the referrer; reward codes are claimed atomically, so each works once. The ₹50 prepaid discount applies to every payment method except cash on delivery.
- **Admin is off by default.** The admin routes return 403 unless `ADMIN_TOKEN` is set, and the token is compared in constant time.

## Run it locally

```bash
# API (needs MongoDB, local or Atlas)
cd backend
cp .env.example .env          # fill in MONGO_URL
pip install -r requirements.txt
uvicorn server:app --reload --port 8001

# Storefront
cd frontend
cp .env.example .env          # REACT_APP_BACKEND_URL=http://localhost:8001
yarn install
yarn start
```

## Tests

```bash
cd backend
pip install -r requirements-dev.txt
pytest
```

The 26 offline tests run against a fake database, so they need no MongoDB. They cover:

- server-side pricing, coupons and validation
- the prepaid discount, referral and reward codes and their rules
- bag reminders (sent once, never for finished orders) and the restore link
- the fit-feedback form, its token, and the product fit score
- drop-list sign-up validation, de-duplication and the next-drop time
- order-ID collisions
- tracking and receipt access
- email escaping and content (receipt, COD wording, owner alert)
- the admin endpoints and the health check

`tests/test_backend_regression.py` runs against a live deployment. Instructions are at the top of the file; note that it creates a real test order.

## Configuration

API environment variables (see `backend/.env.example`):

| Variable | Required | Purpose |
|---|---|---|
| `MONGO_URL`, `DB_NAME` | Yes | MongoDB connection |
| `CORS_ORIGINS` | No | Allowed origins (default `*`) |
| `RESEND_API_KEY`, `SENDER_EMAIL` | No | Real email sending. Without a key, emails are only logged |
| `SITE_URL` | No | Storefront URL used in email links |
| `SUPPORT_EMAIL` | No | Reply-to address shown in emails |
| `ORDER_NOTIFY_EMAIL` | No | Where new-order alerts go |
| `ADMIN_TOKEN` | No | Enables the admin routes |

Storefront: `REACT_APP_BACKEND_URL`, the API's base URL without `/api`.

## Deployment

Step-by-step setup for MongoDB Atlas, Render and Netlify, plus email and order management: **[DEPLOYMENT.md](DEPLOYMENT.md)**.
