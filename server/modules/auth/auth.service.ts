import prisma from "../../database/index.js";
import AppError from "../../utils/errors/AppError.js";
import {
  sendForgotPasswordOtpMail,
  sendRegisterRequestOtpMail,
} from "../../utils/mail/email.service.js";
import { generateOtp, verifyOtp } from "../../utils/otp/generateOtp.js";
import {
  deleteOtpSession,
  getOtpSession,
  setOtpSession,
} from "../../utils/otp/otp.redis.js";
import {
  comparePassword,
  hashPassword,
} from "../../utils/password/passwordFunctions.js";
import type {
  OtpSessionDataPasswordForgotRequest,
  OtpSessionDataRegisterRequest,
} from "./auth.otp.store.js";
import type { IUser } from "./auth.types.js";
import type {
  LoginInput,
  PasswordForgotRequestInput,
  PasswordForgotValidateInput,
  PasswordResetInput,
  RegisterRequestInput,
  RegisterValidateInput,
} from "./auth.zod.js";

export const registerRequestService = async (data: RegisterRequestInput) => {
  const { name, email, password, phone, role } = data;
  const existingUser = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (existingUser) {
    throw new AppError("Email already used!", 400);
  }

  const phoneNumber = phone?.startsWith("+20")
    ? phone
    : phone?.startsWith("20")
      ? `+${phone}`
      : phone?.startsWith("0")
        ? `+2${phone}`
        : `+20${phone}`;

  const existingPhone = await prisma.user.findUnique({
    where: { phone: phoneNumber },
  });
  if (existingPhone) {
    throw new AppError("Phone number already used!", 400);
  }

  const session = await getOtpSession<OtpSessionDataRegisterRequest>(
    `register:${email}`,
  );

  if (session) {
    throw new AppError(
      "You already have an OTP request check your email or spam or try again later",
      400,
    );
  }

  const { otp, hashedOtp } = generateOtp();
  const hashedPassword = await hashPassword(password);

  await setOtpSession(
    `register:${email}`,
    {
      hashedOtp,
      user: { name, email, hashedPassword, phone: phoneNumber, role },
    } as OtpSessionDataRegisterRequest,
    600,
  );

  await sendRegisterRequestOtpMail(email, otp);
};

export const registerValidateService = async (data: RegisterValidateInput) => {
  const { email, otp } = data;
  const session = await getOtpSession<OtpSessionDataRegisterRequest>(
    `register:${email}`,
  );

  if (!session) {
    throw new AppError("Invalid or expired OTP", 400);
  }

  const isMatch = verifyOtp(otp, session.hashedOtp);

  if (!isMatch) {
    throw new AppError("Invalid or expired OTP", 400);
  }

  const user = await prisma.user.create({
    data: {
      name: session.user.name,
      email: session.user.email,
      passwordHash: session.user.hashedPassword,
      phone: session.user.phone,
      role: session.user.role as any,
      isEmailVerified: true,
    },
  });

  await deleteOtpSession(`register:${email}`);

  return user.id;
};

export const loginService = async (data: LoginInput) => {
  const { email, password } = data;

  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.isEmailVerified) {
    throw new AppError("Please verify your email first", 400);
  }

  const isPasswordMatch = await comparePassword(password, user.passwordHash);

  if (!isPasswordMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  return user.id;
};

export const meService = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: id.toString(),
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isEmailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

export const passwordForgotRequestService = async (
  data: PasswordForgotRequestInput,
) => {
  const { email } = data;
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const existingSession =
    await getOtpSession<OtpSessionDataPasswordForgotRequest>(
      `forgotPassword:${email}`,
    );

  if (existingSession) {
    throw new AppError(
      "You already have an OTP request check your email or spam or try again later",
      400,
    );
  }

  const { otp, hashedOtp } = generateOtp();

  await setOtpSession(
    `forgotPassword:${email}`,
    {
      hashedOtp,
      verified: false,
      user: { email },
    } as OtpSessionDataPasswordForgotRequest,
    600,
  );

  await sendForgotPasswordOtpMail(email, otp);
};

export const passwordForgotValidateService = async (
  data: PasswordForgotValidateInput,
) => {
  const { email, otp } = data;
  const session = await getOtpSession<OtpSessionDataPasswordForgotRequest>(
    `forgotPassword:${email}`,
  );

  if (!session) {
    throw new AppError("Invalid or expired OTP", 400);
  }

  const isMatch = verifyOtp(otp, session.hashedOtp);

  if (!isMatch) {
    throw new AppError("Invalid or expired OTP", 400);
  }

  await setOtpSession(
    `forgotPassword:${email}`,
    {
      ...session,
      verified: true,
    } as OtpSessionDataPasswordForgotRequest,
    300,
  );
};

export const passwordResetService = async (data: PasswordResetInput) => {
  const { email, newPassword } = data;
  const session = await getOtpSession<OtpSessionDataPasswordForgotRequest>(
    `forgotPassword:${email}`,
  );

  if (!session) {
    throw new AppError("Invalid or expired session", 400);
  }

  if (!session.verified) {
    throw new AppError("OTP has not been verified", 400);
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: {
      email: email,
    },
    data: {
      passwordHash: hashedPassword,
    },
  });

  await deleteOtpSession(`forgotPassword:${email}`);
};
