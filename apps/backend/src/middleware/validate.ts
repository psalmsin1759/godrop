import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { fail } from "../utils/response";

export function validate(schema: ZodSchema, target: "body" | "query" = "body") {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(target === "body" ? req.body : req.query);
    if (!result.success) {
      return fail(res, result.error.errors.map((e) => e.message).join(", "));
    }
    if (target === "body") req.body = result.data;
    else (req as any).validatedQuery = result.data;
    next();
  };
}
