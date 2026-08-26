import type { AuthRequest } from "./auth.types.js";
import asyncHandler from "../../utils/errors/asyncHandler.js";
import type { Request, Response } from "express";
import type {
  LoginInput,
  PasswordForgotRequestInput,
  PasswordForgotValidateInput,
  PasswordResetInput,
  RegisterRequestInput,
  RegisterValidateInput,
} from "./auth.zod.js";
import {
  loginService,
  meService,
  passwordForgotRequestService,
  passwordForgotValidateService,
  passwordResetService,
  registerRequestService,
  registerValidateService,
} from "./auth.service.js";
import generateToken from "../../utils/jwt/generateToken.js";

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

    const id = await registerValidateService({ email, otp });

    generateToken(res, id);

    res.status(200).json({
      success: "success",
      message: "Registration successful",
    });
  },
);

// Login / Logout / Me

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginInput;

  const id = await loginService({ email, password });

  generateToken(res, id);

  res.status(200).json({
    success: "success",
    message: "Login successful",
  });
});

export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  res.clearCookie("access_token");
  res.status(200).json({
    success: "success",
    message: "Logout successful",
  });
});

export const me = asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = req.user?.id as string;

  const user = await meService(id);

  res.status(200).json({
    success: "success",
    message: "User fetched successfully",
    data: user,
  });
});

// Password

export const passwordForgotRequest = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body as PasswordForgotRequestInput;

    await passwordForgotRequestService({ email });

    res.status(200).json({
      success: "success",
      message:
        "OTP sent to email. Check your email or spam or try again after 10 minutes.",
    });
  },
);

export const passwordForgotValidate = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, otp } = req.body as PasswordForgotValidateInput;

    await passwordForgotValidateService({ email, otp });

    res.status(200).json({
      success: "success",
      message: "OTP verified successfully",
    });
  },
);

export const passwordReset = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, newPassword } = req.body as PasswordResetInput;

    await passwordResetService({ email, newPassword });

    res.status(200).json({
      success: "success",
      message: "Password reset successfully. You can now login.",
    });
  },
);
