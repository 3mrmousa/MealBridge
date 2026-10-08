import AppError from "../errors/AppError.js";
import { baseEmailLayout, transporter } from "./mail.config.js";

export const sendAcceptDeliveryRecipientMail = async (
  email: string,
  recipientName: string,
  donationTitle: string,
  deliveryAddress: string,
) => {
  const html = baseEmailLayout(
    `Your Delivery Request was Accepted!`,
    `
      <p style="margin-top: 0;">Hello ${recipientName},</p>
      <p>Great news! A volunteer has accepted the delivery for your claimed donation "<strong>${donationTitle}</strong>".</p>
      <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 20px; font-weight: bold; color: #10b981;">
          Volunteer Assigned
        </span>
        <p style="margin-top: 12px; margin-bottom: 0; color: #4b5563; font-size: 16px;">
          The volunteer will deliver it to:
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
      subject: "Delivery Accepted - MealBridge",
      html,
    });
  } catch (error: any) {
    throw new AppError(
      error?.message || "Failed to send delivery acceptance email to recipient",
      error?.code || error?.statusCode || 500,
      error,
    );
  }
};

export const sendAcceptDeliveryDonorMail = async (
  email: string,
  donorName: string,
  donationTitle: string,
  pickupAddress: string,
) => {
  const html = baseEmailLayout(
    `Volunteer Confirmed for Your Donation Delivery`,
    `
      <p style="margin-top: 0;">Hello ${donorName},</p>
      <p>A volunteer driver has accepted the delivery for your donation "<strong>${donationTitle}</strong>".</p>
      <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 20px; font-weight: bold; color: #10b981;">
          Delivery Confirmed
        </span>
        <p style="margin-top: 12px; margin-bottom: 0; color: #4b5563; font-size: 16px;">
          The volunteer will pick it up from:
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
      subject: "Volunteer Confirmed for Delivery - MealBridge",
      html,
    });
  } catch (error: any) {
    throw new AppError(
      error?.message || "Failed to send delivery acceptance email to donor",
      error?.code || error?.statusCode || 500,
      error,
    );
  }
};

export const sendAcceptDeliveryVolunteerMail = async (
  email: string,
  volunteerName: string,
  donationTitle: string,
  pickupAddress: string,
  deliveryAddress: string,
) => {
  const html = baseEmailLayout(
    `Delivery Confirmed`,
    `
      <p style="margin-top: 0;">Hello ${volunteerName},</p>
      <p>Thank you for accepting the delivery for "<strong>${donationTitle}</strong>".</p>
      <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <p style="margin-top: 12px; margin-bottom: 0; color: #4b5563; font-size: 16px;">
          Pickup from: <strong>${pickupAddress}</strong><br/>
          Deliver to: <strong>${deliveryAddress}</strong>
        </p>
      </div>
    `,
  );

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Delivery Confirmed - MealBridge",
      html,
    });
  } catch (error: any) {
    throw new AppError(
      error?.message || "Failed to send delivery acceptance email to volunteer",
      error?.code || error?.statusCode || 500,
      error,
    );
  }
};

export const sendRejectDeliveryRecipientMail = async (
  email: string,
  recipientName: string,
  donationTitle: string,
) => {
  const html = baseEmailLayout(
    `Update on your Delivery Request`,
    `
      <p style="margin-top: 0;">Hello ${recipientName},</p>
      <p>We are writing to inform you that a volunteer was unable to accept your delivery for the donation "<strong>${donationTitle}</strong>".</p>
      <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 20px; font-weight: bold; color: #ef4444;">
          Delivery Declined
        </span>
        <p style="margin-top: 12px; margin-bottom: 0; color: #4b5563; font-size: 16px;">
          Your donation claim remains active. You can request another volunteer or arrange self-pickup.
        </p>
      </div>
    `,
  );

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Delivery Update - MealBridge",
      html,
    });
  } catch (error: any) {
    throw new AppError(
      error?.message || "Failed to send delivery rejection email to recipient",
      error?.code || error?.statusCode || 500,
      error,
    );
  }
};

export const sendRejectDeliveryDonorMail = async (
  email: string,
  donorName: string,
  donationTitle: string,
) => {
  const html = baseEmailLayout(
    `Update on your Donation Delivery`,
    `
      <p style="margin-top: 0;">Hello ${donorName},</p>
      <p>A volunteer was unable to accept the delivery for your donation "<strong>${donationTitle}</strong>".</p>
      <p>The recipient can still request another volunteer or arrange a self-pickup.</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Delivery Update - MealBridge",
      html,
    });
  } catch (error: any) {
    throw new AppError(
      error?.message || "Failed to send delivery rejection email to donor",
      error?.code || error?.statusCode || 500,
      error,
    );
  }
};

export const sendCompleteDeliveryRecipientMail = async (
  email: string,
  recipientName: string,
  donationTitle: string,
  deliveryAddress: string,
) => {
  const html = baseEmailLayout(
    `Your Meal was Delivered!`,
    `
      <p style="margin-top: 0;">Hello ${recipientName},</p>
      <p>The volunteer has successfully delivered your meal "<strong>${donationTitle}</strong>" to <strong>${deliveryAddress}</strong>.</p>
      <p>Enjoy your meal!</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Meal Delivered - MealBridge",
      html,
    });
  } catch (error: any) {
    throw new AppError(
      error?.message || "Failed to send delivery completion email to recipient",
      error?.code || error?.statusCode || 500,
      error,
    );
  }
};

