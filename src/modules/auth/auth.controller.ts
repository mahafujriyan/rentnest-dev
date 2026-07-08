import type { RequestHandler } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { env } from "../../config/env";
import { AppError } from "../../errors/AppError";
import { loginUser, registerUser } from "./auth.service";
import { prisma } from "../../config/prisma";

function cookieOptions() {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? ("none" as const) : ("lax" as const),
    maxAge: 24 * 60 * 60 * 1000
  };
}

export const register: RequestHandler = catchAsync(async (req, res) => {
  const { user, accessToken, refreshToken } = await registerUser(req.body);

  res.cookie("accessToken", accessToken, cookieOptions());
  res.cookie("refreshToken", refreshToken, { ...cookieOptions(), maxAge: 7 * 24 * 60 * 60 * 1000 });

  sendResponse(res, { statusCode: 201, message: "Registered successfully", data: { user, accessToken } });
});

export const login: RequestHandler = catchAsync(async (req, res) => {
  const { user, accessToken, refreshToken } = await loginUser(req.body);

  res.cookie("accessToken", accessToken, cookieOptions());
  res.cookie("refreshToken", refreshToken, { ...cookieOptions(), maxAge: 7 * 24 * 60 * 60 * 1000 });

  sendResponse(res, { message: "Logged in successfully", data: { user, accessToken } });
});

export const me: RequestHandler = catchAsync(async (req, res) => {
  if (!req.user) throw new AppError(401, "Unauthorized");
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, phone: true, role: true, status: true, avatar: true, createdAt: true }
  });
  if (!user) throw new AppError(401, "Unauthorized");
  sendResponse(res, { message: "Profile fetched", data: user });
});

export const logout: RequestHandler = catchAsync(async (_req, res) => {
  res.clearCookie("accessToken", cookieOptions());
  res.clearCookie("refreshToken", cookieOptions());
  sendResponse(res, { message: "Logged out successfully", data: {} });
});

