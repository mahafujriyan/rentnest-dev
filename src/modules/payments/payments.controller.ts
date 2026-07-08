import type { RequestHandler } from "express";
import { AppError } from "../../errors/AppError";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { confirmPayment, createPaymentIntent, getPaymentById, listPayments } from "./payments.service";

export const postCreatePayment: RequestHandler = catchAsync(async (req, res) => {
  if (!req.user) throw new AppError(401, "Unauthorized");
  const result = await createPaymentIntent(req.user.id, req.body.rentalRequestId);
  sendResponse(res, { statusCode: 201, message: "Payment intent created", data: result });
});

export const postConfirmPayment: RequestHandler = catchAsync(async (req, res) => {
  if (!req.user) throw new AppError(401, "Unauthorized");
  const payment = await confirmPayment(req.user.id, req.body.rentalRequestId, req.body.paymentIntentId);
  sendResponse(res, { message: "Payment confirmed", data: payment });
});

export const getPayments: RequestHandler = catchAsync(async (req, res) => {
  if (!req.user) throw new AppError(401, "Unauthorized");
  const payments = await listPayments(req.user.id);
  sendResponse(res, { message: "Payments fetched", data: payments });
});

export const getPayment: RequestHandler = catchAsync(async (req, res) => {
  if (!req.user) throw new AppError(401, "Unauthorized");
  const payment = await getPaymentById(req.user.id, String(req.params.id));
  sendResponse(res, { message: "Payment fetched", data: payment });
});
