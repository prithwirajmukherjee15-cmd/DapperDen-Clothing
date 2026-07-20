# Dapper Den — Deploy on Render + MongoDB Atlas

This app is a React (frontend) + FastAPI (backend) + MongoDB store. It runs
**guest-only** (no login), so there are no auth secrets to manage. Products are
served from `backend/catalog.py`; only orders are stored in MongoDB.

You will deploy 3 things:
1. **MongoDB Atlas** — the database (free tier).
2. **Backend Web Service** on Render — the FastAPI API.
3. **Frontend Static Site** on Render — the React app.

---

## 1) MongoDB Atlas (database)

1. Sign up at https://www.mongodb.com/cloud/atlas and create a **free M0 cluster**.
2. **Database Access** → *Add New Database User* → username + password (save these).
3. **Network Access** → *Add IP Address* → `0.0.0.0/0` (allow from anywhere, needed for Render).
4. **Connect** → *Drivers* → copy the connection string. It looks like:
   ```
   mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   Replace `USER` and `PASSWORD` with the user you created.
   This is your `MONGO_URL`.

---

## 2) Backend — Render Web Service

1. Push this repo to GitHub (see bottom of this file).
2. On https://dashboard.render.com → **New +** → **Web Service** → connect your repo.
3. Settings:
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn server:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** Free
4. **Environment Variables** (Advanced → Add):
   | Key | Value |
   |-----|-------|
   | `MONGO_URL` | *your Atlas string from step 1* |
   | `DB_NAME` | `dapperden` |
   | `CORS_ORIGINS` | `*` |
   | `RESEND_API_KEY` | *(leave empty for now — emails stay mocked)* |
   | `SENDER_EMAIL` | `onboarding@resend.dev` |
5. **Create Web Service.** When it's live, copy its URL, e.g.
   `https://dapperden-api.onrender.com`. Test it: open `.../api/` → should return
   `{"message":"Dapper Den API"}`.

---

## 3) Frontend — Render Static Site

1. On Render → **New +** → **Static Site** → same repo.
2. Settings:
   - **Root Directory:** `frontend`
   - **Build Command:** `yarn install && yarn build`
   - **Publish Directory:** `build`
3. **Environment Variables:**
   | Key | Value |
   |-----|-------|
   | `REACT_APP_BACKEND_URL` | *your backend URL from step 2, e.g. `https://dapperden-api.onrender.com`* (no trailing slash, no `/api`) |
4. **Redirect/Rewrite Rule** (so page refreshes don't 404):
   Settings → **Redirects/Rewrites** → Add:
   - **Source:** `/*`
   - **Destination:** `/index.html`
   - **Action:** `Rewrite`
5. **Create Static Site.** Open the URL — your store is live. 🎉

> Tip: you can also deploy both at once via **New + → Blueprint** using the
> included `render.yaml`, then just fill in `MONGO_URL` and `REACT_APP_BACKEND_URL`.

---

## 4) (Optional) Turn on real order emails — Resend

1. Sign up at https://resend.com → **API Keys** → create a key (`re_...`).
2. To send from your own domain, add + verify it under **Domains**
   (for quick testing you can send from `onboarding@resend.dev`).
3. In the **backend** service on Render → Environment:
   - `RESEND_API_KEY` = your `re_...` key
   - `SENDER_EMAIL` = `orders@yourdomain.com` (or `onboarding@resend.dev`)
4. Save → the backend redeploys → order emails now send for real.
   (While `RESEND_API_KEY` is empty, emails are logged only — "MOCKED".)

---

## Local development
- Backend: `cd backend && pip install -r requirements.txt && uvicorn server:app --reload --port 8001`
- Frontend: `cd frontend && yarn install && yarn start`
- Copy `.env.example` → `.env` in each folder and fill values.

## Push to GitHub
In the Emergent chat input, use the **"Save to GitHub"** button to push this repo.
`.env` files are gitignored, so your secrets are never committed — set them in the
Render dashboard instead.
