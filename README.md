# RentNest API

Rental Property Marketplace — Backend REST API built with Node.js, Express, TypeScript, Prisma, and PostgreSQL.

## Features

- JWT authentication with role-based access (Tenant, Landlord, Admin)
- Property listings with search, filter, sort, and pagination
- Rental request lifecycle (PENDING → APPROVED → ACTIVE → COMPLETED)
- Stripe payment integration
- Tenant reviews after completed rentals
- Admin moderation and dashboard statistics
- Swagger API docs at `/api-docs`

## Tech Stack

- Node.js + Express + TypeScript
- PostgreSQL + Prisma ORM
- Zod validation, JWT + Bcrypt, Helmet, CORS, rate limiting
- Stripe, Swagger/OpenAPI

## Prerequisites

- Node.js 18+
- [Supabase](https://supabase.com) account (free tier works — no local PostgreSQL needed)
- pnpm (or use `npx pnpm`)

## Setup

```bash
# 1. Install dependencies
npx pnpm install

# 2. Configure environment
cp .env.example .env
# Set DATABASE_URL from Supabase (see docs/SUPABASE.md)
# Set JWT_SECRET and JWT_REFRESH_SECRET (min 16 chars each)

# 3. Run migrations
npx pnpm prisma:migrate

# 4. Generate Prisma client
npx pnpm prisma:generate

# 5. Seed demo data
npx pnpm seed

# 6. Start dev server
npx pnpm dev
```

**Supabase setup guide:** [docs/SUPABASE.md](./docs/SUPABASE.md)  
**Stripe payment setup:** [docs/STRIPE.md](./docs/STRIPE.md)

Server runs at `http://localhost:5000`

## API Endpoints

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Auth |
| GET | `/api/properties` | Public |
| GET | `/api/categories` | Public |
| POST | `/api/landlord/properties` | Landlord |
| POST | `/api/rentals` | Tenant |
| PATCH | `/api/landlord/requests/:id` | Landlord |
| POST | `/api/payments/create` | Tenant |
| POST | `/api/reviews` | Tenant |
| GET | `/api/admin/dashboard` | Admin |

Full interactive docs: `http://localhost:5000/api-docs`

## Seed Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@rentnest.com | admin123 |
| Landlord | landlord1@rentnest.com | Landlord123! |
| Tenant | tenant1@rentnest.com | Tenant123! |

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Compile TypeScript |
| `pnpm start` | Run production build |
| `pnpm prisma:migrate` | Run database migrations |
| `pnpm seed` | Seed demo data |

## Deployment

**Vercel (recommended for assignment):** [docs/VERCEL.md](./docs/VERCEL.md)

1. Use **Supabase** for PostgreSQL — see [docs/SUPABASE.md](./docs/SUPABASE.md)
2. Push to GitHub and import on [vercel.com](https://vercel.com)
3. Add all env vars from `.env.example` in Vercel dashboard
4. Set `CLIENT_URL` = your Vercel URL (e.g. `https://rentnest-dev.vercel.app`)

Also see [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for Render/Railway alternatives.

## Assignment Submission

See **[SUBMISSION.md](./SUBMISSION.md)** for copy-paste submission block, Postman import steps, admin credentials, and demo video guide.

## Project Structure

```
src/
├── config/         # env, prisma, swagger
├── modules/        # auth, users, admin, categories, properties, rentals, payments, reviews
├── middlewares/    # auth guard, error handler, rate limiter, validator
├── helpers/        # pagination, JWT
├── utils/          # catchAsync, sendResponse
└── routes/         # route aggregator
```
