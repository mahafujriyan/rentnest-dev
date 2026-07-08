# Deployment Guide

## Render / Railway

1. Create a PostgreSQL database and copy `DATABASE_URL`
2. Set environment variables from `.env.example`
3. Build command: `pnpm install && pnpm prisma:generate && pnpm build`
4. Start command: `pnpm prisma:deploy && pnpm start`

## Docker

```bash
docker compose up --build
```

API: `http://localhost:5000`
Swagger: `http://localhost:5000/api-docs`

## VPS

```bash
pnpm install
pnpm prisma:migrate
pnpm prisma:generate
pnpm seed
pnpm build
pm2 start dist/server.js --name rentnest-api
```
