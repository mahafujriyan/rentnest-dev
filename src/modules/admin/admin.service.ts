import { prisma } from "../../config/prisma";
import { AppError } from "../../errors/AppError";

export async function listUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      avatar: true,
      createdAt: true
    }
  });
}

export async function updateUserStatus(userId: string, status: "ACTIVE" | "BANNED") {
  const existing = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!existing) throw new AppError(404, "User not found");

  return prisma.user.update({
    where: { id: userId },
    data: { status },
    select: { id: true, name: true, email: true, role: true, status: true }
  });
}

export async function dashboardStats() {
  const [users, properties, rentals, paymentsAgg, pendingPayments] = await Promise.all([
    prisma.user.count(),
    prisma.property.count(),
    prisma.rentalRequest.count(),
    prisma.payment.aggregate({
      where: { status: "COMPLETED" },
      _sum: { amount: true },
      _count: { _all: true }
    }),
    prisma.payment.count({ where: { status: "PENDING" } })
  ]);

  return {
    users,
    properties,
    rentals,
    paymentsCompleted: paymentsAgg._count._all,
    revenue: paymentsAgg._sum.amount ?? 0,
    pendingPayments
  };
}

