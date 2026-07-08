import { prisma } from "../../config/prisma";
import { AppError } from "../../errors/AppError";

export async function listCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, description: true, createdAt: true }
  });
}

export async function createCategory(payload: { name: string; description?: string }) {
  const existing = await prisma.category.findUnique({ where: { name: payload.name } });
  if (existing) throw new AppError(409, "Category already exists");

  return prisma.category.create({
    data: payload,
    select: { id: true, name: true, description: true, createdAt: true }
  });
}
