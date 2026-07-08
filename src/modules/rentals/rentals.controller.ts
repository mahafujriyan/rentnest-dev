import type { RequestHandler } from "express";
import { AppError } from "../../errors/AppError";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import {
  createRentalRequest,
  getRentalRequestById,
  listRentalRequests,
  updateRentalStatus
} from "./rentals.service";

export const postRental: RequestHandler = catchAsync(async (req, res) => {
  if (!req.user) throw new AppError(401, "Unauthorized");
  const rental = await createRentalRequest(req.user.id, req.body);
  sendResponse(res, { statusCode: 201, message: "Rental request submitted", data: rental });
});

export const getRentals: RequestHandler = catchAsync(async (req, res) => {
  if (!req.user) throw new AppError(401, "Unauthorized");
  const result = await listRentalRequests(
    req.user.id,
    req.user.role,
    req.query as { page?: string; limit?: string; status?: "PENDING" | "APPROVED" | "REJECTED" | "ACTIVE" | "COMPLETED" }
  );
  sendResponse(res, {
    message: "Rental requests fetched",
    data: result.rentals,
    meta: { page: result.page, limit: result.limit, total: result.total }
  });
});

export const getRental: RequestHandler = catchAsync(async (req, res) => {
  if (!req.user) throw new AppError(401, "Unauthorized");
  const rental = await getRentalRequestById(req.user.id, req.user.role, String(req.params.id));
  sendResponse(res, { message: "Rental request fetched", data: rental });
});

export const patchRentalStatus: RequestHandler = catchAsync(async (req, res) => {
  if (!req.user) throw new AppError(401, "Unauthorized");
  const rental = await updateRentalStatus(req.user.id, String(req.params.id), req.body.status);
  sendResponse(res, { message: `Rental request ${req.body.status.toLowerCase()}`, data: rental });
});
