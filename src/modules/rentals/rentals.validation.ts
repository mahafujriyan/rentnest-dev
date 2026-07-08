import { z } from "zod";

export const createRentalSchema = z.object({
  body: z.object({
    propertyId: z.string().uuid(),
    moveInDate: z.coerce.date(),
    message: z.string().optional()
  })
});

export const rentalIdSchema = z.object({
  params: z.object({ id: z.string().uuid() })
});

export const updateRentalStatusSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    status: z.enum(["APPROVED", "REJECTED"])
  })
});

export const listRentalsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    status: z.enum(["PENDING", "APPROVED", "REJECTED", "ACTIVE", "COMPLETED"]).optional()
  })
});
