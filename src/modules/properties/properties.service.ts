import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { AppError } from "../../errors/AppError";
import { getPagination } from "../../helpers/pagination";

const propertySelect = {
  id: true,
  title: true,
  description: true,
  price: true,
  city: true,
  division: true,
  address: true,
  bedrooms: true,
  bathrooms: true,
  area: true,
  amenities: true,
  images: true,
  availability: true,
  categoryId: true,
  landlordId: true,
  createdAt: true,
  updatedAt: true,
  category: { select: { id: true, name: true } },
  landlord: { select: { id: true, name: true, email: true, phone: true } }
} satisfies Prisma.PropertySelect;

type ListQuery = {
  page?: string;
  limit?: string;
  search?: string;
  city?: string;
  division?: string;
  categoryId?: string;
  minPrice?: string;
  maxPrice?: string;
  bedrooms?: string;
  bathrooms?: string;
  availability?: string;
  sortBy?: string;
  sortOrder?: string;
};

export async function listProperties(query: ListQuery) {
  const { page, limit, skip } = getPagination(query);

  const where: Prisma.PropertyWhereInput = {};

  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } },
      { city: { contains: query.search, mode: "insensitive" } }
    ];
  }
  if (query.city) where.city = { equals: query.city, mode: "insensitive" };
  if (query.division) where.division = { equals: query.division, mode: "insensitive" };
  if (query.categoryId) where.categoryId = query.categoryId;
  if (query.bedrooms) where.bedrooms = { gte: Number(query.bedrooms) };
  if (query.bathrooms) where.bathrooms = { gte: Number(query.bathrooms) };
  if (query.availability !== undefined) where.availability = query.availability === "true";

  if (query.minPrice || query.maxPrice) {
    where.price = {};
    if (query.minPrice) where.price.gte = Number(query.minPrice);
    if (query.maxPrice) where.price.lte = Number(query.maxPrice);
  }

  const sortBy = query.sortBy === "price" ? "price" : "createdAt";
  const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      select: propertySelect
    }),
    prisma.property.count({ where })
  ]);

  return { properties, page, limit, total };
}

export async function getPropertyById(id: string) {
  const property = await prisma.property.findUnique({
    where: { id },
    select: {
      ...propertySelect,
      reviews: {
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          tenant: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: "desc" },
        take: 10
      },
      _count: { select: { reviews: true } }
    }
  });
  if (!property) throw new AppError(404, "Property not found");
  return property;
}

export async function createProperty(
  landlordId: string,
  payload: {
    title: string;
    description: string;
    categoryId: string;
    price: number;
    city: string;
    division: string;
    address: string;
    bedrooms: number;
    bathrooms: number;
    area: number;
    amenities: string[];
    images: string[];
  }
) {
  const category = await prisma.category.findUnique({ where: { id: payload.categoryId } });
  if (!category) throw new AppError(404, "Category not found");

  return prisma.property.create({
    data: { ...payload, landlordId },
    select: propertySelect
  });
}

export async function updateProperty(
  landlordId: string,
  propertyId: string,
  payload: Partial<{
    title: string;
    description: string;
    categoryId: string;
    price: number;
    city: string;
    division: string;
    address: string;
    bedrooms: number;
    bathrooms: number;
    area: number;
    amenities: string[];
    images: string[];
  }>
) {
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) throw new AppError(404, "Property not found");
  if (property.landlordId !== landlordId) throw new AppError(403, "Forbidden");

  if (payload.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: payload.categoryId } });
    if (!category) throw new AppError(404, "Category not found");
  }

  return prisma.property.update({
    where: { id: propertyId },
    data: payload,
    select: propertySelect
  });
}

export async function deleteProperty(landlordId: string, propertyId: string) {
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) throw new AppError(404, "Property not found");
  if (property.landlordId !== landlordId) throw new AppError(403, "Forbidden");

  await prisma.property.delete({ where: { id: propertyId } });
}

export async function toggleAvailability(landlordId: string, propertyId: string, availability: boolean) {
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) throw new AppError(404, "Property not found");
  if (property.landlordId !== landlordId) throw new AppError(403, "Forbidden");

  return prisma.property.update({
    where: { id: propertyId },
    data: { availability },
    select: propertySelect
  });
}

export async function adminListProperties() {
  return prisma.property.findMany({
    orderBy: { createdAt: "desc" },
    select: propertySelect
  });
}

export async function adminDeleteProperty(propertyId: string) {
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) throw new AppError(404, "Property not found");
  await prisma.property.delete({ where: { id: propertyId } });
}
