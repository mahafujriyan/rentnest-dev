import type { RequestHandler } from "express";
import type { ZodTypeAny } from "zod";

export const validateRequest = (schema: ZodTypeAny): RequestHandler => (req, _res, next) => {
  const parsed = schema.parse({
    body: req.body,
    query: req.query,
    params: req.params,
    cookies: req.cookies
  }) as {
    body?: unknown;
    query?: unknown;
    params?: unknown;
  };

  // Write coerced/transformed values back so controllers/Prisma get proper types
  // (e.g. z.coerce.date() turns "2026-09-01" into a Date object).
  if (parsed.body !== undefined) {
    req.body = parsed.body;
  }
  next();
};
