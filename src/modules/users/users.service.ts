import { prisma } from "../../config/prisma";
import { AppError } from "../../errors/AppError";

export async function getMyProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      avatar: true,
      createdAt: true,
      updatedAt: true
    }
  });
  if (!user) throw new AppError(404, "User not found");
  return user;
}

export async function updateMyProfile(
  userId: string,
  payload: { name?: string; phone?: string; avatar?: string }
) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(payload.name !== undefined ? { name: payload.name } : {}),
      ...(payload.phone !== undefined ? { phone: payload.phone } : {}),
      ...(payload.avatar !== undefined ? { avatar: payload.avatar } : {})
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      avatar: true,
      createdAt: true,
      updatedAt: true
    }
  });
  return user;
}

