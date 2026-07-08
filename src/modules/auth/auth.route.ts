import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { authLimiter } from "../../middlewares/rateLimit";
import { login, logout, me, register } from "./auth.controller";
import { loginSchema, registerSchema } from "./auth.validation";

export const authRoutes = Router();

authRoutes.post("/register", authLimiter, validateRequest(registerSchema), register);
authRoutes.post("/login", authLimiter, validateRequest(loginSchema), login);
authRoutes.get("/me", auth(), me);
authRoutes.post("/logout", auth(), logout);

