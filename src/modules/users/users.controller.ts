import type { RequestHandler } from "express";
import { AppError } from "../../errors/AppError";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { getMyProfile, updateMyProfile } from "./users.service";

export const getMe: RequestHandler = catchAsync(async (req, res) => {
  if (!req.user) throw new AppError(401, "Unauthorized");
  const user = await getMyProfile(req.user.id);
  sendResponse(res, { message: "Profile fetched", data: user });
});

export const updateMe: RequestHandler = catchAsync(async (req, res) => {
  if (!req.user) throw new AppError(401, "Unauthorized");
  const user = await updateMyProfile(req.user.id, req.body);
  sendResponse(res, { message: "Profile updated", data: user });
});

