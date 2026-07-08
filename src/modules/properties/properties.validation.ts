import { z } from "zod";

const propertyBody = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  categoryId: z.string().uuid(),
  price: z.coerce.number().int().positive(),
  city: z.string().min(2),
  division: z.string().min(2),
  address: z.string().min(5),
  bedrooms: z.coerce.number().int().min(0),
  bathrooms: z.coerce.number().int().min(0),
  area: z.coerce.number().int().positive(),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.string().url()).default([])
});

export const createPropertySchema = z.object({
  body: propertyBody
});

export const updatePropertySchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: propertyBody.partial()
});

export const propertyIdSchema = z.object({
  params: z.object({ id: z.string().uuid() })
});

export const listPropertiesSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    city: z.string().optional(),
    division: z.string().optional(),
    categoryId: z.string().uuid().optional(),
    minPrice: z.string().optional(),
    maxPrice: z.string().optional(),
    bedrooms: z.string().optional(),
    bathrooms: z.string().optional(),
    availability: z.enum(["true", "false"]).optional(),
    sortBy: z.enum(["price", "createdAt"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional()
  })
});

export const toggleAvailabilitySchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    availability: z.boolean()
  })
});
