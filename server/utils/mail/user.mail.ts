import AppError from "../errors/AppError.js";
import { transporter, baseEmailLayout, defaultSender } from "./mail.config.js";

export const sendChangeEmailOtpMail = async (
  email: string,
  otp: string,
  name?: string,
) => {
  const greeting = name ? `Hello ${name},` : "Hello,";
  const html = baseEmailLayout(
    "Verify Your New Email Address",
    `
      <p style="margin-top: 0;">${greeting}</p>
      <p>We received a request to update your email address on MealBridge. Please enter the following One-Time Password (OTP) to confirm and complete this change:</p>
      <div style="background-color: #faf5ff; border: 1px dashed #d8b4fe; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
        <div style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #7e22ce; margin-bottom: 8px;">Email Verification Code</div>
        <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #9333ea; font-family: monospace;">
          ${otp}
        </span>
        <p style="margin-top: 12px; margin-bottom: 0; color: #6b7280; font-size: 13px;">
          This code will expire in <strong>10 minutes</strong>.
        </p>
      </div>
      <p style="margin-bottom: 0;">If you did not request this email change, please secure your account immediately and contact our support team.</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: defaultSender,
      to: email,
      subject: "MealBridge - Verify Your New Email Address",
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

