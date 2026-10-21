import AppError from "../errors/AppError.js";
import { transporter, baseEmailLayout, defaultSender } from "./mail.config.js";

export const sendAcceptDonationRequestRecipientPovMail = async (
  email: string,
  recipientName: string,
  donationId: string,
  donationName: string,
) => {
  const html = baseEmailLayout(
    "Donation Request Accepted!",
    `
      <p style="margin-top: 0;">Hello ${recipientName || "there"},</p>
      <p>Great news! Your request for the donation "<strong>${donationName}</strong>" (ID: <strong>${donationId}</strong>) has been accepted by the donor.</p>
      <div style="background-color: #f0fdf4; border: 1px dashed #86efac; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 20px; font-weight: 700; color: #166534;">
          Claim Created Successfully
        </span>
        <p style="margin-top: 12px; margin-bottom: 0; color: #374151; font-size: 15px; line-height: 1.5;">
          You can now coordinate directly with the donor or request a volunteer delivery through your dashboard.
        </p>
      </div>
      <p style="margin-bottom: 0;">If you have any questions or need assistance, please contact our support team.</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: defaultSender,
      to: email,
      subject: "MealBridge - Donation Request Accepted!",
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
    "Update on Your Donation Request",
    `
      <p style="margin-top: 0;">Hello ${recipientName || "there"},</p>
      <p>We are writing to let you know that your request for the donation "<strong>${donationName}</strong>" (ID: <strong>${donationId}</strong>) could not be accepted by the donor at this time.</p>
      <div style="background-color: #fef2f2; border: 1px dashed #fca5a5; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 20px; font-weight: 700; color: #991b1b;">
          Request Declined
        </span>
        <p style="margin-top: 12px; margin-bottom: 0; color: #374151; font-size: 15px; line-height: 1.5;">
          Don't worry! There are many other nutritious meals available on MealBridge. We encourage you to browse and request other donations in your area.
        </p>
      </div>
      <p style="margin-bottom: 0;">If you have any questions, our support team is always here to help.</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: defaultSender,
      to: email,
      subject: "MealBridge - Update on Your Donation Request",
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
    "Donation Request Accepted",
    `
      <p style="margin-top: 0;">Hello ${donorName || "there"},</p>
      <p>This is a confirmation that you have accepted the request (ID: <strong>${requestId}</strong>) for your donation "<strong>${donationName}</strong>".</p>
      <div style="background-color: #f0fdf4; border: 1px dashed #86efac; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 20px; font-weight: 700; color: #166534;">
          Claim Initiated
        </span>
        <p style="margin-top: 12px; margin-bottom: 0; color: #374151; font-size: 15px; line-height: 1.5;">
          Thank you for your generosity! The recipient has been notified and will coordinate pickup or delivery with you.
        </p>
      </div>
      <p style="margin-bottom: 0;">If you did not authorize this action, please contact our support team immediately.</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: defaultSender,
      to: email,
      subject: "MealBridge - Donation Request Accepted",
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
    "Donation Request Declined",
    `
      <p style="margin-top: 0;">Hello ${donorName || "there"},</p>
      <p>This is a confirmation that you have declined the request (ID: <strong>${requestId}</strong>) for your donation "<strong>${donationName}</strong>".</p>
      <div style="background-color: #fffbeb; border: 1px dashed #fcd34d; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 20px; font-weight: 700; color: #92400e;">
          Request Declined
        </span>
        <p style="margin-top: 12px; margin-bottom: 0; color: #374151; font-size: 15px; line-height: 1.5;">
          The recipient has been notified. Your donation remains available on the platform for other requests.
        </p>
      </div>
      <p style="margin-bottom: 0;">If you did not authorize this action, please contact our support team immediately.</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: defaultSender,
      to: email,
      subject: "MealBridge - Donation Request Declined",
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
  donorName?: string,
) => {
  const greeting = donorName ? `Hello ${donorName},` : "Hello,";
  const html = baseEmailLayout(
    "New Request for Your Donation",
    `
      <p style="margin-top: 0;">${greeting}</p>
      <p>Great news! A recipient has submitted a request for your donation "<strong>${donationTitle}</strong>".</p>
      <div style="background-color: #faf5ff; border: 1px dashed #d8b4fe; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 20px; font-weight: 700; color: #7e22ce;">
          ${quantityRequested} unit${quantityRequested > 1 ? "s" : ""} requested
        </span>
        <p style="margin-top: 12px; margin-bottom: 0; color: #374151; font-size: 15px; line-height: 1.5;">
          ${message ? `<strong>Message:</strong> "${message}"` : `No additional message was provided.`}
        </p>
        <p style="margin-top: 8px; margin-bottom: 0; color: #6b7280; font-size: 13px;">
          Request ID: ${requestId}
        </p>
      </div>
      <p style="margin-bottom: 0;">Please log in to your MealBridge dashboard to review this request and choose to accept or decline.</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: defaultSender,
      to: email,
      subject: "MealBridge - New Donation Request Received",
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
  donorName?: string,
) => {
  const greeting = donorName ? `Hello ${donorName},` : "Hello,";
  const html = baseEmailLayout(
    "Claim Cancelled for Your Donation",
    `
      <p style="margin-top: 0;">${greeting}</p>
      <p>This is to notify you that the claim on your donation "<strong>${donationTitle}</strong>" has been cancelled by ${organizationName ? `<strong>${organizationName}</strong>` : "the recipient"}.</p>
      <div style="background-color: #fffbeb; border: 1px dashed #fcd34d; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 20px; font-weight: 700; color: #92400e;">
          Claim Cancelled
        </span>
        <p style="margin-top: 12px; margin-bottom: 0; color: #374151; font-size: 15px; line-height: 1.5;">
          ${message ? `<strong>Reason provided:</strong> "${message}"` : "No specific reason was provided."}
        </p>
        <p style="margin-top: 8px; margin-bottom: 0; color: #6b7280; font-size: 13px;">
          Your donation is now reopened and available for other community members to request.
        </p>
      </div>
      <p style="margin-bottom: 0;">Thank you for your continued generosity and patience on MealBridge.</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: defaultSender,
      to: email,
      subject: "MealBridge - Claim Cancelled for Your Donation",
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
  recipientName?: string,
) => {
  const greeting = recipientName ? `Hello ${recipientName},` : "Hello,";
  const html = baseEmailLayout(
    "Claim Cancelled for Your Donation Request",
    `
      <p style="margin-top: 0;">${greeting}</p>
      <p>This is to notify you that your claim for the donation "<strong>${donationTitle}</strong>" has been cancelled by the donor, <strong>${organizationName}</strong>.</p>
      <div style="background-color: #fef2f2; border: 1px dashed #fca5a5; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 20px; font-weight: 700; color: #991b1b;">
          Claim Cancelled
        </span>
        <p style="margin-top: 12px; margin-bottom: 0; color: #374151; font-size: 15px; line-height: 1.5;">
          ${message ? `<strong>Reason provided:</strong> "${message}"` : "No specific reason was provided."}
        </p>
        <p style="margin-top: 8px; margin-bottom: 0; color: #6b7280; font-size: 13px;">
          We apologize for the inconvenience. MealBridge has many other available meals, and we encourage you to explore other listings.
        </p>
      </div>
      <p style="margin-bottom: 0;">If you have any questions, please contact our support team.</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: defaultSender,
      to: email,
      subject: "MealBridge - Claim Cancelled by Donor",
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
  volunteerName?: string,
) => {
  const greeting = volunteerName ? `Hello ${volunteerName},` : "Hello,";
  const html = baseEmailLayout(
    "Delivery Assignment Cancelled",
    `
      <p style="margin-top: 0;">${greeting}</p>
      <p>This is to notify you that the delivery assignment for "<strong>${donationTitle}</strong>" has been cancelled by <strong>${organizationName}</strong>.</p>
      <div style="background-color: #fffbeb; border: 1px dashed #fcd34d; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 20px; font-weight: 700; color: #92400e;">
          Delivery Cancelled
        </span>
        <p style="margin-top: 12px; margin-bottom: 0; color: #374151; font-size: 15px; line-height: 1.5;">
          ${message ? `<strong>Reason provided:</strong> "${message}"` : "No specific reason was provided."}
        </p>
        <p style="margin-top: 8px; margin-bottom: 0; color: #6b7280; font-size: 13px;">
          Your delivery assignment has been cancelled and you are now available for other delivery tasks on MealBridge.
        </p>
      </div>
      <p style="margin-bottom: 0;">Thank you for your time and willingness to help!</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: defaultSender,
      to: email,
      subject: "MealBridge - Delivery Assignment Cancelled",
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
    "Urgent: Emergency Donation Cancellation",
    `
      <p style="margin-top: 0;">Hello ${recipientName || "there"},</p>
      <p>We are writing to urgently notify you that the donation "<strong>${donationTitle}</strong>" from <strong>${donorName}</strong> has been cancelled due to an emergency food safety issue.</p>
      <div style="background-color: #fef2f2; border: 1px dashed #fca5a5; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 20px; font-weight: 700; color: #dc2626;">
          EMERGENCY CANCELLATION &mdash; DO NOT DISTRIBUTE
        </span>
        <p style="margin-top: 12px; margin-bottom: 0; color: #374151; font-size: 15px; line-height: 1.5;">
          <strong>Reason:</strong> ${reason}
        </p>
        <p style="margin-top: 8px; margin-bottom: 0; color: #6b7280; font-size: 13px;">
          For health and safety reasons, this donation will not be distributed. Any scheduled pickup or delivery has been immediately cancelled.
        </p>
      </div>
      <p style="margin-bottom: 0;">We sincerely apologize for the inconvenience and invite you to explore MealBridge for other available food donations.</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: defaultSender,
      to: email,
      subject: `MealBridge [URGENT] - Emergency Cancellation for "${donationTitle}"`,
      html,
    });
  } catch (error: any) {
    throw new AppError(
      error?.message ||
        "Failed to send emergency cancellation email to recipient",
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
    "Urgent: Delivery Cancelled (Emergency Notice)",
    `
      <p style="margin-top: 0;">Hello ${volunteerName || "Volunteer"},</p>
      <p>Please be advised that your delivery assignment for "<strong>${donationTitle}</strong>" (from <strong>${donorName}</strong>) has been cancelled immediately due to an emergency donor safety notice.</p>
      <div style="background-color: #fef2f2; border: 1px dashed #fca5a5; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 20px; font-weight: 700; color: #dc2626;">
          DO NOT PICK UP OR DELIVER
        </span>
        <p style="margin-top: 12px; margin-bottom: 0; color: #374151; font-size: 15px; line-height: 1.5;">
          <strong>Reason:</strong> ${reason}
        </p>
        <p style="margin-top: 8px; margin-bottom: 0; color: #6b7280; font-size: 13px;">
          Your volunteer status has been reset to available, and you are free to accept other delivery tasks.
        </p>
      </div>
      <p style="margin-bottom: 0;">Thank you for your prompt attention and commitment to community safety.</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: defaultSender,
      to: email,
      subject: `MealBridge [URGENT] - Delivery Cancelled for "${donationTitle}"`,
      html,
    });
  } catch (error: any) {
    throw new AppError(
      error?.message ||
        "Failed to send emergency cancellation email to volunteer",
      error?.code || error?.statusCode || 500,
      error,
    );
  }
};

