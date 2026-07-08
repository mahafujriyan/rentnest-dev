import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { getDashboard, getUsers, patchUserStatus } from "./admin.controller";
import { updateUserStatusSchema } from "./admin.validation";

export const adminRoutes = Router();

adminRoutes.get("/users", auth("ADMIN"), getUsers);
adminRoutes.patch("/users/:id", auth("ADMIN"), validateRequest(updateUserStatusSchema), patchUserStatus);
adminRoutes.get("/dashboard", auth("ADMIN"), getDashboard);

