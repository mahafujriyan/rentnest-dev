import type { RequestHandler } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { dashboardStats, listUsers, updateUserStatus } from "./admin.service";

export const getUsers: RequestHandler = catchAsync(async (_req, res) => {
  const users = await listUsers();
  sendResponse(res, { message: "Users fetched", data: users });
});

export const patchUserStatus: RequestHandler = catchAsync(async (req, res) => {
  const userId = String(req.params.id);
  const user = await updateUserStatus(userId, req.body.status);
  sendResponse(res, { message: "User status updated", data: user });
});

export const getDashboard: RequestHandler = catchAsync(async (_req, res) => {
  const stats = await dashboardStats();
  sendResponse(res, { message: "Dashboard stats fetched", data: stats });
});

