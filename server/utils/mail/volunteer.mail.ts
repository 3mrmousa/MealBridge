import AppError from "../errors/AppError.js";
import { baseEmailLayout, transporter } from "./mail.config.js";

export const sendAcceptPickupRequestRecipientMail = async (
  email: string,
  recipientName: string,
  donationTitle: string,
  deliveryAddress: string,
) => {
  const html = baseEmailLayout(
    `Your Pickup Request was Accepted!`,
    `
      <p style="margin-top: 0;">Hello ${recipientName},</p>
      <p>Great news! A volunteer has accepted the pickup request for your claimed donation "<strong>${donationTitle}</strong>".</p>
      <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 20px; font-weight: bold; color: #10b981;">
          Volunteer Assigned
        </span>
        <p style="margin-top: 12px; margin-bottom: 0; color: #4b5563; font-size: 16px;">
          The volunteer will pick up the meal and deliver it to:
          <br />
          <strong>${deliveryAddress}</strong>
        </p>
      </div>
      <p style="margin-bottom: 0;">You can check your MealBridge dashboard to follow delivery updates.</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Pickup Request Accepted - MealBridge",
      html,
    });
  } catch (error: any) {
    throw new AppError(
      error?.message || "Failed to send pickup acceptance email to recipient",
      error?.code || error?.statusCode || 500,
      error,
    );
  }
};

export const sendAcceptPickupRequestDonorMail = async (
  email: string,
  donorName: string,
  donationTitle: string,
  pickupAddress: string,
) => {
  const html = baseEmailLayout(
    `Volunteer Confirmed for Your Donation Pickup`,
    `
      <p style="margin-top: 0;">Hello ${donorName},</p>
      <p>A volunteer driver has accepted the pickup request for your donation "<strong>${donationTitle}</strong>".</p>
      <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 20px; font-weight: bold; color: #10b981;">
          Pickup Confirmed
        </span>
        <p style="margin-top: 12px; margin-bottom: 0; color: #4b5563; font-size: 16px;">
          The volunteer will arrive at your pickup address:
          <br />
          <strong>${pickupAddress}</strong>
        </p>
      </div>
      <p style="margin-bottom: 0;">Thank you for your generosity in feeding communities and reducing food waste!</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Volunteer Confirmed for Pickup - MealBridge",
      html,
    });
  } catch (error: any) {
    throw new AppError(
      error?.message || "Failed to send pickup acceptance email to donor",
      error?.code || error?.statusCode || 500,
      error,
    );
  }
};

export const sendRejectPickupRequestRecipientMail = async (
  email: string,
  recipientName: string,
  donationTitle: string,
) => {
  const html = baseEmailLayout(
    `Update on your Pickup Request`,
    `
      <p style="margin-top: 0;">Hello ${recipientName},</p>
      <p>We are writing to inform you that a volunteer was unable to accept your pickup request for the donation "<strong>${donationTitle}</strong>".</p>
      <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 20px; font-weight: bold; color: #ef4444;">
          Pickup Request Declined
        </span>
        <p style="margin-top: 12px; margin-bottom: 0; color: #4b5563; font-size: 16px;">
          Your donation claim remains active. You can request another volunteer or arrange self-pickup.
        </p>
      </div>
      <p style="margin-bottom: 0;">Please visit your MealBridge dashboard for more details.</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Pickup Request Update - MealBridge",
      html,
    });
  } catch (error: any) {
    throw new AppError(
      error?.message || "Failed to send pickup rejection email to recipient",
      error?.code || error?.statusCode || 500,
      error,
    );
  }
};
