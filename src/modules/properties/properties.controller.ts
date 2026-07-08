import type { RequestHandler } from "express";
import { AppError } from "../../errors/AppError";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import {
  createProperty,
  deleteProperty,
  getPropertyById,
  listProperties,
  toggleAvailability,
  updateProperty
} from "./properties.service";

export const getProperties: RequestHandler = catchAsync(async (req, res) => {
  const result = await listProperties(req.query as Record<string, string>);
  sendResponse(res, {
    message: "Properties fetched",
    data: result.properties,
    meta: { page: result.page, limit: result.limit, total: result.total }
  });
});

export const getProperty: RequestHandler = catchAsync(async (req, res) => {
  const property = await getPropertyById(String(req.params.id));
  sendResponse(res, { message: "Property fetched", data: property });
});

export const postProperty: RequestHandler = catchAsync(async (req, res) => {
  if (!req.user) throw new AppError(401, "Unauthorized");
  const property = await createProperty(req.user.id, req.body);
  sendResponse(res, { statusCode: 201, message: "Property created", data: property });
});

export const putProperty: RequestHandler = catchAsync(async (req, res) => {
  if (!req.user) throw new AppError(401, "Unauthorized");
  const property = await updateProperty(req.user.id, String(req.params.id), req.body);
  sendResponse(res, { message: "Property updated", data: property });
});

export const removeProperty: RequestHandler = catchAsync(async (req, res) => {
  if (!req.user) throw new AppError(401, "Unauthorized");
  await deleteProperty(req.user.id, String(req.params.id));
  sendResponse(res, { message: "Property deleted", data: {} });
});

export const patchAvailability: RequestHandler = catchAsync(async (req, res) => {
  if (!req.user) throw new AppError(401, "Unauthorized");
  const property = await toggleAvailability(req.user.id, String(req.params.id), req.body.availability);
  sendResponse(res, { message: "Availability updated", data: property });
});
