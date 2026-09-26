import AppError from "../errors/AppError.js";
import { transporter, baseEmailLayout } from "./mail.config.js";

export const sendRegisterRequestOtpMail = async (email: string, otp: string) => {
  const html = baseEmailLayout(
    "Verify your email",
    `
      <p style="margin-top: 0;">Hello,</p>
      <p>Thank you for registering with MealBridge. Please enter the following OTP to complete your registration:</p>
      <div style="background-color: #faf5ff; border: 1px dashed #d8b4fe; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #a855f7;">
          ${otp}
        </span>
      </div>
      <p>This OTP will expire in <strong>10 minutes</strong>.</p>
      <p style="margin-bottom: 0;">If you didn't request this, you can safely ignore this email.</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "MealBridge - Verify your email",
      html,
    });
  } catch (error: any) {
    throw new AppError(
      error?.message || "Failed to send OTP email",
      error?.code || error?.statusCode || 500,
      error,
    );
  }
};

export const sendForgotPasswordOtpMail = async (email: string, otp: string) => {
  const html = baseEmailLayout(
    "Verify your email",
    `
      <p style="margin-top: 0;">Hello,</p>
      <p>Please enter the following OTP to reset your password:</p>
      <div style="background-color: #faf5ff; border: 1px dashed #d8b4fe; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #a855f7;">
          ${otp}
        </span>
      </div>
      <p>This OTP will expire in <strong>10 minutes</strong>.</p>
      <p style="margin-bottom: 0;">If you didn't request this, you can safely ignore this email.</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "MealBridge - Forgot password",
      html,
    });
  } catch (error: any) {
    throw new AppError(
      error?.message || "Failed to send OTP email",
      error?.code || error?.statusCode || 500,
      error,
    );
  }
};

export const sendWelcomeMail = async (
  email: string,
  name: string,
  role: "Manager" | "User",
) => {
  const html = baseEmailLayout(
    `Welcome to MealBridge!`,
    `
      <p style="margin-top: 0;">Hello ${name},</p>
      <p>Welcome to MealBridge! We are excited to have you on board as a <strong>${role}</strong>.</p>
      <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 20px; font-weight: bold; color: #a855f7;">
          Your account is ready!
        </span>
        <p style="margin-top: 12px; margin-bottom: 0; color: #4b5563; font-size: 16px;">
          You can now log in and start using the platform.
        </p>
      </div>
      <p style="margin-bottom: 0;">If you have any questions, please contact our support team.</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Welcome to MealBridge",
      html,
    });
  } catch (error: any) {
    throw new AppError(
      error?.message || "Failed to send welcome email",
      error?.code || error?.statusCode || 500,
      error,
    );
  }
};
