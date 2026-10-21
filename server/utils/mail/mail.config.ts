import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const defaultSender =
  process.env.EMAIL_FROM || `"MealBridge" <${process.env.EMAIL_USER}>`;

export const baseEmailLayout = (title: string, content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <div style="background-color: #f3f4f6; padding: 40px 16px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 32px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);">
      <div style="text-align: center; margin-bottom: 28px;">
        <h1 style="color: #9333ea; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">MealBridge</h1>
        <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 13px; font-weight: 500;">Bridging Surplus Food to Communities in Need</p>
      </div>
      <h2 style="color: #111827; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 20px; text-align: center;">${title}</h2>
      <div style="color: #374151; font-size: 15px; line-height: 1.6;">
        ${content}
      </div>
      <div style="margin-top: 36px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 13px; line-height: 1.5;">
        <p style="margin: 0 0 8px 0;">This is an automated message from MealBridge. Please do not reply directly to this email.</p>
        <p style="margin: 0;">&copy; ${new Date().getFullYear()} MealBridge. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

export interface EmailCardOptions {
  badge?: string;
  badgeType?: "success" | "danger" | "warning" | "info" | "purple";
  mainText?: string;
  subText?: string;
}

export const emailCard = ({
  badge,
  badgeType = "info",
  mainText,
  subText,
}: EmailCardOptions) => {
  const styles = {
    success: {
      bg: "#f0fdf4",
      border: "#86efac",
      color: "#166534",
    },
    danger: {
      bg: "#fef2f2",
      border: "#fca5a5",
      color: "#991b1b",
    },
    warning: {
      bg: "#fffbeb",
      border: "#fcd34d",
      color: "#92400e",
    },
    info: {
      bg: "#eff6ff",
      border: "#93c5fd",
      color: "#1e40af",
    },
    purple: {
      bg: "#faf5ff",
      border: "#d8b4fe",
      color: "#7e22ce",
    },
  }[badgeType];

  return `
    <div style="background-color: ${styles.bg}; border: 1px dashed ${styles.border}; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
      ${badge ? `<div style="font-size: 18px; font-weight: 700; color: ${styles.color}; letter-spacing: 0.5px;">${badge}</div>` : ""}
      ${mainText ? `<p style="margin-top: ${badge ? "12px" : "0"}; margin-bottom: 0; color: #374151; font-size: 15px; line-height: 1.5;">${mainText}</p>` : ""}
      ${subText ? `<p style="margin-top: 8px; margin-bottom: 0; color: #6b7280; font-size: 13px; line-height: 1.5;">${subText}</p>` : ""}
    </div>
  `;
};
