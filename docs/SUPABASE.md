# Supabase Database Setup (RentNest)

RentNest uses **PostgreSQL via Prisma**. Supabase gives you a hosted Postgres database — no local PostgreSQL install needed.

## Step 1 — Create Supabase project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. **New Project** → choose name (e.g. `rentnest`)
3. Set a strong **database password** (save it)
4. Pick a region close to you (e.g. Singapore for Bangladesh)
5. Wait until the project is ready (~2 minutes)

## Step 2 — Get connection strings

In Supabase dashboard:

**Project Settings → Database → Connection string**

You need **two** URLs:

| Use | Port | When |
|-----|------|------|
| **Direct** | `5432` | Migrations (`prisma migrate`) |
| **Pooler (Transaction)** | `6543` | App runtime (optional, better for serverless) |

For development, **direct connection on port 5432** is enough for both migrate and app.

Example `.env`:

```env
# Supabase — direct connection (recommended for dev + migrate)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?schema=public"
```

Or from Supabase UI (URI tab):

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?schema=public"
```

Replace:
- `[YOUR-PASSWORD]` → your database password
- `[PROJECT-REF]` → your project reference ID

## Step 3 — Update local `.env`

```bash
cp .env.example .env
```

Paste your Supabase `DATABASE_URL` into `.env`.

Also set strong JWT secrets (min 16 characters):

```env
JWT_SECRET=your_random_secret_at_least_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_at_least_32_chars
```

## Step 4 — Run migrations

```bash
npx pnpm prisma:generate
npx pnpm prisma:migrate
```

First migrate will ask for a migration name — use e.g. `init`.

## Step 5 — Seed demo data

```bash
npx pnpm seed
```

## Step 6 — Start API

```bash
npx pnpm dev
```

Test: `http://localhost:5000/health`

## Troubleshooting

### `Can't reach database server`
- Check password and project ref in `DATABASE_URL`
- Ensure Supabase project is not paused (free tier pauses after inactivity)
- Try **direct** URL (port 5432), not pooler, for migrations

### `SSL connection required`
Add to connection string:

```env
DATABASE_URL="...?schema=public&sslmode=require"
```

### Prisma migrate fails on pooler
Use **direct** connection (port 5432) for `prisma migrate`, not the pooler URL.

## Supabase dashboard

After seeding, view data in:

- **Table Editor** in Supabase dashboard, or
- `npx pnpm prisma:studio`

## Production (Render / Railway / Vercel)

1. Add `DATABASE_URL` from Supabase (pooler URL ok for runtime)
2. Set all env vars from `.env.example`
3. Build: `pnpm install && pnpm prisma:generate && pnpm build`
4. Deploy migrations: `pnpm prisma:deploy`
5. Start: `pnpm start`
