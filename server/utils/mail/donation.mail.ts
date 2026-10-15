import AppError from "../errors/AppError.js";
import { transporter, baseEmailLayout } from "./mail.config.js";

export const sendAcceptDonationRequestRecipientPovMail = async (
  email: string,
  recipientName: string,
  donationId: string,
  donationName: string,
) => {
  const html = baseEmailLayout(
    `Your Donation Request was Accepted!`,
    `
      <p style="margin-top: 0;">Hello ${recipientName},</p>
      <p>Great news! Your request for the donation "<strong>${donationName}</strong>" (ID: <strong>${donationId}</strong>) has been accepted by the donor.</p>
      <div style="background-color: #d1fae5; border: 1px dashed #34d399; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 20px; font-weight: bold; color: #10b981;">
          A claim has been created.
        </span>
        <p style="margin-top: 12px; margin-bottom: 0; color: #4b5563; font-size: 16px;">
          You can now coordinate with the donor to receive your meal.
        </p>
      </div>
      <p style="margin-bottom: 0;">If you have any questions, please contact our support team.</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Donation Request was Accepted! - MealBridge",
      html,
    });
  } catch (error: any) {
    throw new AppError(
      error?.message || "Failed to send acceptance email to recipient",
      error?.code || error?.statusCode || 500,
      error,
    );
  }
};

export const sendRejectDonationRequestRecipientPovMail = async (
  email: string,
  recipientName: string,
  donationId: string,
  donationName: string,
) => {
  const html = baseEmailLayout(
    `Update on your Donation Request`,
    `
      <p style="margin-top: 0;">Hello ${recipientName},</p>
      <p>We're writing to let you know that your request for the donation "<strong>${donationName}</strong>" (ID: <strong>${donationId}</strong>) was unfortunately rejected by the donor.</p>
      <div style="background-color: #fee2e2; border: 1px dashed #f87171; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 20px; font-weight: bold; color: #ef4444;">
          Request Rejected
        </span>
        <p style="margin-top: 12px; margin-bottom: 0; color: #4b5563; font-size: 16px;">
          Don't worry, there are many other donations available on MealBridge. We encourage you to explore and request other meals!
        </p>
      </div>
      <p style="margin-bottom: 0;">If you have any questions, please contact our support team.</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Update regarding your Donation Request - MealBridge",
      html,
    });
  } catch (error: any) {
    throw new AppError(
      error?.message || "Failed to send rejection email to recipient",
      error?.code || error?.statusCode || 500,
      error,
    );
  }
};

export const sendAcceptDonationRequestDonorPovMail = async (
  email: string,
  donorName: string,
  requestId: string,
  donationName: string,
) => {
  const html = baseEmailLayout(
    `You Accepted a Donation Request`,
    `
      <p style="margin-top: 0;">Hello ${donorName},</p>
      <p>This is a confirmation that you have successfully accepted a request (ID: <strong>${requestId}</strong>) for your donation "<strong>${donationName}</strong>".</p>
      <div style="background-color: #d1fae5; border: 1px dashed #34d399; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 20px; font-weight: bold; color: #10b981;">
          A claim has been created.
        </span>
        <p style="margin-top: 12px; margin-bottom: 0; color: #4b5563; font-size: 16px;">
          Thank you for your generosity! The recipient has been notified and will coordinate with you.
        </p>
      </div>
      <p style="margin-bottom: 0;">If you did not authorize this action, please contact our support team immediately.</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Confirmation: Donation Request Accepted - MealBridge",
      html,
    });
  } catch (error: any) {
    throw new AppError(
      error?.message || "Failed to send acceptance confirmation to donor",
      error?.code || error?.statusCode || 500,
      error,
    );
  }
};

export const sendRejectDonationRequestDonorPovMail = async (
  email: string,
  donorName: string,
  requestId: string,
  donationName: string,
) => {
  const html = baseEmailLayout(
    `You Rejected a Donation Request`,
    `
      <p style="margin-top: 0;">Hello ${donorName},</p>
      <p>This is a confirmation that you have rejected a request (ID: <strong>${requestId}</strong>) for your donation "<strong>${donationName}</strong>".</p>
      <div style="background-color: #fee2e2; border: 1px dashed #f87171; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 20px; font-weight: bold; color: #ef4444;">
          Request Rejected
        </span>
        <p style="margin-top: 12px; margin-bottom: 0; color: #4b5563; font-size: 16px;">
          The recipient has been notified of this status. Your donation remains available for other requests.
        </p>
      </div>
      <p style="margin-bottom: 0;">If you did not authorize this action, please contact our support team immediately.</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Confirmation: Donation Request Rejected - MealBridge",
      html,
    });
  } catch (error: any) {
    throw new AppError(
      error?.message || "Failed to send rejection confirmation to donor",
      error?.code || error?.statusCode || 500,
      error,
    );
  }
};

