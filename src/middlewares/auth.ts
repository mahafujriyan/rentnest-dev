import type { RequestHandler } from "express";
import { AppError } from "../errors/AppError";
import { prisma } from "../config/prisma";
import { verifyAccessToken } from "../helpers/jwt";
import type { UserRole } from "../constants/roles";

function getTokenFromRequest(req: Parameters<RequestHandler>[0]) {
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) return auth.slice("Bearer ".length);
  if (req.cookies?.accessToken) return String(req.cookies.accessToken);
  return null;
}

export const auth =
  (...allowedRoles: UserRole[]): RequestHandler =>
  async (req, _res, next) => {
    const token = getTokenFromRequest(req);
    if (!token) return next(new AppError(401, "Unauthorized"));

    try {
      const payload = verifyAccessToken(token);
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, role: true, status: true }
      });

      if (!user) return next(new AppError(401, "Unauthorized"));
      if (user.status === "BANNED") return next(new AppError(403, "User is banned"));

      if (allowedRoles.length && !allowedRoles.includes(user.role as UserRole)) {
        return next(new AppError(403, "Forbidden"));
      }

      req.user = { id: user.id, role: user.role };
      return next();
    } catch {
      return next(new AppError(401, "Invalid or expired token"));
    }
  };

