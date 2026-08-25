import type { AuthRequest } from "./auth.types.js";
import asyncHandler from "../../utils/errors/asyncHandler.js";
import type { Request, Response } from "express";
import type {
  RegisterRequestInput,
  RegisterValidateInput,
} from "./auth.zod.js";
import {
  registerRequestService,
  registerValidateService,
} from "./auth.service.js";

// Register

export const registerRequest = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, password, phone, role } =
      req.body as RegisterRequestInput;

    await registerRequestService({
      name,
      email,
      password,
      phone,
      role,
    });

    res.status(200).json({
      success: "success",
      message:
        "OTP sent to email. Check your email or spam or try again after 10 minutes.",
    });
  },
);

export const registerValidate = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, otp } = req.body as RegisterValidateInput;

    await registerValidateService({ email, otp });

    res.status(200).json({
      success: "success",
      message: "Registration successful",
    });
  },
);

// Login / Logout / Me

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
});
export const me = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { user } = req;
});

// Password

export const passwordForgotRequest = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
  },
);

export const passwordForgotValidate = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
  },
);

export const passwordReset = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
  },
);
