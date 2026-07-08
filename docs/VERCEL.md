# Deploy RentNest API on Vercel

## Step 1 — Push to GitHub

```bash
git add .
git commit -m "chore: add Vercel deployment config"
git push origin main
```

Repo: https://github.com/mahafujriyan/rentnest-dev

## Step 2 — Import project on Vercel

1. Go to [https://vercel.com](https://vercel.com) → **Add New → Project**
2. Import **mahafujriyan/rentnest-dev**
3. Framework Preset: **Other**
4. Root Directory: `./` (default)
5. Build Command: `pnpm run vercel-build` (auto from `vercel.json`)
6. Install Command: `pnpm install`
7. Output Directory: leave empty (serverless API)

## Step 3 — Environment Variables (Vercel Dashboard)

**Settings → Environment Variables** — add ALL of these:

| Variable | Value |
|----------|--------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Supabase pooler URL (port **6543**) |
| `DIRECT_URL` | Supabase session URL (port **5432**) |
| `JWT_SECRET` | min 16 chars random string |
| `JWT_REFRESH_SECRET` | min 16 chars random string |
| `JWT_EXPIRES_IN` | `1d` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` |
| `BCRYPT_SALT_ROUNDS` | `12` |
| `CLIENT_URL` | `https://YOUR-PROJECT.vercel.app` |
| `STRIPE_SECRET_KEY` | `sk_test_...` |
| `STRIPE_PUBLISHABLE_KEY` | `pk_test_...` |
| `STRIPE_CURRENCY` | `usd` |
| `ADMIN_EMAIL` | `admin@rentnest.com` |
| `ADMIN_PASSWORD` | `admin123` |

Copy `DATABASE_URL` and `DIRECT_URL` from your local `.env` (Supabase).

> **Important:** Set `CLIENT_URL` to your Vercel URL (e.g. `https://rentnest-dev.vercel.app`) so CORS works.

## Step 4 — Deploy

Click **Deploy**. Wait for build to finish.

Your live API will be:
```
https://YOUR-PROJECT.vercel.app
```

## Step 5 — Test live API

| Test | URL |
|------|-----|
| Health | `GET https://YOUR-PROJECT.vercel.app/health` |
| Login | `POST https://YOUR-PROJECT.vercel.app/api/auth/login` |
| Properties | `GET https://YOUR-PROJECT.vercel.app/api/properties` |
| Swagger | `https://YOUR-PROJECT.vercel.app/api-docs` |

### Postman (live)

Import collection, set environment:
```
baseUrl = https://YOUR-PROJECT.vercel.app/api
```

## Step 6 — Seed production DB (one time)

Run locally pointing to production Supabase (already seeded if you used same DB):

```bash
npx pnpm seed
```

Or run seed once with production `DIRECT_URL` in local `.env`.

Admin login on live API:
- Email: `admin@rentnest.com`
- Password: `admin123`

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Build fails on Prisma | Check `DATABASE_URL` set in Vercel env |
| 500 on all routes | Check Vercel **Functions** logs |
| CORS error | Set `CLIENT_URL` = your Vercel URL |
| Admin login fails | Re-run `pnpm seed` with correct `ADMIN_EMAIL/PASSWORD` |
| Cold start slow | Normal on Vercel free tier |

## Submission block (after deploy)

```
Backend Repo     : https://github.com/mahafujriyan/rentnest-dev
Live API         : https://YOUR-PROJECT.vercel.app
API Docs         : Postman — postman/RentNest.postman_collection.json
                   Swagger — https://YOUR-PROJECT.vercel.app/api-docs
Demo Video       : [your Google Drive / Loom link]
Admin Email      : admin@rentnest.com
Admin Password   : admin123
```
