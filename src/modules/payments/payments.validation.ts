import { z } from "zod";

export const createPaymentSchema = z.object({
  body: z.object({
    rentalRequestId: z.string().uuid()
  })
});

export const confirmPaymentSchema = z.object({
  body: z.object({
    rentalRequestId: z.string().uuid(),
    paymentIntentId: z.string().min(1)
  })
});

export const paymentIdSchema = z.object({
  params: z.object({ id: z.string().uuid() })
});
