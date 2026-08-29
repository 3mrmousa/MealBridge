import nodemailer from "nodemailer";
import AppError from "../errors/AppError.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const baseEmailLayout = (title: string, content: string) => `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; padding: 40px 20px; text-align: center;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); text-align: left;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #a855f7; margin: 0; font-size: 28px; letter-spacing: -0.5px;">MealBridge</h1>
      </div>
      <h2 style="color: #1f2937; font-size: 20px; margin-top: 0; margin-bottom: 24px; text-align: center;">${title}</h2>
      <div style="color: #4b5563; font-size: 16px; line-height: 1.6;">
        ${content}
      </div>
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 14px;">
        <p style="margin: 0;">&copy; ${new Date().getFullYear()} MealBridge. All rights reserved.</p>
      </div>
    </div>
  </div>
`;

export const sendRegisterRequestOtpMail = async (
  email: string,
  otp: string,
) => {
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

export const sendChangeEmailOtpMail = async (email: string, otp: string) => {
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
      subject: "MealBridge - Change Email",
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
