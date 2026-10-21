import AppError from "../errors/AppError.js";
import { baseEmailLayout, defaultSender, transporter } from "./mail.config.js";

export const sendAcceptDeliveryRecipientMail = async (
  email: string,
  recipientName: string,
  donationTitle: string,
  deliveryAddress: string,
) => {
  const html = baseEmailLayout(
    "Volunteer Assigned to Your Delivery",
    `
      <p style="margin-top: 0;">Hello ${recipientName || "there"},</p>
      <p>Great news! A volunteer has accepted the delivery request for your claimed donation "<strong>${donationTitle}</strong>".</p>
      <div style="background-color: #f0fdf4; border: 1px dashed #86efac; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 20px; font-weight: 700; color: #166534;">
          Volunteer Assigned
        </span>
        <p style="margin-top: 12px; margin-bottom: 0; color: #374151; font-size: 15px; line-height: 1.5;">
          Delivery destination:<br />
          <strong>${deliveryAddress}</strong>
        </p>
        <p style="margin-top: 8px; margin-bottom: 0; color: #6b7280; font-size: 13px;">
          The volunteer driver is coordinating pickup with the donor and will deliver the meal directly to your address.
        </p>
      </div>
      <p style="margin-bottom: 0;">You can check your MealBridge dashboard anytime to follow live delivery updates.</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: defaultSender,
      to: email,
      subject: "MealBridge - Volunteer Assigned to Your Delivery",
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
    "Volunteer Confirmed for Donation Pickup",
    `
      <p style="margin-top: 0;">Hello ${donorName || "there"},</p>
      <p>A volunteer driver has accepted the delivery assignment for your donation "<strong>${donationTitle}</strong>".</p>
      <div style="background-color: #f0fdf4; border: 1px dashed #86efac; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 20px; font-weight: 700; color: #166534;">
          Pickup Confirmed
        </span>
        <p style="margin-top: 12px; margin-bottom: 0; color: #374151; font-size: 15px; line-height: 1.5;">
          The volunteer will pick up the meal from:<br />
          <strong>${pickupAddress}</strong>
        </p>
        <p style="margin-top: 8px; margin-bottom: 0; color: #6b7280; font-size: 13px;">
          Please ensure the donation is packaged and ready for pickup when the driver arrives.
        </p>
      </div>
      <p style="margin-bottom: 0;">Thank you for your generosity in feeding communities and reducing food waste!</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: defaultSender,
      to: email,
      subject: "MealBridge - Volunteer Confirmed for Donation Pickup",
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
    "Delivery Assignment Confirmed",
    `
      <p style="margin-top: 0;">Hello ${volunteerName || "there"},</p>
      <p>Thank you for accepting the delivery assignment for "<strong>${donationTitle}</strong>"!</p>
      <div style="background-color: #faf5ff; border: 1px dashed #d8b4fe; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 20px; font-weight: 700; color: #7e22ce;">
          Delivery Route Details
        </span>
        <p style="margin-top: 12px; margin-bottom: 0; color: #374151; font-size: 15px; line-height: 1.5;">
          <strong>Pickup from:</strong> ${pickupAddress}<br />
          <strong>Deliver to:</strong> ${deliveryAddress}
        </p>
        <p style="margin-top: 8px; margin-bottom: 0; color: #6b7280; font-size: 13px;">
          Please update the delivery status on your MealBridge dashboard upon pickup and successful delivery.
        </p>
      </div>
      <p style="margin-bottom: 0;">Thank you for volunteering your time to make a meaningful difference!</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: defaultSender,
      to: email,
      subject: "MealBridge - Delivery Assignment Confirmed",
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
    "Update on Your Delivery Request",
    `
      <p style="margin-top: 0;">Hello ${recipientName || "there"},</p>
      <p>We are writing to inform you that a volunteer was unable to accept your delivery request for "<strong>${donationTitle}</strong>".</p>
      <div style="background-color: #fffbeb; border: 1px dashed #fcd34d; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 20px; font-weight: 700; color: #92400e;">
          Delivery Declined
        </span>
        <p style="margin-top: 12px; margin-bottom: 0; color: #374151; font-size: 15px; line-height: 1.5;">
          Your donation claim remains completely active and secure.
        </p>
        <p style="margin-top: 8px; margin-bottom: 0; color: #6b7280; font-size: 13px;">
          You can request another volunteer from your dashboard or arrange self-pickup with the donor.
        </p>
      </div>
      <p style="margin-bottom: 0;">If you need assistance, please feel free to reach out to our support team.</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: defaultSender,
      to: email,
      subject: "MealBridge - Delivery Request Declined",
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
    "Update on Your Donation Delivery",
    `
      <p style="margin-top: 0;">Hello ${donorName || "there"},</p>
      <p>We wanted to let you know that a volunteer was unable to accept the delivery request for your donation "<strong>${donationTitle}</strong>".</p>
      <div style="background-color: #fffbeb; border: 1px dashed #fcd34d; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 20px; font-weight: 700; color: #92400e;">
          Awaiting Volunteer Driver
        </span>
        <p style="margin-top: 12px; margin-bottom: 0; color: #374151; font-size: 15px; line-height: 1.5;">
          Your donation claim remains active. The recipient can request another nearby volunteer or arrange self-pickup.
        </p>
      </div>
      <p style="margin-bottom: 0;">We will notify you as soon as a delivery driver is confirmed. Thank you for your support!</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: defaultSender,
      to: email,
      subject: "MealBridge - Delivery Update for Your Donation",
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
    "Your Meal Has Been Delivered!",
    `
      <p style="margin-top: 0;">Hello ${recipientName || "there"},</p>
      <p>The volunteer has successfully delivered your meal "<strong>${donationTitle}</strong>" to <strong>${deliveryAddress}</strong>.</p>
      <div style="background-color: #f0fdf4; border: 1px dashed #86efac; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 20px; font-weight: 700; color: #166534;">
          Delivery Completed
        </span>
        <p style="margin-top: 12px; margin-bottom: 0; color: #374151; font-size: 15px; line-height: 1.5;">
          Enjoy your meal! We hope this donation brings warmth and nourishment to your day.
        </p>
      </div>
      <p style="margin-bottom: 0;">If you have any feedback or noticed any issues with this delivery, please let us know through your dashboard.</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: defaultSender,
      to: email,
      subject: "MealBridge - Your Meal Has Been Delivered!",
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
    "Your Donation Has Been Delivered!",
    `
      <p style="margin-top: 0;">Hello ${donorName || "there"},</p>
      <p>Great news! The volunteer has successfully delivered your donation "<strong>${donationTitle}</strong>" to the recipient.</p>
      <div style="background-color: #f0fdf4; border: 1px dashed #86efac; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 20px; font-weight: 700; color: #166534;">
          Mission Accomplished
        </span>
        <p style="margin-top: 12px; margin-bottom: 0; color: #374151; font-size: 15px; line-height: 1.5;">
          Your generosity has officially reached someone in need and helped reduce food waste in our community.
        </p>
        <p style="margin-top: 8px; margin-bottom: 0; color: #6b7280; font-size: 13px;">
          You can track your cumulative community impact anytime in your donor dashboard.
        </p>
      </div>
      <p style="margin-bottom: 0;">From all of us at MealBridge, thank you for your compassionate support!</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: defaultSender,
      to: email,
      subject: "MealBridge - Your Donation Has Been Delivered!",
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
    "Delivery Successfully Completed!",
    `
      <p style="margin-top: 0;">Hello ${volunteerName || "there"},</p>
      <p>Thank you for successfully delivering "<strong>${donationTitle}</strong>" to the recipient.</p>
      <div style="background-color: #f0fdf4; border: 1px dashed #86efac; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 20px; font-weight: 700; color: #166534;">
          Delivery Completed
        </span>
        <p style="margin-top: 12px; margin-bottom: 0; color: #374151; font-size: 15px; line-height: 1.5;">
          Your dedication directly connected fresh meals with those who need them most.
        </p>
        <p style="margin-top: 8px; margin-bottom: 0; color: #6b7280; font-size: 13px;">
          Your volunteer status has been updated and you are now available for new delivery opportunities.
        </p>
      </div>
      <p style="margin-bottom: 0;">You are an indispensable part of MealBridge. Keep up the wonderful work!</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: defaultSender,
      to: email,
      subject: "MealBridge - Delivery Successfully Completed!",
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
    "Volunteer Delivery Cancelled",
    `
      <p style="margin-top: 0;">Hello ${recipientName || "there"},</p>
      <p>We regret to inform you that the volunteer had an unforeseen emergency and had to cancel their delivery assignment for "<strong>${donationTitle}</strong>".</p>
      <div style="background-color: #fffbeb; border: 1px dashed #fcd34d; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 20px; font-weight: 700; color: #92400e;">
          Delivery Cancelled
        </span>
        <p style="margin-top: 12px; margin-bottom: 0; color: #374151; font-size: 15px; line-height: 1.5;">
          ${reason ? `<strong>Reason provided:</strong> "${reason}"` : "The volunteer was unable to fulfill this delivery due to an unexpected emergency."}
        </p>
        <p style="margin-top: 8px; margin-bottom: 0; color: #6b7280; font-size: 13px;">
          Your donation claim is still fully active! You can request another available volunteer from your dashboard or arrange a self-pickup with the donor.
        </p>
      </div>
      <p style="margin-bottom: 0;">If you need assistance, our support team is always here to help.</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: defaultSender,
      to: email,
      subject: "MealBridge - Volunteer Delivery Cancelled",
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
    "Volunteer Delivery Cancelled",
    `
      <p style="margin-top: 0;">Hello ${donorName || "there"},</p>
      <p>We are notifying you that the volunteer assigned to deliver your donation "<strong>${donationTitle}</strong>" had an emergency and had to cancel the pickup.</p>
      <div style="background-color: #fffbeb; border: 1px dashed #fcd34d; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 20px; font-weight: 700; color: #92400e;">
          Delivery Assignment Cancelled
        </span>
        <p style="margin-top: 12px; margin-bottom: 0; color: #374151; font-size: 15px; line-height: 1.5;">
          ${reason ? `<strong>Reason provided:</strong> "${reason}"` : "The volunteer had to cancel due to an unexpected emergency."}
        </p>
        <p style="margin-top: 8px; margin-bottom: 0; color: #6b7280; font-size: 13px;">
          The donation claim remains active with the recipient, who may request another volunteer or coordinate self-pickup.
        </p>
      </div>
      <p style="margin-bottom: 0;">Thank you for your patience and ongoing support of MealBridge.</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: defaultSender,
      to: email,
      subject: "MealBridge - Volunteer Delivery Cancelled",
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
    "Delivery Cancellation Confirmed",
    `
      <p style="margin-top: 0;">Hello ${volunteerName || "there"},</p>
      <p>This confirms that your emergency cancellation for the delivery of "<strong>${donationTitle}</strong>" has been processed.</p>
      <div style="background-color: #fffbeb; border: 1px dashed #fcd34d; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 20px; font-weight: 700; color: #92400e;">
          Cancellation Processed
        </span>
        <p style="margin-top: 12px; margin-bottom: 0; color: #374151; font-size: 15px; line-height: 1.5;">
          ${reason ? `<strong>Reason recorded:</strong> "${reason}"` : "Emergency cancellation recorded."}
        </p>
        <p style="margin-top: 8px; margin-bottom: 0; color: #6b7280; font-size: 13px;">
          Both the donor and recipient have been notified. Your status has been reset and you can take on new deliveries whenever you are ready.
        </p>
      </div>
      <p style="margin-bottom: 0;">We hope everything is well on your end. Thank you for your service to the MealBridge community.</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: defaultSender,
      to: email,
      subject: "MealBridge - Delivery Cancellation Confirmed",
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
    "New Delivery Request",
    `
      <p style="margin-top: 0;">Hello ${volunteerName || "there"},</p>
      <p>A recipient in your community needs assistance delivering "<strong>${donationTitle}</strong>".</p>
      <div style="background-color: #faf5ff; border: 1px dashed #d8b4fe; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 20px; font-weight: 700; color: #7e22ce;">
          New Delivery Opportunity
        </span>
        <p style="margin-top: 12px; margin-bottom: 0; color: #374151; font-size: 15px; line-height: 1.5;">
          Help bridge fresh meals from local donors to recipients in need.
        </p>
        <p style="margin-top: 8px; margin-bottom: 0; color: #6b7280; font-size: 13px;">
          Please check your dashboard to review route details and choose to accept or decline this request.
        </p>
      </div>
      <p style="margin-bottom: 0;">Thank you for your dedication to reducing hunger and food waste!</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: defaultSender,
      to: email,
      subject: "MealBridge - New Delivery Opportunity Available",
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
    "Delivery Request Withdrawn",
    `
      <p style="margin-top: 0;">Hello ${volunteerName || "there"},</p>
      <p>The pending delivery request for "<strong>${donationTitle}</strong>" has been withdrawn by the recipient.</p>
      <div style="background-color: #f3f4f6; border: 1px dashed #d1d5db; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 20px; font-weight: 700; color: #4b5563;">
          Request Withdrawn
        </span>
        <p style="margin-top: 12px; margin-bottom: 0; color: #374151; font-size: 15px; line-height: 1.5;">
          No further action is required from you.
        </p>
        <p style="margin-top: 8px; margin-bottom: 0; color: #6b7280; font-size: 13px;">
          You remain available to receive other delivery requests on MealBridge.
        </p>
      </div>
      <p style="margin-bottom: 0;">Thank you for your readiness to support the community!</p>
    `,
  );

  try {
    await transporter.sendMail({
      from: defaultSender,
      to: email,
      subject: "MealBridge - Delivery Request Withdrawn",
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


