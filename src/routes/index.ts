import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.route";
import { userRoutes } from "../modules/users/users.route";

export const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/users", userRoutes);

