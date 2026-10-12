import { Router } from "express";
import {
  login,
  logout,
  me,
  passwordForgotRequest,
  passwordForgotValidate,
  passwordReset,
  registerValidate,
  registerRequest,
} from "./auth.controller.js";

import { validate } from "../../middlewares/validate.middleware.js";
import {
  loginSchema,
  passwordForgotRequestSchema,
  passwordForgotValidateSchema,
  passwordResetSchema,
  registerRequestSchema,
  registerValidateSchema,
} from "./auth.zod.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { authRateLimiter } from "../../middlewares/rateLimit.middleware.js";

const authRouter = Router();

authRouter.post(
  "/register/request",
  authRateLimiter,
  validate(registerRequestSchema),
  registerRequest,
);
authRouter.post(
  "/register/validate",
  validate(registerValidateSchema),
  registerValidate,
);

authRouter.post("/login", authRateLimiter, validate(loginSchema), login);
authRouter.post("/logout", protect, logout);
authRouter.get("/me", protect, me);

authRouter.post(
  "/password/forgot/request",
  authRateLimiter,
  validate(passwordForgotRequestSchema),
  passwordForgotRequest,
);
authRouter.post(
  "/password/forgot/validate",
  validate(passwordForgotValidateSchema),
  passwordForgotValidate,
);
authRouter.post(
  "/password/reset",
  validate(passwordResetSchema),
  passwordReset,
);

export default authRouter;