export const sendSelfPickupCompletedDonorMail = async (
  email: string,
  donorName: string,
  donationTitle: string,
  recipientName: string,
) => {
  const html = baseEmailLayout(
    "Donation Picked Up Successfully!",
    `
      <p style="margin-top: 0;">Hello ${donorName || "there"},</p>
      <p>Great news! The recipient <strong>${recipientName || "the recipient"}</strong> has confirmed self-pickup for your donation "<strong>${donationTitle}</strong>".</p>
      <div style="background-color: #f0fdf4; border: 1px dashed #86efac; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 20px; font-weight: 700; color: #166534;">
          Claim Completed
        </span>
        <p style="margin-top: 12px; margin-bottom: 0; color: #374151; font-size: 15px; line-height: 1.5;">
          Thank you for your generosity! Your surplus food has officially reached someone in need and helped reduce food waste in our community.
        </p>
      </div>
      <p style="margin-bottom: 0;">You can view the completed claim history and track your impact anytime in your MealBridge dashboard.</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: defaultSender,
      to: email,
      subject: `MealBridge - Donation "${donationTitle}" Picked Up Successfully!`,
      html,
    });
  } catch (error: any) {
    throw new AppError(
      error?.message || "Failed to send self-pickup completion email to donor",
      error?.code || error?.statusCode || 500,
      error,
    );
  }
};

export const sendSelfPickupCompletedRecipientMail = async (
  email: string,
  recipientName: string,
  donationTitle: string,
  donorName: string,
) => {
  const html = baseEmailLayout(
    "Pickup Confirmed & Completed!",
    `
      <p style="margin-top: 0;">Hello ${recipientName || "there"},</p>
      <p>You have successfully confirmed self-pickup for the donation "<strong>${donationTitle}</strong>" from <strong>${donorName || "the donor"}</strong>.</p>
      <div style="background-color: #f0fdf4; border: 1px dashed #86efac; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 20px; font-weight: 700; color: #166534;">
          Donation Claim Completed
        </span>
        <p style="margin-top: 12px; margin-bottom: 0; color: #374151; font-size: 15px; line-height: 1.5;">
          We hope this food donation brings nourishment and support to those you serve.
        </p>
      </div>
      <p style="margin-bottom: 0;">Thank you for being an essential part of the MealBridge community!</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: defaultSender,
      to: email,
      subject: `MealBridge - Pickup Confirmed for "${donationTitle}"`,
      html,
    });
  } catch (error: any) {
    throw new AppError(
      error?.message || "Failed to send self-pickup completion email to recipient",
      error?.code || error?.statusCode || 500,
      error,
    );
  }
};