export const sendCreateRequestForDonorMail = async (
  email: string,
  donationTitle: string,
  requestId: string,
  message: string | null | undefined,
  quantityRequested: number,
) => {
  const html = baseEmailLayout(
    `New Request for Your Donation`,
    `
      <p style="margin-top: 0;">Hello Donor,</p>
      <p>Great news! Someone has made a request for your donation "<strong>${donationTitle}</strong>".</p>
      <div style="background-color: #d1fae5; border: 1px dashed #34d399; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 20px; font-weight: bold; color: #10b981;">
          ${quantityRequested} unit(s) requested
        </span>
        <p style="margin-top: 12px; margin-bottom: 0; color: #4b5563; font-size: 16px;">
          ${message ? `<strong>Message:</strong> "${message}"` : `No additional message was provided.`}
        </p>
      </div>
      <p>Log in to your MealBridge dashboard to review and accept or reject this request (Request ID: ${requestId}).</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "New Donation Request - MealBridge",
      html,
    });
  } catch (error: any) {
    throw new AppError(
      error?.message || "Failed to send new request notification to donor",
      error?.code || error?.statusCode || 500,
      error,
    );
  }
};

export const sendClaimCancelForDonorMail = async (
  email: string,
  donationTitle: string,
  organizationName: string | null | undefined,
  message: string,
) => {
  const html = baseEmailLayout(
    `Claim Cancelled for Your Donation`,
    `
      <p style="margin-top: 0;">Hello,</p>
      <p>This is to notify you that the claim on your donation "<strong>${donationTitle}</strong>" has been cancelled by ${organizationName ? `<strong>${organizationName}</strong>` : "the recipient"}${message ? ` with the following reason: "${message}"` : ""}.</p>
      <div style="background-color: #fee2e2; border: 1px dashed #f87171; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 20px; font-weight: bold; color: #ef4444;">
          Claim Cancelled
        </span>
        <p style="margin-top: 12px; margin-bottom: 0; color: #4b5563; font-size: 16px;">
          Your donation is now available again for other potential recipients to request.
        </p>
      </div>
      <p style="margin-bottom: 0;">Thank you for your continued generosity on MealBridge.</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Update: Claim Cancelled - MealBridge",
      html,
    });
  } catch (error: any) {
    throw new AppError(
      error?.message || "Failed to send claim cancellation email to donor",
      error?.code || error?.statusCode || 500,
      error,
    );
  }
};

