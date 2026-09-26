import AppError from "../errors/AppError.js";
import { transporter, baseEmailLayout } from "./mail.config.js";

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