export const sendCompleteDeliveryDonorMail = async (
  email: string,
  donorName: string,
  donationTitle: string,
) => {
  const html = baseEmailLayout(
    `Your Donation was Delivered!`,
    `
      <p style="margin-top: 0;">Hello ${donorName},</p>
      <p>The volunteer has successfully delivered your donation "<strong>${donationTitle}</strong>".</p>
      <p>Thank you again for your generosity!</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Donation Delivered - MealBridge",
      html,
    });
  } catch (error: any) {
    throw new AppError(
      error?.message || "Failed to send delivery completion email to donor",
      error?.code || error?.statusCode || 500,
      error,
    );
  }
};

export const sendCompleteDeliveryVolunteerMail = async (
  email: string,
  volunteerName: string,
  donationTitle: string,
) => {
  const html = baseEmailLayout(
    `Delivery Completed!`,
    `
      <p style="margin-top: 0;">Hello ${volunteerName},</p>
      <p>Thank you for successfully delivering "<strong>${donationTitle}</strong>".</p>
      <p>Your effort means a lot to the community!</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Delivery Completed - MealBridge",
      html,
    });
  } catch (error: any) {
    throw new AppError(
      error?.message || "Failed to send delivery completion email to volunteer",
      error?.code || error?.statusCode || 500,
      error,
    );
  }
};

export const sendCancelDeliveryRecipientMail = async (
  email: string,
  recipientName: string,
  donationTitle: string,
  reason?: string,
) => {
  const html = baseEmailLayout(
    `Delivery Cancellation Request`,
    `
      <p style="margin-top: 0;">Hello ${recipientName},</p>
      <p>The volunteer has had an emergency and cancelled the delivery for "<strong>${donationTitle}</strong>".</p>
      ${reason ? `<p>Reason: ${reason}</p>` : ""}
      <p>Your donation claim remains active. You can request another volunteer or arrange self-pickup.</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Delivery Cancellation - MealBridge",
      html,
    });
  } catch (error: any) {
    throw new AppError(
      error?.message || "Failed to send delivery cancellation email to recipient",
      error?.code || error?.statusCode || 500,
      error,
    );
  }
};

export const sendCancelDeliveryDonorMail = async (
  email: string,
  donorName: string,
  donationTitle: string,
  reason?: string,
) => {
  const html = baseEmailLayout(
    `Delivery Cancellation Submitted`,
    `
      <p style="margin-top: 0;">Hello ${donorName},</p>
      <p>The volunteer has had an emergency and cancelled the delivery for "<strong>${donationTitle}</strong>".</p>
      ${reason ? `<p>Reason: ${reason}</p>` : ""}
      <p>The donation claim remains active. The recipient may arrange self-pickup or request another volunteer.</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Delivery Cancellation - MealBridge",
      html,
    });
  } catch (error: any) {
    throw new AppError(
      error?.message || "Failed to send delivery cancellation email to donor",
      error?.code || error?.statusCode || 500,
      error,
    );
  }
};

export const sendCancelDeliveryVolunteerMail = async (
  email: string,
  volunteerName: string,
  donationTitle: string,
  reason?: string,
) => {
  const html = baseEmailLayout(
    `Delivery Cancellation Submitted`,
    `
      <p style="margin-top: 0;">Hello ${volunteerName},</p>
      <p>You have used your emergency cancellation to cancel the delivery for "<strong>${donationTitle}</strong>".</p>
      ${reason ? `<p>Reason provided: ${reason}</p>` : ""}
    `,
  );

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Delivery Cancellation - MealBridge",
      html,
    });
  } catch (error: any) {
    throw new AppError(
      error?.message || "Failed to send delivery cancellation email to volunteer",
      error?.code || error?.statusCode || 500,
      error,
    );
  }
};

export const sendCreateDeliveryRequestVolunteerMail = async (
  email: string,
  volunteerName: string,
  donationTitle: string,
) => {
  const html = baseEmailLayout(
    `New Delivery Request!`,
    `
      <p style="margin-top: 0;">Hello ${volunteerName},</p>
      <p>A recipient has requested your help to deliver "<strong>${donationTitle}</strong>".</p>
      <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 20px; font-weight: bold; color: #3b82f6;">
          New Request
        </span>
        <p style="margin-top: 12px; margin-bottom: 0; color: #4b5563; font-size: 16px;">
          Please check your dashboard to accept or reject this request.
        </p>
      </div>
    `,
  );

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "New Delivery Request - MealBridge",
      html,
    });
  } catch (error: any) {
    throw new AppError(
      error?.message || "Failed to send delivery request email to volunteer",
      error?.code || error?.statusCode || 500,
      error,
    );
  }
};

export const sendCancelDeliveryRequestVolunteerMail = async (
  email: string,
  volunteerName: string,
  donationTitle: string,
) => {
  const html = baseEmailLayout(
    `Delivery Request Withdrawn`,
    `
      <p style="margin-top: 0;">Hello ${volunteerName},</p>
      <p>The pending delivery request for "<strong>${donationTitle}</strong>" has been withdrawn by the recipient.</p>
      <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 20px; font-weight: bold; color: #6b7280;">
          Request Cancelled
        </span>
        <p style="margin-top: 12px; margin-bottom: 0; color: #4b5563; font-size: 16px;">
          You do not need to take any further action.
        </p>
      </div>
    `,
  );

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Delivery Request Withdrawn - MealBridge",
      html,
    });
  } catch (error: any) {
    throw new AppError(
      error?.message || "Failed to send delivery request cancellation email to volunteer",
      error?.code || error?.statusCode || 500,
      error,
    );
  }
};

