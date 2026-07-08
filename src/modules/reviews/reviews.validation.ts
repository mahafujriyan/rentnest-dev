import { z } from "zod";

export const createReviewSchema = z.object({
  body: z.object({
    rentalRequestId: z.string().uuid(),
    rating: z.coerce.number().int().min(1).max(5),
    comment: z.string().optional()
  })
});
