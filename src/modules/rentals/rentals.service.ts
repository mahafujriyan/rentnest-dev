import type { Prisma, RentalStatus } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { AppError } from "../../errors/AppError";
import { ACTIVE_RENTAL_STATUSES } from "../../constants/rentalStatus";
import { getPagination } from "../../helpers/pagination";

const rentalSelect = {
  id: true,
  tenantId: true,
  propertyId: true,
  status: true,
  moveInDate: true,
  message: true,
  createdAt: true,
  updatedAt: true,
  tenant: { select: { id: true, name: true, email: true, phone: true } },
  property: {
    select: {
      id: true,
      title: true,
      price: true,
      city: true,
      division: true,
      landlordId: true,
      landlord: { select: { id: true, name: true, email: true } }
    }
  },
  payment: { select: { id: true, status: true, amount: true, paidAt: true } }
} satisfies Prisma.RentalRequestSelect;

export async function createRentalRequest(
  tenantId: string,
  payload: { propertyId: string; moveInDate: Date; message?: string }
) {
  const property = await prisma.property.findUnique({ where: { id: payload.propertyId } });
  if (!property) throw new AppError(404, "Property not found");
  if (!property.availability) throw new AppError(400, "Property is not available");

  const duplicate = await prisma.rentalRequest.findFirst({
    where: {
      tenantId,
      propertyId: payload.propertyId,
      status: { in: [...ACTIVE_RENTAL_STATUSES] }
    }
  });
  if (duplicate) throw new AppError(409, "You already have an active request for this property");

  return prisma.rentalRequest.create({
    data: {
      tenantId,
      propertyId: payload.propertyId,
      moveInDate: payload.moveInDate,
      message: payload.message
    },
    select: rentalSelect
  });
}

export async function listRentalRequests(
  userId: string,
  role: string,
  query: { page?: string; limit?: string; status?: RentalStatus }
) {
  const { page, limit, skip } = getPagination(query);

  const where: Prisma.RentalRequestWhereInput = {};
  if (query.status) where.status = query.status;

  if (role === "TENANT") {
    where.tenantId = userId;
  } else if (role === "LANDLORD") {
    where.property = { landlordId: userId };
  } else if (role !== "ADMIN") {
    throw new AppError(403, "Forbidden");
  }

  const [rentals, total] = await Promise.all([
    prisma.rentalRequest.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: rentalSelect
    }),
    prisma.rentalRequest.count({ where })
  ]);

  return { rentals, page, limit, total };
}

export async function getRentalRequestById(userId: string, role: string, rentalId: string) {
  const rental = await prisma.rentalRequest.findUnique({
    where: { id: rentalId },
    select: rentalSelect
  });
  if (!rental) throw new AppError(404, "Rental request not found");

  const isTenant = rental.tenantId === userId;
  const isLandlord = rental.property.landlordId === userId;
  if (role !== "ADMIN" && !isTenant && !isLandlord) {
    throw new AppError(403, "Forbidden");
  }

  return rental;
}

export async function updateRentalStatus(
  landlordId: string,
  rentalId: string,
  status: "APPROVED" | "REJECTED"
) {
  const rental = await prisma.rentalRequest.findUnique({
    where: { id: rentalId },
    include: { property: { select: { landlordId: true } } }
  });
  if (!rental) throw new AppError(404, "Rental request not found");
  if (rental.property.landlordId !== landlordId) throw new AppError(403, "Forbidden");
  if (rental.status !== "PENDING") throw new AppError(400, "Only pending requests can be updated");

  return prisma.rentalRequest.update({
    where: { id: rentalId },
    data: { status },
    select: rentalSelect
  });
}

export async function markRentalActive(rentalRequestId: string) {
  return prisma.rentalRequest.update({
    where: { id: rentalRequestId },
    data: { status: "ACTIVE" }
  });
}

export async function markRentalCompleted(rentalRequestId: string) {
  const rental = await prisma.rentalRequest.findUnique({ where: { id: rentalRequestId } });
  if (!rental) throw new AppError(404, "Rental request not found");
  if (rental.status !== "ACTIVE") throw new AppError(400, "Only active rentals can be completed");

  return prisma.rentalRequest.update({
    where: { id: rentalRequestId },
    data: { status: "COMPLETED" }
  });
}

export async function adminListRentals() {
  return prisma.rentalRequest.findMany({
    orderBy: { createdAt: "desc" },
    select: rentalSelect
  });
}
