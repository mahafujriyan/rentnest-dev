import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { getRental, getRentals, patchRentalStatus, postRental } from "./rentals.controller";
import {
  createRentalSchema,
  listRentalsSchema,
  rentalIdSchema,
  updateRentalStatusSchema
} from "./rentals.validation";

export const rentalRoutes = Router();
export const landlordRequestRoutes = Router();

rentalRoutes.post("/", auth("TENANT"), validateRequest(createRentalSchema), postRental);
rentalRoutes.get("/", auth("TENANT", "LANDLORD", "ADMIN"), validateRequest(listRentalsSchema), getRentals);
rentalRoutes.get("/:id", auth("TENANT", "LANDLORD", "ADMIN"), validateRequest(rentalIdSchema), getRental);

landlordRequestRoutes.get(
  "/",
  auth("LANDLORD"),
  validateRequest(listRentalsSchema),
  getRentals
);
landlordRequestRoutes.patch(
  "/:id",
  auth("LANDLORD"),
  validateRequest(updateRentalStatusSchema),
  patchRentalStatus
);
