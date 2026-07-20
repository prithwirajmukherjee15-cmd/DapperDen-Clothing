# Dapper Den — Deploy Guide (Atlas + Render + Netlify)

Guest-only store (no login). You deploy 3 free pieces:
1. **MongoDB Atlas** — the database.
2. **Render** — the backend (FastAPI API).
3. **Netlify** — the frontend (React site).

First: push this repo to GitHub using the **"Save to GitHub"** button in the Emergent
chat. `.env` files are gitignored, so no secrets are committed.

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
1. Get an API key at https://resend.com (`re_...`); verify a domain, or use
   `onboarding@resend.dev` for testing.
2. In the **Render backend** → Environment: set `RESEND_API_KEY` and `SENDER_EMAIL`.
   Save → backend redeploys → emails now send for real (they're logged/"MOCKED" until then).

---

## Local development
- Backend: `cd backend && pip install -r requirements.txt && uvicorn server:app --reload --port 8001`
- Frontend: `cd frontend && yarn install && yarn start`
- Copy `.env.example` → `.env` in each folder and fill values.
