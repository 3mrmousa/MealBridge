import AppError from "../errors/AppError.js";
import { transporter, baseEmailLayout, defaultSender } from "./mail.config.js";

export const sendRegisterRequestOtpMail = async (
  email: string,
  otp: string,
  name?: string,
) => {
  const greeting = name ? `Hello ${name},` : "Hello,";
  const html = baseEmailLayout(
    "Verify Your Email Address",
    `
      <p style="margin-top: 0;">${greeting}</p>
      <p>Thank you for registering with MealBridge! Please enter the One-Time Password (OTP) below to complete your registration and verify your email address:</p>
      <div style="background-color: #faf5ff; border: 1px dashed #d8b4fe; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
        <div style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #7e22ce; margin-bottom: 8px;">Verification Code</div>
        <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #9333ea; font-family: monospace;">
          ${otp}
        </span>
        <p style="margin-top: 12px; margin-bottom: 0; color: #6b7280; font-size: 13px;">
          This code will expire in <strong>10 minutes</strong>.
        </p>
      </div>
      <p style="margin-bottom: 0;">If you did not request this verification, you can safely ignore this email.</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: defaultSender,
      to: email,
      subject: "MealBridge - Verify Your Email",
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

export const sendForgotPasswordOtpMail = async (
  email: string,
  otp: string,
  name?: string,
) => {
  const greeting = name ? `Hello ${name},` : "Hello,";
  const html = baseEmailLayout(
    "Reset Your Password",
    `
      <p style="margin-top: 0;">${greeting}</p>
      <p>We received a request to reset your MealBridge account password. Please enter the following One-Time Password (OTP) to proceed:</p>
      <div style="background-color: #faf5ff; border: 1px dashed #d8b4fe; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
        <div style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #7e22ce; margin-bottom: 8px;">Password Reset Code</div>
        <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #9333ea; font-family: monospace;">
          ${otp}
        </span>
        <p style="margin-top: 12px; margin-bottom: 0; color: #6b7280; font-size: 13px;">
          This code will expire in <strong>10 minutes</strong>.
        </p>
      </div>
      <p style="margin-bottom: 0;">If you did not request a password reset, you can safely ignore this email and your password will remain unchanged.</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: defaultSender,
      to: email,
      subject: "MealBridge - Reset Your Password",
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
  role: string,
) => {
  const html = baseEmailLayout(
    "Welcome to MealBridge!",
    `
      <p style="margin-top: 0;">Hello ${name},</p>
      <p>Welcome to MealBridge! We are excited to have you join our community as a <strong>${role}</strong>.</p>
      <div style="background-color: #faf5ff; border: 1px dashed #d8b4fe; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
        <span style="font-size: 20px; font-weight: 700; color: #9333ea;">
          Your Account is Ready!
        </span>
        <p style="margin-top: 10px; margin-bottom: 0; color: #4b5563; font-size: 15px;">
          You can now log in to your dashboard and start connecting surplus food with communities in need.
        </p>
      </div>
      <p style="margin-bottom: 0;">If you ever have any questions or need assistance, our support team is always here to help.</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: defaultSender,
      to: email,
      subject: "MealBridge - Welcome to MealBridge!",
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

