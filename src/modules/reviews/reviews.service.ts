import { prisma } from "../../config/prisma";
import { AppError } from "../../errors/AppError";

export async function createReview(
  tenantId: string,
  payload: { rentalRequestId: string; rating: number; comment?: string }
) {
  const rental = await prisma.rentalRequest.findUnique({
    where: { id: payload.rentalRequestId },
    include: { review: true }
  });
  if (!rental) throw new AppError(404, "Rental request not found");
  if (rental.tenantId !== tenantId) throw new AppError(403, "Forbidden");
  if (rental.status !== "COMPLETED") throw new AppError(400, "Review allowed only after rental is completed");
  if (rental.review) throw new AppError(409, "Review already submitted");

  const review = await prisma.review.create({
    data: {
      rentalRequestId: payload.rentalRequestId,
      tenantId,
      propertyId: rental.propertyId,
      rating: payload.rating,
      comment: payload.comment
    },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      propertyId: true,
      tenant: { select: { id: true, name: true } }
    }
  });

  return review;
}

export async function getPropertyAverageRating(propertyId: string) {
  const agg = await prisma.review.aggregate({
    where: { propertyId },
    _avg: { rating: true },
    _count: { _all: true }
  });
  return {
    averageRating: agg._avg.rating ?? 0,
    totalReviews: agg._count._all
  };
}
