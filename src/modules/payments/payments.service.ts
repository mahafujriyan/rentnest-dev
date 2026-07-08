import { prisma } from "../../config/prisma";
import { env } from "../../config/env";
import { getStripeClient } from "../../config/stripe";
import { AppError } from "../../errors/AppError";
import { markRentalActive } from "../rentals/rentals.service";

export const paymentSelect = {
  id: true,
  rentalRequestId: true,
  tenantId: true,
  transactionId: true,
  amount: true,
  currency: true,
  provider: true,
  status: true,
  paidAt: true,
  createdAt: true,
  rentalRequest: {
    select: {
      id: true,
      status: true,
      property: { select: { id: true, title: true, price: true } }
    }
  }
};

/** Property price is stored in whole currency units (e.g. 150 = $150.00 USD). */
export function toStripeAmount(price: number) {
  return Math.round(price * 100);
}

export async function fulfillPaymentFromIntent(paymentIntentId: string) {
  const stripe = getStripeClient();
  const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (intent.status !== "succeeded") {
    throw new AppError(400, "Payment not completed");
  }

  const rentalRequestId = intent.metadata?.rentalRequestId;
  if (!rentalRequestId) throw new AppError(400, "Missing rental request in payment metadata");

  const rental = await prisma.rentalRequest.findUnique({
    where: { id: rentalRequestId },
    include: { payment: true }
  });
  if (!rental) throw new AppError(404, "Rental request not found");
  if (!rental.payment) throw new AppError(400, "No payment record found");
  if (rental.payment.status === "COMPLETED") return rental.payment;

  const payment = await prisma.payment.update({
    where: { id: rental.payment.id },
    data: {
      status: "COMPLETED",
      paidAt: new Date(),
      transactionId: paymentIntentId,
      amount: intent.amount / 100,
      currency: intent.currency
    },
    select: paymentSelect
  });

  await markRentalActive(rentalRequestId);
  return payment;
}

export async function createPaymentIntent(tenantId: string, rentalRequestId: string) {
  const rental = await prisma.rentalRequest.findUnique({
    where: { id: rentalRequestId },
    include: { property: { select: { price: true, title: true } }, payment: true }
  });
  if (!rental) throw new AppError(404, "Rental request not found");
  if (rental.tenantId !== tenantId) throw new AppError(403, "Forbidden");
  if (rental.status !== "APPROVED") throw new AppError(400, "Payment allowed only for approved rentals");
  if (rental.payment?.status === "COMPLETED") throw new AppError(400, "Payment already completed");

  const stripe = getStripeClient();
  const amount = rental.property.price;
  const currency = env.STRIPE_CURRENCY;

  const intent = await stripe.paymentIntents.create({
    amount: toStripeAmount(amount),
    currency,
    automatic_payment_methods: { enabled: true },
    metadata: { rentalRequestId, tenantId, propertyTitle: rental.property.title }
  });

  if (rental.payment) {
    await prisma.payment.update({
      where: { id: rental.payment.id },
      data: { transactionId: intent.id, amount, currency, status: "PENDING" }
    });
  } else {
    await prisma.payment.create({
      data: {
        rentalRequestId,
        tenantId,
        transactionId: intent.id,
        amount,
        currency,
        provider: "STRIPE",
        status: "PENDING"
      }
    });
  }

  return {
    clientSecret: intent.client_secret,
    paymentIntentId: intent.id,
    amount,
    currency,
    publishableKey: env.STRIPE_PUBLISHABLE_KEY
  };
}

export async function confirmPayment(tenantId: string, rentalRequestId: string, paymentIntentId: string) {
  const rental = await prisma.rentalRequest.findUnique({
    where: { id: rentalRequestId },
    include: { payment: true }
  });
  if (!rental) throw new AppError(404, "Rental request not found");
  if (rental.tenantId !== tenantId) throw new AppError(403, "Forbidden");
  if (!rental.payment) throw new AppError(400, "No payment record found");
  if (rental.payment.transactionId !== paymentIntentId) {
    throw new AppError(400, "Payment intent does not match this rental");
  }

  const stripe = getStripeClient();
  const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (intent.status !== "succeeded") {
    await prisma.payment.update({
      where: { id: rental.payment.id },
      data: { status: "FAILED" }
    });
    throw new AppError(400, `Payment not completed. Stripe status: ${intent.status}`);
  }

  return fulfillPaymentFromIntent(paymentIntentId);
}

export async function listPayments(tenantId: string) {
  return prisma.payment.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    select: paymentSelect
  });
}

export async function getPaymentById(tenantId: string, paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    select: paymentSelect
  });
  if (!payment) throw new AppError(404, "Payment not found");
  if (payment.tenantId !== tenantId) throw new AppError(403, "Forbidden");
  return payment;
}
