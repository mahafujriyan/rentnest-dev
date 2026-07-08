import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  getPayment,
  getPayments,
  postConfirmPayment,
  postCreatePayment
} from "./payments.controller";
import { confirmPaymentSchema, createPaymentSchema, paymentIdSchema } from "./payments.validation";

export const paymentRoutes = Router();

paymentRoutes.post("/create", auth("TENANT"), validateRequest(createPaymentSchema), postCreatePayment);
paymentRoutes.post("/confirm", auth("TENANT"), validateRequest(confirmPaymentSchema), postConfirmPayment);
paymentRoutes.get("/", auth("TENANT"), getPayments);
paymentRoutes.get("/:id", auth("TENANT"), validateRequest(paymentIdSchema), getPayment);
