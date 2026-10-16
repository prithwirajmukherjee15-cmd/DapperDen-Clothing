# Dapper Den — Deploy Guide (Atlas + Render + Netlify)

Guest-only store (no login). You deploy 3 free pieces:
1. **MongoDB Atlas** — the database.
2. **Render** — the backend (FastAPI API).
3. **Netlify** — the frontend (React site).

First: make sure this repo is on GitHub. `.env` files are gitignored, so no secrets are committed.

---

## 1) MongoDB Atlas (database — free)
1. Sign up at https://www.mongodb.com/cloud/atlas → create a **free M0 cluster**.
2. **Database Access** → Add user → username + password (save them).
3. **Network Access** → Add IP → `0.0.0.0/0` (allow from anywhere).
4. **Connect → Drivers** → copy the string and put your password in:
   ```
   mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   This is your **MONGO_URL**.

---

## 2) Backend on Render (free)
Render → **New + → Web Service** → connect your GitHub repo.
- Root Directory: `backend`
- Runtime: `Python 3`
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
- Instance Type: `Free`

Environment variables:
| Key | Value |
|-----|-------|
| `MONGO_URL` | your Atlas string from step 1 |
| `DB_NAME` | `dapperden` |
| `CORS_ORIGINS` | `*` |
| `RESEND_API_KEY` | *(leave empty — emails stay mocked)* |
| `SENDER_EMAIL` | `onboarding@resend.dev` |
| `SITE_URL` | your Netlify URL, e.g. `https://dapper-denn.netlify.app` (used for links in emails) |
| `SUPPORT_EMAIL` | *(optional)* your support inbox — shown in emails and used as reply-to |
| `ORDER_NOTIFY_EMAIL` | *(optional)* where you get a "New order" email for every order |
| `ADMIN_TOKEN` | *(optional)* long random secret that unlocks the admin endpoints (step 5) |

Create it. When live, copy the URL (e.g. `https://dapperden-api.onrender.com`).
Test: open `.../api/` → should show `{"message":"Dapper Den API"}`.

---

## 3) Frontend on Netlify (free)
Netlify → **Add new site → Import an existing project** → GitHub → your repo.
Netlify auto-reads `netlify.toml`, so build settings are already correct:
- Base directory: `frontend`
- Build command: `yarn build`
- Publish directory: `frontend/build`

Before the first deploy, add an environment variable:
- **Site configuration → Environment variables → Add**
  | Key | Value |
  |-----|-------|
  | `REACT_APP_BACKEND_URL` | your Render backend URL, e.g. `https://dapperden-api.onrender.com` (no trailing slash, no `/api`) |

Click **Deploy**. When it finishes, open the Netlify URL — your store is live. 🎉
(SPA routing / refresh-without-404 is handled by `netlify.toml` and `_redirects`.)

> If you added `REACT_APP_BACKEND_URL` after the first build, trigger a rebuild:
> **Deploys → Trigger deploy → Clear cache and deploy site.**

---

## 4) (Optional) Real order emails — Resend
Every order sends a branded receipt to the customer (and a "New order" alert to
`ORDER_NOTIFY_EMAIL` if set). Until `RESEND_API_KEY` is set they are only logged ("MOCKED").

1. Get an API key at https://resend.com (`re_...`).
2. In the **Render backend** → Environment: set `RESEND_API_KEY`. Save → backend redeploys.
3. **Important:** with the test sender `onboarding@resend.dev`, Resend only delivers to the
   email address of your own Resend account. To email real customers, verify your domain in
   Resend (Domains → Add domain) and set `SENDER_EMAIL` to e.g. `Dapper Den <orders@yourdomain.com>`.

Customers can also open/print their receipt any time from the order confirmation page or the
Track Order page (`/api/orders/receipt?order_id=...&phone=...`).

---

## 5) (Optional) Managing orders — status updates
Set `ADMIN_TOKEN` on Render to a long random string (keep it secret). Then:

```bash
# List the latest orders
curl -H "x-admin-token: YOUR_TOKEN" https://YOUR-API.onrender.com/api/admin/orders

# Move an order along — the customer gets a branded update email
curl -X POST -H "x-admin-token: YOUR_TOKEN" -H "Content-Type: application/json" \
  -d '{"status": "Shipped"}' https://YOUR-API.onrender.com/api/admin/orders/DD1234567890/status
```

Statuses: `Confirmed`, `Packed`, `Shipped`, `Out for Delivery`, `Delivered`, `Cancelled`.
Add `"notify": false` to update without emailing. The Track Order page shows the new status.
Marking an order `Delivered` emails the customer a "How did it fit?" link; their answers become the
fit score on the product page.

```bash
# The drop list (sign-ups from /drop, with the channel each came from)
curl -H "x-admin-token: YOUR_TOKEN" https://YOUR-API.onrender.com/api/admin/drop-alerts
```

---

## 6) (Optional) Bag reminders — run hourly
Shoppers who enter their address but don't order get one reminder email 1–48 hours later. Something
has to trigger the send every hour. The free way:

1. Sign up at https://cron-job.org and create a cron job.
2. URL: `https://YOUR-API.onrender.com/api/admin/reminders/run`, method **POST**, every hour.
3. Under **Advanced → Headers**, add `x-admin-token` with your `ADMIN_TOKEN`.

Each call returns `{"sent": n, "skipped": m}`. It also keeps the free Render instance awake.

---

## Local development
- Backend: `cd backend && pip install -r requirements.txt && uvicorn server:app --reload --port 8001`
- Frontend: `cd frontend && yarn install && yarn start`
- Copy `.env.example` → `.env` in each folder and fill values.
