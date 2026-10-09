# Railway Deployment Guide — Healthcare AI Platform

## Architecture on Railway
You will deploy **3 services** on Railway:
1. **PostgreSQL** — managed database plugin (Railway provides this)
2. **Backend** — FastAPI Python service (from `backend/` folder)  
3. **Frontend** — React/Nginx service (from `frontend/` folder)

---

## Step 1 — Create a New Railway Project

1. Go to [railway.app](https://railway.app) → **New Project**
2. Choose **Deploy from GitHub repo**
3. Select your `healthcare-ai` repository

---

## Step 2 — Add PostgreSQL Database

1. In your Railway project, click **+ New** → **Database** → **PostgreSQL**
2. Railway will spin up a Postgres instance automatically
3. Click on the Postgres service → **Variables** tab and note the `DATABASE_URL`

---

## Step 3 — Deploy the Backend Service

1. Click **+ New** → **GitHub Repo** → select `healthcare-ai`
2. When asked for **Root Directory**, set it to: `backend`
3. Railway will detect the `Dockerfile` automatically

### Set these Environment Variables for the Backend:

| Variable | Value |
|---|---|
| `SECRET_KEY` | Run: `python -c "import secrets; print(secrets.token_hex(32))"` |
| `ENVIRONMENT` | `production` |
| `DEBUG` | `false` |
| `DATABASE_URL` | Copy from PostgreSQL service → Variables → `DATABASE_URL` |
| `CORS_ORIGINS` | `https://your-frontend.up.railway.app` *(fill in after frontend deploys)* |
| `GEMINI_API_KEY` | Your Google Gemini API key (get at aistudio.google.com) |

> **Note:** `PORT` is automatically set by Railway — do NOT add it manually.

4. Click **Deploy** → wait for ✅ **Active**
5. Copy the **backend Public Domain URL** (e.g., `https://healthcare-ai-backend.up.railway.app`)

---

## Step 4 — Deploy the Frontend Service

1. Click **+ New** → **GitHub Repo** → select `healthcare-ai`
2. When asked for **Root Directory**, set it to: `frontend`

### Set these Environment Variables for the Frontend:

| Variable | Value |
|---|---|
| `VITE_API_URL` | Backend public URL from Step 3 — **no trailing slash** |

4. Click **Deploy** → wait for ✅ **Active**
5. Copy the **frontend Public Domain URL**

---

## Step 5 — Update Backend CORS

1. Go to **Backend service** → **Variables**
2. Update `CORS_ORIGINS`:
   ```
   CORS_ORIGINS=https://your-frontend.up.railway.app
   ```
3. Railway auto-redeploys the backend

---

## Step 6 — Verify

Open your frontend URL. Test with these demo accounts:

| Role | Email | Password |
|---|---|---|
| Doctor | `doctor@healthcare.ai` | `Doctor@123` |
| Patient | `patient@healthcare.ai` | `Patient@123` |

Backend health: `https://your-backend.up.railway.app/health` → `{"status": "healthy"}`

---

## Troubleshooting

| Error | Fix |
|---|---|
| `Railpack could not determine how to build the app` | You deployed from root without setting Root Directory, OR your builder was Railpack on monorepo root. Fix: in Service Settings -> Source, set **Root Directory** to `backend` (for backend service) or `frontend` (for frontend service), OR use the provided root `Dockerfile` (builder: DOCKERFILE). |
| Backend crashes | Check Logs — verify `DATABASE_URL` is set |
| Frontend shows blank page | Verify `VITE_API_URL` is set, then **redeploy** frontend |
| Login fails "Network request failed" | `VITE_API_URL` must be set BEFORE building — redeploy frontend |
| CORS errors in browser | Update `CORS_ORIGINS` on backend to match frontend URL exactly |
| PostgreSQL connection error | Copy full `DATABASE_URL` from Postgres service variables |

---

## Environment Variables Quick Reference

### Backend Service (set in Railway dashboard)
```
SECRET_KEY=<strong random key>
ENVIRONMENT=production
DEBUG=false
DATABASE_URL=<from Railway PostgreSQL>
CORS_ORIGINS=https://<your-frontend>.up.railway.app
GEMINI_API_KEY=<optional>
```

### Frontend Service (set in Railway dashboard)
```
VITE_API_URL=https://<your-backend>.up.railway.app
```
