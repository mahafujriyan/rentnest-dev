import type { Response } from "express";

type Meta = {
  page: number;
  limit: number;
  total: number;
};

export function sendResponse<T>(
  res: Response,
  payload: { statusCode?: number; message: string; data: T; meta?: Meta }
) {
  const { statusCode = 200, message, data, meta } = payload;
  res.status(statusCode).json({
    success: true,
    message,
    ...(meta ? { meta } : {}),
    data
  });
}

