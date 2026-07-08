import bcrypt from "bcrypt";
import { prisma } from "../../config/prisma";
import { env } from "../../config/env";
import { AppError } from "../../errors/AppError";
import { signAccessToken, signRefreshToken } from "../../helpers/jwt";

export async function registerUser(payload: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: "TENANT" | "LANDLORD";
}) {
  const existing = await prisma.user.findUnique({ where: { email: payload.email } });
  if (existing) throw new AppError(409, "Email already in use");

  const passwordHash = await bcrypt.hash(payload.password, env.BCRYPT_SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: passwordHash,
      phone: payload.phone,
      role: payload.role
    },
    select: { id: true, name: true, email: true, phone: true, role: true, status: true, avatar: true, createdAt: true }
  });

  const accessToken = signAccessToken({ userId: user.id, role: user.role });
  const refreshToken = signRefreshToken({ userId: user.id, role: user.role });

  return { user, accessToken, refreshToken };
}

export async function loginUser(payload: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: payload.email } });
  if (!user) throw new AppError(401, "Invalid credentials");
  if (user.status === "BANNED") throw new AppError(403, "User is banned");

  const ok = await bcrypt.compare(payload.password, user.password);
  if (!ok) throw new AppError(401, "Invalid credentials");

  const safeUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, name: true, email: true, phone: true, role: true, status: true, avatar: true, createdAt: true }
  });

  const accessToken = signAccessToken({ userId: user.id, role: user.role });
  const refreshToken = signRefreshToken({ userId: user.id, role: user.role });

  return { user: safeUser!, accessToken, refreshToken };
}

