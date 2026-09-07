import { rateLimit } from "express-rate-limit";
import AppError from "../utils/errors/AppError.js";

export const authRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  handler: (_req, _res, next) => {
    next(new AppError("Too many requests. Please try again later.", 429));
  },
});
