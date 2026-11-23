import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

/** Validates req.body against a Zod schema and replaces req.body with parsed data. */
export function validateBody<T>(schema: ZodType<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    req.body = schema.parse(req.body);
    next();
  };
}

/** Validates req.query against a Zod schema and stores parsed result on res.locals.query. */
export function validateQuery<T>(schema: ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    res.locals.query = schema.parse(req.query);
    next();
  };
}

