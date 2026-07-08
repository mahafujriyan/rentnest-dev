# Stripe Payment Setup (RentNest)

RentNest uses **Stripe Payment Intents** for real payment processing (assignment requirement).

## Step 1 — Create Stripe account

1. Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Sign up (free)
3. Stay in **Test mode** (toggle top-right) — no real money charged

## Step 2 — Get API keys

**Developers → API keys**

Copy:

| Key | Starts with | Put in `.env` |
|-----|-------------|---------------|
| Publishable key | `pk_test_` | `STRIPE_PUBLISHABLE_KEY` |
| Secret key | `sk_test_` | `STRIPE_SECRET_KEY` |

```env
STRIPE_SECRET_KEY=sk_test_xxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxx
STRIPE_CURRENCY=usd
```

> Property `price` in the database = **whole USD amount** (e.g. `150` = $150.00). Seed data uses $150–$640 range.

## Step 3 — Payment API endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/payments/create` | Tenant | Create Stripe Payment Intent for APPROVED rental |
| POST | `/api/payments/confirm` | Tenant | Verify payment succeeded & activate rental |
| POST | `/api/payments/webhook` | Stripe | Webhook for `payment_intent.succeeded` |
| GET | `/api/payments` | Tenant | Payment history |
| GET | `/api/payments/:id` | Tenant | Payment details |

## Step 4 — Test payment flow (Postman)

### A. Prerequisites

1. Database migrated + seeded (`pnpm seed`)
2. Stripe keys in `.env`
3. Server running (`pnpm dev`)

### B. Full flow

**1. Login as tenant**
```
POST /api/auth/login
{ "email": "tenant2@rentnest.com", "password": "Tenant123!" }
```
Copy `accessToken` from response.

**2. Get approved rental ID** (seed creates one for tenant2)
```
GET /api/rentals
Authorization: Bearer <token>
```
Find rental with `status: "APPROVED"` — copy `id`.

**3. Create payment intent**
```
POST /api/payments/create
Authorization: Bearer <token>
{ "rentalRequestId": "<APPROVED_RENTAL_UUID>" }
```
Response includes `paymentIntentId` and `clientSecret`.

**4. Confirm payment in Stripe (test mode)**

Option A — **Stripe Dashboard:**
- Developers → Events → find your PaymentIntent → use test card

Option B — **Stripe CLI** (recommended):
```bash
# Install: https://stripe.com/docs/stripe-cli
stripe login
stripe payment_intents confirm pi_XXXXX --payment-method pm_card_visa
```

Test card: `4242 4242 4242 4242` | Exp: any future | CVC: any 3 digits

**5. Confirm on backend**
```
POST /api/payments/confirm
Authorization: Bearer <token>
{
  "rentalRequestId": "<APPROVED_RENTAL_UUID>",
  "paymentIntentId": "pi_XXXXX"
}
```

Rental status → `ACTIVE`, payment status → `COMPLETED`.

## Step 5 — Webhook (optional, for production)

**Developers → Webhooks → Add endpoint**

- URL: `https://your-api.com/api/payments/webhook`
- Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
- Copy **Signing secret** → `STRIPE_WEBHOOK_SECRET=whsec_xxx`

**Local testing with Stripe CLI:**
```bash
stripe listen --forward-to localhost:5000/api/payments/webhook
# Copy whsec_... to .env as STRIPE_WEBHOOK_SECRET
```

When payment succeeds, webhook auto-updates payment + rental to ACTIVE.

## Payment status tracking

| Status | Meaning |
|--------|---------|
| `PENDING` | Intent created, not paid yet |
| `COMPLETED` | Stripe confirmed, rental ACTIVE |
| `FAILED` | Payment failed, tenant can retry |

## Assignment checklist

- ✅ Real Stripe integration (not fake/COD)
- ✅ Create payment intent endpoint
- ✅ Confirm / webhook verification
- ✅ Payment status in database (`payments` table)
- ✅ Rental moves to ACTIVE after successful payment

## Troubleshooting

| Error | Fix |
|-------|-----|
| `Stripe is not configured` | Add `STRIPE_SECRET_KEY` to `.env` |
| `Payment allowed only for approved rentals` | Landlord must approve request first |
| `Payment not completed` | Confirm intent in Stripe before calling `/confirm` |
| Amount too large | Re-seed DB — prices are now in USD ($150+) |
