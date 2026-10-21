import AppError from "../errors/AppError.js";
import { transporter, baseEmailLayout, defaultSender } from "./mail.config.js";

export const sendVerificationStatusChangeMail = async (
  email: string,
  status: "Accepted" | "Rejected",
  role: string,
  message: string,
) => {
  const isAccepted = status === "Accepted";
  const statusLabel = isAccepted ? "Approved" : "Rejected";
  const color = isAccepted ? "#059669" : "#dc2626";
  const bgColor = isAccepted ? "#f0fdf4" : "#fef2f2";
  const borderColor = isAccepted ? "#86efac" : "#fca5a5";

  const html = baseEmailLayout(
    `Verification Request ${statusLabel}`,
    `
      <p style="margin-top: 0;">Hello,</p>
      <p>
        ${
          isAccepted
            ? `Great news! Your verification request for the <strong>${role}</strong> role has been approved by the administration.`
            : `We have reviewed your verification request for the <strong>${role}</strong> role. Unfortunately, your request was not approved at this time.`
        }
      </p>
      <div style="background-color: ${bgColor}; border: 1px dashed ${borderColor}; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 22px; font-weight: 700; color: ${color}; letter-spacing: 0.5px;">
          ${statusLabel.toUpperCase()}
        </span>
        <p style="margin-top: 12px; margin-bottom: 0; color: #374151; font-size: 15px; line-height: 1.5;">
          ${message ? `<strong>Details:</strong> "${message}"` : isAccepted ? "You now have full access to your role features." : "Please review the requirements and reapply."}
        </p>
      </div>
      <p style="margin-bottom: 0;">
        ${
          isAccepted
            ? "You can now log in and start using all the features of your role on MealBridge."
            : "If you have questions or believe this was a mistake, please contact our support team."
        }
      </p>
    `,
  );

  try {
    await transporter.sendMail({
      from: defaultSender,
      to: email,
      subject: `MealBridge - Verification Request ${statusLabel}`,
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
  const statusLabel = isUnblocked ? "Reactivated" : "Suspended";
  const color = isUnblocked ? "#059669" : "#dc2626";
  const bgColor = isUnblocked ? "#f0fdf4" : "#fef2f2";
  const borderColor = isUnblocked ? "#86efac" : "#fca5a5";

  const html = baseEmailLayout(
    `Account ${statusLabel}`,
    `
      <p style="margin-top: 0;">Hello,</p>
      <p>
        ${
          isUnblocked
            ? "Good news! Your MealBridge account has been reactivated by the administration."
            : "Please be advised that your MealBridge account has been suspended by the administration."
        }
      </p>
      <div style="background-color: ${bgColor}; border: 1px dashed ${borderColor}; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 22px; font-weight: 700; color: ${color}; letter-spacing: 0.5px;">
          ACCOUNT ${statusLabel.toUpperCase()}
        </span>
        <p style="margin-top: 12px; margin-bottom: 0; color: #374151; font-size: 15px; line-height: 1.5;">
          ${message ? `<strong>Reason:</strong> "${message}"` : isUnblocked ? "Your account is once again in good standing." : "Suspended due to administrative review."}
        </p>
      </div>
      <p style="margin-bottom: 0;">
        ${
          isUnblocked
            ? "You can now log in and resume using MealBridge."
            : "If you believe this was an error or would like to submit an appeal, please contact our support team."
        }
      </p>
    `,
  );

  try {
    await transporter.sendMail({
      from: defaultSender,
      to: email,
      subject: `MealBridge - Account ${statusLabel}`,
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

