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
import { registerRequestSchema, registerValidateSchema } from "./auth.zod.js";

const authRouter = Router();

authRouter.post(
  "/register/request",
  validate(registerRequestSchema),
  registerRequest,
);
authRouter.post(
  "/register/validate",
  validate(registerValidateSchema),
  registerValidate,
);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/me", me);

authRouter.post("/password/forgot/request", passwordForgotRequest);
authRouter.post("/password/forgot/validate", passwordForgotValidate);
authRouter.post("/password/reset", passwordReset);

export default authRouter;
