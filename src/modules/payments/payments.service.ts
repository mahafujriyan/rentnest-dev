import Stripe from "stripe";
import { prisma } from "../../config/prisma";
import { env } from "../../config/env";
import { AppError } from "../../errors/AppError";
import { markRentalActive } from "../rentals/rentals.service";

function getStripe() {
  if (!env.STRIPE_SECRET_KEY) throw new AppError(500, "Stripe is not configured");
  return new Stripe(env.STRIPE_SECRET_KEY);
}

const paymentSelect = {
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

export async function createPaymentIntent(tenantId: string, rentalRequestId: string) {
  const rental = await prisma.rentalRequest.findUnique({
    where: { id: rentalRequestId },
    include: { property: { select: { price: true, title: true } }, payment: true }
  });
  if (!rental) throw new AppError(404, "Rental request not found");
  if (rental.tenantId !== tenantId) throw new AppError(403, "Forbidden");
  if (rental.status !== "APPROVED") throw new AppError(400, "Payment allowed only for approved rentals");
  if (rental.payment?.status === "COMPLETED") throw new AppError(400, "Payment already completed");

  const stripe = getStripe();
  const amount = rental.property.price;

  const intent = await stripe.paymentIntents.create({
    amount: amount * 100,
    currency: "usd",
    metadata: { rentalRequestId, tenantId }
  });

  if (rental.payment) {
    await prisma.payment.update({
      where: { id: rental.payment.id },
      data: { transactionId: intent.id, amount, status: "PENDING" }
    });
  } else {
    await prisma.payment.create({
      data: {
        rentalRequestId,
        tenantId,
        transactionId: intent.id,
        amount,
        currency: "usd",
        provider: "STRIPE",
        status: "PENDING"
      }
    });
  }

  return { clientSecret: intent.client_secret, paymentIntentId: intent.id, amount };
}

export async function confirmPayment(tenantId: string, rentalRequestId: string, paymentIntentId: string) {
  const rental = await prisma.rentalRequest.findUnique({
    where: { id: rentalRequestId },
    include: { payment: true, property: true }
  });
  if (!rental) throw new AppError(404, "Rental request not found");
  if (rental.tenantId !== tenantId) throw new AppError(403, "Forbidden");
  if (!rental.payment) throw new AppError(400, "No payment record found");

  const stripe = getStripe();
  const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (intent.status !== "succeeded") {
    await prisma.payment.update({
      where: { id: rental.payment.id },
      data: { status: "FAILED" }
    });
    throw new AppError(400, "Payment not completed");
  }

  const payment = await prisma.payment.update({
    where: { id: rental.payment.id },
    data: { status: "COMPLETED", paidAt: new Date(), transactionId: paymentIntentId },
    select: paymentSelect
  });

  await markRentalActive(rentalRequestId);

  return payment;
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
