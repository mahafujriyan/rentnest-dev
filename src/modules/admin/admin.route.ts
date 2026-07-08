import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { createCategorySchema } from "../categories/categories.validation";
import { propertyIdSchema } from "../properties/properties.validation";
import {
  deleteProperty,
  getDashboard,
  getProperties,
  getRentals,
  getUsers,
  patchUserStatus,
  postCategory
} from "./admin.controller";
import { updateUserStatusSchema } from "./admin.validation";

export const adminRoutes = Router();

adminRoutes.get("/users", auth("ADMIN"), getUsers);
adminRoutes.patch("/users/:id", auth("ADMIN"), validateRequest(updateUserStatusSchema), patchUserStatus);
adminRoutes.get("/dashboard", auth("ADMIN"), getDashboard);
adminRoutes.post("/categories", auth("ADMIN"), validateRequest(createCategorySchema), postCategory);
adminRoutes.get("/properties", auth("ADMIN"), getProperties);
adminRoutes.delete("/properties/:id", auth("ADMIN"), validateRequest(propertyIdSchema), deleteProperty);
adminRoutes.get("/rentals", auth("ADMIN"), getRentals);

