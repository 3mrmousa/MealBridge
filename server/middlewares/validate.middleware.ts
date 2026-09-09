import type z from "zod";
import asyncHandler from "../utils/errors/asyncHandler.js";
import type { NextFunction, Request, Response } from "express";
import type { ParsedQs } from "qs";

export const validate = (schema: z.ZodObject<any>) => {
  return asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const parsedData = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      req.body = parsedData.body as Record<string, unknown>;
      req.query = parsedData.query as ParsedQs;
      req.params = parsedData.params as Record<string, string>;

      next();
    },
  );
};
