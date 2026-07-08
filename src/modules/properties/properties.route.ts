import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  getProperties,
  getProperty,
  patchAvailability,
  postProperty,
  putProperty,
  removeProperty
} from "./properties.controller";
import {
  createPropertySchema,
  listPropertiesSchema,
  propertyIdSchema,
  toggleAvailabilitySchema,
  updatePropertySchema
} from "./properties.validation";

export const propertyRoutes = Router();
export const landlordPropertyRoutes = Router();

propertyRoutes.get("/", validateRequest(listPropertiesSchema), getProperties);
propertyRoutes.get("/:id", validateRequest(propertyIdSchema), getProperty);

landlordPropertyRoutes.post("/", auth("LANDLORD"), validateRequest(createPropertySchema), postProperty);
landlordPropertyRoutes.put("/:id", auth("LANDLORD"), validateRequest(updatePropertySchema), putProperty);
landlordPropertyRoutes.delete("/:id", auth("LANDLORD"), validateRequest(propertyIdSchema), removeProperty);
landlordPropertyRoutes.patch(
  "/:id/availability",
  auth("LANDLORD"),
  validateRequest(toggleAvailabilitySchema),
  patchAvailability
);
