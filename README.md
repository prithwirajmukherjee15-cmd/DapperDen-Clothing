# Dapper Den

Premium streetwear storefront — React (CRA + Tailwind + Framer Motion) frontend, FastAPI + MongoDB backend. Guest checkout only (no accounts).

```
frontend/   React app → deployed to Netlify
backend/    FastAPI API (server.py) + in-memory product catalog (catalog.py) → deployed to Render
```

## Run locally

Backend (needs a MongoDB, local or Atlas):

```bash
cd backend
cp .env.example .env        # fill in MONGO_URL
pip install -r requirements.txt
uvicorn server:app --reload --port 8001
```

Frontend:

```bash
cd frontend
cp .env.example .env
yarn install
yarn start
```

## Tests

```bash
cd backend
pip install -r requirements-dev.txt
pytest                      # offline API tests, no MongoDB needed
```

`backend/tests/test_backend_regression.py` runs against a live backend — see the instructions at the top of that file.

## Deploy

See [DEPLOYMENT.md](DEPLOYMENT.md) (MongoDB Atlas + Render + Netlify).
