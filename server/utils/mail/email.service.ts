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

export const sendChangeEmailOtpMail = async (email: string, otp: string) => {
  const html = baseEmailLayout(
    "Verify your email",
    `
      <p style="margin-top: 0;">Hello,</p>
      <p>Please enter the following OTP to change your email:</p>
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

export const sendVerificationStatusChangeMail = async (
  email: string,
  status: "Accepted" | "Rejected",
  role: string,
  message: string,
) => {
  const isAccepted = status === "Accepted";
  const color = isAccepted ? "#10b981" : "#ef4444";
  const bgColor = isAccepted ? "#d1fae5" : "#fee2e2"; 
  const borderColor = isAccepted ? "#34d399" : "#f87171"; 

  const html = baseEmailLayout(
    `Verification Status ${status}`,
    `
      <p style="margin-top: 0;">Hello,</p>
      <p>Your verification status for the <strong>${role}</strong> role has been updated.</p>
      <div style="background-color: ${bgColor}; border: 1px dashed ${borderColor}; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 24px; font-weight: bold; color: ${color};">
          ${status.toUpperCase()}
        </span>
        <p style="margin-top: 12px; margin-bottom: 0; color: #4b5563; font-size: 16px;">
          ${message}
        </p>
      </div>
      <p style="margin-bottom: 0;">If you have any questions, please contact our support team.</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `MealBridge - Verification ${status}`,
      html,
    });
  } catch (error: any) {
    throw new AppError(
      error?.message || "Failed to send verification status email",
      error?.code || error?.statusCode || 500,
      error,
    );
  }
};

export const sendBlockStatusChangeMail = async (
  email: string,
  status: "Blocked" | "Unblocked",
  message: string,
) => {
  const isUnblocked = status === "Unblocked";
  const color = isUnblocked ? "#10b981" : "#ef4444"; // Emerald or Red
  const bgColor = isUnblocked ? "#d1fae5" : "#fee2e2"; 
  const borderColor = isUnblocked ? "#34d399" : "#f87171"; 

  const html = baseEmailLayout(
    `Account ${status}`,
    `
      <p style="margin-top: 0;">Hello,</p>
      <p>Your account status has been updated by the administration.</p>
      <div style="background-color: ${bgColor}; border: 1px dashed ${borderColor}; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 24px; font-weight: bold; color: ${color};">
          ${status.toUpperCase()}
        </span>
        <p style="margin-top: 12px; margin-bottom: 0; color: #4b5563; font-size: 16px;">
          ${message}
        </p>
      </div>
      <p style="margin-bottom: 0;">If you have any questions or believe this is a mistake, please contact our support team.</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `MealBridge - Account ${status}`,
      html,
    });
  } catch (error: any) {
    throw new AppError(
      error?.message || "Failed to send account status email",
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
