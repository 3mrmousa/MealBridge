import type z from "zod";
import asyncHandler from "../utils/errors/asyncHandler.js";
import type { NextFunction, Request, Response } from "express";

export const validate = (schema: z.ZodObject<any>) => {
  return asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const parsedData = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (parsedData.body !== undefined) {
        req.body = parsedData.body as Record<string, unknown>;
      }

      if (parsedData.query !== undefined) {
        Object.defineProperty(req, "query", {
          value: parsedData.query,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      }

      if (parsedData.params !== undefined) {
        Object.defineProperty(req, "params", {
          value: parsedData.params,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      }

      next();
    },
  );
};
