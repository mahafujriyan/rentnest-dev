# Deployment Guide

## Supabase (Database)

See **[docs/SUPABASE.md](./SUPABASE.md)** for full Supabase setup — create project, connection string, migrate, and seed.

## Render / Railway

1. Create a **Supabase** project and copy `DATABASE_URL` (see Supabase guide)
2. Set environment variables from `.env.example`
3. Build command: `pnpm install && pnpm prisma:generate && pnpm build`
4. Start command: `pnpm prisma:deploy && pnpm start`

## VPS

```bash
pnpm install
pnpm prisma:migrate
pnpm prisma:generate
pnpm seed
pnpm build
pm2 start dist/server.js --name rentnest-api
```

API: `http://localhost:5000`  
Swagger: `http://localhost:5000/api-docs`
