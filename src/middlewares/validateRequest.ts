import type { RequestHandler } from "express";
import type { ZodTypeAny } from "zod";

export const validateRequest = (schema: ZodTypeAny): RequestHandler => (req, _res, next) => {
  schema.parse({
    body: req.body,
    query: req.query,
    params: req.params,
    cookies: req.cookies
  });
  next();
};

