import type { RequestHandler } from "express";
import { env } from "../../config/env";
import { prisma } from "../../config/prisma";
import { getStripeClient } from "../../config/stripe";
import { AppError } from "../../errors/AppError";
import { catchAsync } from "../../utils/catchAsync";
import { fulfillPaymentFromIntent } from "./payments.service";

export const stripeWebhook: RequestHandler = catchAsync(async (req, res) => {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    throw new AppError(500, "Stripe webhook secret is not configured");
  }

  const signature = req.headers["stripe-signature"];
  if (!signature || typeof signature !== "string") {
    throw new AppError(400, "Missing Stripe signature");
  }

  const stripe = getStripeClient();
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch {
    throw new AppError(400, "Invalid Stripe webhook signature");
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object;
    await fulfillPaymentFromIntent(intent.id);
  }

  if (event.type === "payment_intent.payment_failed") {
    const intent = event.data.object;
    const rentalRequestId = intent.metadata?.rentalRequestId;
    if (rentalRequestId) {
      await prisma.payment.updateMany({
        where: { rentalRequestId, transactionId: intent.id },
        data: { status: "FAILED" }
      });
    }
  }

  res.json({ received: true });
});
