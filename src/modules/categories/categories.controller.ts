import type { RequestHandler } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { createCategory, listCategories } from "./categories.service";

export const getCategories: RequestHandler = catchAsync(async (_req, res) => {
  const categories = await listCategories();
  sendResponse(res, { message: "Categories fetched", data: categories });
});

export const postCategory: RequestHandler = catchAsync(async (req, res) => {
  const category = await createCategory(req.body);
  sendResponse(res, { statusCode: 201, message: "Category created", data: category });
});
