import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.route";

export const routes = Router();

routes.use("/auth", authRoutes);

