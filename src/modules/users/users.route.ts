import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { getMe, updateMe } from "./users.controller";
import { updateProfileSchema } from "./users.validation";

export const userRoutes = Router();

userRoutes.get("/me", auth(), getMe);
userRoutes.patch("/me", auth(), validateRequest(updateProfileSchema), updateMe);

