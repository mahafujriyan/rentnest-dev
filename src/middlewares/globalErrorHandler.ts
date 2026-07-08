import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { AppError } from "../errors/AppError";

export const globalErrorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  let statusCode = 500;
  let message = "Internal Server Error";
  let errorDetails: unknown = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation Error";
    errorDetails = err.flatten();
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Common Prisma known errors: unique constraint, foreign key, not found
    statusCode = 400;
    message = err.message;
    errorDetails = { code: err.code, meta: err.meta };
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = "Database Validation Error";
    errorDetails = err.message;
  } else if (err instanceof Error) {
    message = err.message || message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorDetails
  });
};

