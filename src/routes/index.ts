import { Router } from "express";
import { adminRoutes } from "../modules/admin/admin.route";
import { authRoutes } from "../modules/auth/auth.route";
import { categoryRoutes } from "../modules/categories/categories.route";
import { paymentRoutes } from "../modules/payments/payments.route";
import { landlordPropertyRoutes, propertyRoutes } from "../modules/properties/properties.route";
import { landlordRequestRoutes, rentalRoutes } from "../modules/rentals/rentals.route";
import { reviewRoutes } from "../modules/reviews/reviews.route";
import { userRoutes } from "../modules/users/users.route";

export const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/users", userRoutes);
routes.use("/admin", adminRoutes);
routes.use("/categories", categoryRoutes);
routes.use("/properties", propertyRoutes);
routes.use("/landlord/properties", landlordPropertyRoutes);
routes.use("/rentals", rentalRoutes);
routes.use("/landlord/requests", landlordRequestRoutes);
routes.use("/payments", paymentRoutes);
routes.use("/reviews", reviewRoutes);
