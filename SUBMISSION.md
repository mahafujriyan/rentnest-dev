# RentNest — Assignment Submission

Copy the block below into your assignment submission form.  
Replace placeholders marked with `[UPDATE]` after you deploy.

---

## Submission Block (copy-paste)

```
Backend Repo     : https://github.com/mahafujriyan/rentnest-dev
Live API         : [UPDATE — your deployed URL, e.g. https://rentnest-api.onrender.com]
API Docs         : Postman Collection (import from repo)
                   https://github.com/mahafujriyan/rentnest-dev/blob/main/postman/RentNest.postman_collection.json
                   Environment: postman/RentNest.postman_environment.json
                   Swagger (live): [UPDATE]/api-docs
Demo Video       : [UPDATE — Google Drive / Loom link]
Admin Email      : admin@rentnest.com
Admin Password   : admin123
```

---

## API Documentation (Postman — no Documenter needed)

Assignment allows **Postman collection** OR Swagger. This project includes **both**.

### Import Postman collection

1. Open **Postman** or **Thunder Client**
2. **Import** → select files from this repo:
   - `postman/RentNest.postman_collection.json`
   - `postman/RentNest.postman_environment.json`
3. Set environment variable `baseUrl`:
   - Local: `http://localhost:5000/api`
   - Live: `https://YOUR-LIVE-URL/api`
4. Run **Auth → Login Admin** first — token auto-saves to `{{token}}`
5. Test other folders (Properties, Rentals, Payments, Admin)

### Swagger (alternative / bonus)

When server is running: `http://localhost:5000/api-docs`  
After deploy: `https://YOUR-LIVE-URL/api-docs`

---

## Admin credentials (for examiner)

| Field | Value |
|-------|--------|
| Email | `admin@rentnest.com` |
| Password | `admin123` |

Other demo accounts (after `pnpm seed`):

| Role | Email | Password |
|------|-------|----------|
| Landlord | landlord1@rentnest.com | Landlord123! |
| Tenant | tenant1@rentnest.com | Tenant123! |

Re-seed if admin login fails:

```bash
# Set in .env before seed:
ADMIN_EMAIL=admin@rentnest.com
ADMIN_PASSWORD=admin123
npx pnpm seed
```

---

## Cloudinary

**Not used** in this project. Property images use URL strings in seed data (`picsum.photos`).  
Image upload via Cloudinary is optional and not required for this assignment.

---

## Live deployment checklist

1. Push code to GitHub: `https://github.com/mahafujriyan/rentnest-dev`
2. Deploy on **Render** or **Railway** (recommended for Node + long-running server)
3. Set environment variables from `.env.example` (Supabase `DATABASE_URL`, `DIRECT_URL`, JWT, Stripe)
4. Build: `pnpm install && pnpm prisma generate && pnpm build`
5. Start: `pnpm prisma db push && pnpm seed && pnpm start`
6. Update **Live API** and **Demo Video** links in submission block above

> **Note:** Vercel is mainly for serverless. For Express + Prisma, **Render/Railway** is easier than Vercel.

---

## Demo video (3–5 min) — what to show

1. Project overview + folder structure
2. **Tenant:** browse properties → submit rental request
3. **Landlord:** approve request
4. **Tenant:** Stripe payment flow (create intent → confirm)
5. **Admin:** dashboard, users list, ban/unban
6. Show **validation error** (bad email) and **401/403** responses
7. Mention one challenge you solved (e.g. Supabase + Prisma schema)

---

## Mandatory requirements checklist

| Requirement | Status |
|-------------|--------|
| Postman collection OR Swagger | ✅ Both |
| Structured error JSON | ✅ |
| 20+ commits | ✅ |
| Zod validation all endpoints | ✅ |
| Admin credentials | ✅ admin@rentnest.com / admin123 |
| Stripe payment (real, not fake) | ✅ |
