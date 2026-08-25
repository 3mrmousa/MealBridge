import type z from "zod";
import asyncHandler from "../utils/errors/asyncHandler.js";
import type { NextFunction, Request, Response } from "express";

export const validate = (schema: z.ZodSchema) => {
  return asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      next();
    },
  );
};
