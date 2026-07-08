import type { RequestHandler } from "express";
import { AppError } from "../../errors/AppError";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { createReview } from "./reviews.service";

export const postReview: RequestHandler = catchAsync(async (req, res) => {
  if (!req.user) throw new AppError(401, "Unauthorized");
  const review = await createReview(req.user.id, req.body);
  sendResponse(res, { statusCode: 201, message: "Review submitted", data: review });
});
