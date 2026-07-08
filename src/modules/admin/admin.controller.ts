import type { RequestHandler } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { createCategory } from "../categories/categories.service";
import { adminDeleteProperty, adminListProperties } from "../properties/properties.service";
import { adminListRentals } from "../rentals/rentals.service";
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

export const postCategory: RequestHandler = catchAsync(async (req, res) => {
  const category = await createCategory(req.body);
  sendResponse(res, { statusCode: 201, message: "Category created", data: category });
});

export const getProperties: RequestHandler = catchAsync(async (_req, res) => {
  const properties = await adminListProperties();
  sendResponse(res, { message: "Properties fetched", data: properties });
});

export const deleteProperty: RequestHandler = catchAsync(async (req, res) => {
  await adminDeleteProperty(String(req.params.id));
  sendResponse(res, { message: "Property deleted", data: {} });
});

export const getRentals: RequestHandler = catchAsync(async (_req, res) => {
  const rentals = await adminListRentals();
  sendResponse(res, { message: "Rental requests fetched", data: rentals });
});

