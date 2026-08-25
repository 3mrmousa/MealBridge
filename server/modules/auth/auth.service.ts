import prisma from "../../database/index.js";
import AppError from "../../utils/errors/AppError.js";
import { sendRegisterRequestOtpMail } from "../../utils/mail/email.service.js";
import { generateOtp, verifyOtp } from "../../utils/otp/generateOtp.js";
import { getOtpSession, setOtpSession } from "../../utils/otp/otp.redis.js";
import { hashPassword } from "../../utils/password/passwordFunctions.js";
import type { OtpSessionDataRegisterRequest } from "./auth.otp.store.js";
import type {
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
    { hashedOtp, user: { name, email, hashedPassword, phone, role } },
    600,
  );

  sendRegisterRequestOtpMail(email, otp);
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

  await prisma.user.create({
    data: {
      name: session.user.name,
      email: session.user.email,
      passwordHash: session.user.hashedPassword,
      phone: session.user.phone,
      role: session.user.role as any,
      isEmailVerified: true,
    },
  });
};