export const sendClaimCancelForRecipientMail = async (
  email: string,
  donationTitle: string,
  organizationName: string,
  message: string,
) => {
  const html = baseEmailLayout(
    `Claim Cancelled for Your Donation Request`,
    `
      <p style="margin-top: 0;">Hello,</p>
      <p>This is to notify you that your request for the donation "<strong>${donationTitle}</strong>" has been cancelled by the donor, <strong>${organizationName}</strong>${message ? ` with the following reason: "${message}"` : ""}.</p>
      <div style="background-color: #fee2e2; border: 1px dashed #f87171; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 20px; font-weight: bold; color: #ef4444;">
          Request Cancelled
        </span>
        <p style="margin-top: 12px; margin-bottom: 0; color: #4b5563; font-size: 16px;">
          Don't worry, there are many other donations available on MealBridge. We encourage you to explore and request other meals!
        </p>
      </div>
      <p style="margin-bottom: 0;">If you have any questions, please contact our support team.</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Update: Donation Request Cancelled - MealBridge",
      html,
    });
  } catch (error: any) {
    throw new AppError(
      error?.message || "Failed to send claim cancellation email to recipient",
      error?.code || error?.statusCode || 500,
      error,
    );
  }
};

export const sendClaimCancelForVolunteerMail = async (
  email: string,
  donationTitle: string,
  organizationName: string,
  message: string,
) => {
  const html = baseEmailLayout(
    `Delivery Cancelled for Claimed Donation`,
    `
      <p style="margin-top: 0;">Hello,</p>
      <p>This is to notify you that the delivery assignment for "<strong>${donationTitle}</strong>" has been cancelled by <strong>${organizationName}</strong>${message ? ` with the following reason: "${message}"` : ""}.</p>
      <div style="background-color: #fee2e2; border: 1px dashed #f87171; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 20px; font-weight: bold; color: #ef4444;">
          Delivery Cancelled
        </span>
        <p style="margin-top: 12px; margin-bottom: 0; color: #4b5563; font-size: 16px;">
          Your delivery assignment has been cancelled. You are now available for other deliveries on MealBridge!
        </p>
      </div>
      <p style="margin-bottom: 0;">Thank you for your time and willingness to help!</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Update: Delivery Cancelled - MealBridge",
      html,
    });
  } catch (error: any) {
    throw new AppError(
      error?.message || "Failed to send claim cancellation email to volunteer",
      error?.code || error?.statusCode || 500,
      error,
    );
  }
};

export const sendEmergencyDonationCancellationRecipientMail = async (
  email: string,
  recipientName: string,
  donationTitle: string,
  donorName: string,
  reason: string = "Food spoiled or safety issue",
) => {
  const html = baseEmailLayout(
    `Important: Emergency Donation Cancellation`,
    `
      <p style="margin-top: 0;">Hello ${recipientName || "there"},</p>
      <p>We are writing to urgently notify you that the donation "<strong>${donationTitle}</strong>" by <strong>${donorName}</strong> has been cancelled due to an emergency.</p>
      <div style="background-color: #fee2e2; border: 1px dashed #f87171; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 20px; font-weight: bold; color: #ef4444;">
          Emergency Cancellation
        </span>
        <p style="margin-top: 12px; margin-bottom: 0; color: #4b5563; font-size: 16px;">
          <strong>Reason:</strong> ${reason}
        </p>
      </div>
      <p>For health and safety reasons, this donation will not be distributed. Any scheduled delivery or pickup has been immediately halted.</p>
      <p style="margin-bottom: 0;">We apologize for the inconvenience and invite you to explore MealBridge for other available food donations.</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `URGENT: Emergency Cancellation for "${donationTitle}" - MealBridge`,
      html,
    });
  } catch (error: any) {
    throw new AppError(
      error?.message || "Failed to send emergency cancellation email to recipient",
      error?.code || error?.statusCode || 500,
      error,
    );
  }
};

export const sendEmergencyDonationCancellationVolunteerMail = async (
  email: string,
  volunteerName: string,
  donationTitle: string,
  donorName: string,
  reason: string = "Food spoiled or safety issue",
) => {
  const html = baseEmailLayout(
    `Urgent: Delivery Cancelled - Emergency Notice`,
    `
      <p style="margin-top: 0;">Hello ${volunteerName || "Volunteer"},</p>
      <p>Please be advised that your delivery assignment for the donation "<strong>${donationTitle}</strong>" (from <strong>${donorName}</strong>) has been cancelled immediately due to an emergency donor cancellation.</p>
      <div style="background-color: #fee2e2; border: 1px dashed #f87171; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 20px; font-weight: bold; color: #ef4444;">
          DO NOT PICK UP OR DELIVER
        </span>
        <p style="margin-top: 12px; margin-bottom: 0; color: #4b5563; font-size: 16px;">
          <strong>Reason:</strong> ${reason}
        </p>
      </div>
      <p>Your availability status has been reset to available, and you are free to accept other delivery tasks.</p>
      <p style="margin-bottom: 0;">Thank you for your understanding and your dedication to the MealBridge community.</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `URGENT: Delivery Cancelled for "${donationTitle}" - MealBridge`,
      html,
    });
  } catch (error: any) {
    throw new AppError(
      error?.message || "Failed to send emergency cancellation email to volunteer",
      error?.code || error?.statusCode || 500,
      error,
    );
  }
};

