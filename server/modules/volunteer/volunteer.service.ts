import {
  ClaimStatus,
  DeliveryStatus,
  DonationStatus,
  Role,
  Prisma,
} from "@prisma/client";
import type {
  GetAllDeliveriesQuery,
  GetDeliveryRequestsQuery,
} from "./volunteer.zod.js";
import prisma from "../../database/index.js";
import AppError from "../../utils/errors/AppError.js";
import { createNotificationService } from "../notification/notification.service.js";
import {
  sendAcceptDeliveryDonorMail,
  sendAcceptDeliveryRecipientMail,
  sendAcceptDeliveryVolunteerMail,
  sendCompleteDeliveryDonorMail,
  sendCompleteDeliveryRecipientMail,
  sendCompleteDeliveryVolunteerMail,
  sendRejectDeliveryDonorMail,
  sendRejectDeliveryRecipientMail,
  sendCancelDeliveryRecipientMail,
  sendCancelDeliveryVolunteerMail,
  sendCancelDeliveryDonorMail,
} from "../../utils/mail/email.service.js";
import {
  getWeeklyLimit,
  setWeeklyLimit,
} from "../../utils/redis/weeklyLimit.redis.js";

const deliveryDetailsInclude = Prisma.validator<Prisma.DeliveryInclude>()({
  volunteer: {
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  },
  donationClaim: {
    include: {
      recipient: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      },
      donationRequest: true,
      donation: {
        include: {
          donor: {
            include: {
              user: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
      },
    },
  },
});

export async function getAllDeliveriesService(
  userId: string,
  query: GetAllDeliveriesQuery,
) {
  const {
    limit = 10,
    page = 1,
    sortBy = "createdAt",
    sortOrder = "desc",
    status,
  } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.DeliveryWhereInput = {
    volunteer: { userId },
    ...(status ? { status } : {}),
  };

  const [deliveries, totalDeliveries] = await prisma.$transaction([
    prisma.delivery.findMany({
      where,
      take: limit,
      skip,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        donationClaim: {
          include: {
            donation: true,
            donationRequest: true,
            recipient: true,
          },
        },
      },
    }),
    prisma.delivery.count({ where }),
  ]);

  return {
    deliveries,
    pagination: {
      page,
      limit,
      totalDeliveries,
      totalPages: Math.ceil(totalDeliveries / limit),
    },
  };
}

export async function singleDeliveryService(id: string, userId: string) {
  const delivery = await prisma.delivery.findUnique({
    where: { id },
    include: {
      volunteer: {
        select: {
          id: true,
          userId: true,
        },
      },
      donationClaim: {
        include: {
          donation: true,
          donationRequest: true,
          recipient: true,
        },
      },
    },
  });

  if (!delivery) {
    throw new AppError("Delivery not found", 404);
  }

  const isForThisUser = delivery.volunteer?.userId === userId;

  if (!isForThisUser) {
    throw new AppError("You are not authorized to view this delivery", 403);
  }

  return delivery;
}

// Delivery Request Operations

export async function getDeliveryRequestsService(
  userId: string,
  query: GetDeliveryRequestsQuery,
) {
  const {
    limit = 10,
    page = 1,
    sortBy = "createdAt",
    sortOrder = "desc",
    status,
  } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.DeliveryRequestWhereInput = {
    volunteer: { userId },
    ...(status ? { status } : {}),
  };

  const [requests, totalRequests] = await prisma.$transaction([
    prisma.deliveryRequest.findMany({
      where,
      take: limit,
      skip,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        donationClaim: {
          include: {
            donation: true,
            recipient: true,
          },
        },
      },
    }),
    prisma.deliveryRequest.count({ where }),
  ]);

  return {
    requests,
    pagination: {
      page,
      limit,
      totalRequests,
      totalPages: Math.ceil(totalRequests / limit),
    },
  };
}

export async function acceptDeliveryRequestService(
  requestId: string,
  userId: string,
) {
  const requestResult = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`
    SELECT id
    FROM "delivery_request"
    WHERE id = ${requestId}::uuid
    FOR UPDATE`;

    const existingRequest = await tx.deliveryRequest.findUnique({
      where: { id: requestId },
      include: {
        volunteer: { include: { user: true } },
        donationClaim: {
          include: {
            donation: { include: { donor: { include: { user: true } } } },
            donationRequest: true,
            recipient: { include: { user: true } },
          },
        },
      },
    });

    if (!existingRequest) {
      throw new AppError("Delivery request not found", 404);
    }

    if (existingRequest.status !== "PENDING") {
      throw new AppError(
        `Delivery request is already ${existingRequest.status.toLowerCase()}`,
        400,
      );
    }

    const isForThisUser = existingRequest.volunteer.userId === userId;

    if (!isForThisUser) {
      throw new AppError("You are not authorized to accept this request", 403);
    }

    // Check if a delivery already exists for this claim
    const existingDelivery = await tx.delivery.findUnique({
      where: { donationClaimId: existingRequest.donationClaimId },
    });

    if (existingDelivery) {
      throw new AppError(
        "This donation claim already has an active delivery.",
        400,
      );
    }

    // Update request status
    await tx.deliveryRequest.update({
      where: { id: requestId },
      data: { status: "ACCEPTED" },
    });

    // Create the actual delivery
    const newDelivery = await tx.delivery.create({
      data: {
        donationClaimId: existingRequest.donationClaimId,
        volunteerId: existingRequest.volunteerId,
        recipientId: existingRequest.recipientId,
        notes: existingRequest.notes,
        status: DeliveryStatus.PENDING,
      },
      include: deliveryDetailsInclude,
    });

    // Optionally reject other pending requests for the same claim
    await tx.deliveryRequest.updateMany({
      where: {
        donationClaimId: existingRequest.donationClaimId,
        id: { not: requestId },
        status: "PENDING",
      },
      data: { status: "REJECTED" },
    });

    return newDelivery;
  });

  const volunteerUser = requestResult.volunteer?.user;
  const recipientUser = requestResult.donationClaim.recipient.user;
  const donorUser = requestResult.donationClaim.donation.donor.user;
  const donationTitle = requestResult.donationClaim.donation.title;

  if (volunteerUser) {
    try {
      await createNotificationService(
        volunteerUser.id,
        "Delivery Confirmed! 🚚",
        `You have accepted the delivery for "${donationTitle}".`,
      );
    } catch (error: any) {
      console.error("Failed to notify volunteer:", error.message || error);
    }

    try {
      await sendAcceptDeliveryVolunteerMail(
        volunteerUser.email,
        volunteerUser.name,
        donationTitle,
        requestResult.donationClaim.donation.pickupAddress,
        requestResult.donationClaim.donationRequest.deliveryAddress,
      );
    } catch (error: any) {
      console.error(
        "Failed to send email to volunteer:",
        error.message || error,
      );
    }
  }

  try {
    await createNotificationService(
      recipientUser.id,
      "Delivery Accepted! 🚚",
      `A volunteer has accepted the delivery for "${donationTitle}".`,
    );
  } catch (error: any) {
    console.error("Failed to notify recipient:", error.message || error);
  }

  try {
    await createNotificationService(
      donorUser.id,
      "Delivery Accepted!",
      `A volunteer has accepted the delivery for your donation "${donationTitle}".`,
    );
  } catch (error: any) {
    console.error("Failed to notify donor:", error.message || error);
  }

  try {
    await sendAcceptDeliveryRecipientMail(
      recipientUser.email,
      recipientUser.name,
      donationTitle,
      requestResult.donationClaim.donationRequest.deliveryAddress,
    );
  } catch (error: any) {
    console.error("Failed to send email to recipient:", error.message || error);
  }

  try {
    await sendAcceptDeliveryDonorMail(
      donorUser.email,
      donorUser.name,
      donationTitle,
      requestResult.donationClaim.donation.pickupAddress,
    );
  } catch (error: any) {
    console.error("Failed to send email to donor:", error.message || error);
  }

  return requestResult;
}

export async function rejectDeliveryRequestService(
  requestId: string,
  userId: string,
) {
  const requestResult = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`
    SELECT id
    FROM "delivery_request"
    WHERE id = ${requestId}::uuid
    FOR UPDATE`;

    const existingRequest = await tx.deliveryRequest.findUnique({
      where: { id: requestId },
      include: {
        volunteer: { include: { user: true } },
        donationClaim: {
          include: {
            donation: { include: { donor: { include: { user: true } } } },
            recipient: { include: { user: true } },
          },
        },
      },
    });

    if (!existingRequest) {
      throw new AppError("Delivery request not found", 404);
    }

    const isForThisUser = existingRequest.volunteer.userId === userId;

    if (!isForThisUser) {
      throw new AppError("You are not authorized to reject this request", 403);
    }

    if (existingRequest.status !== "PENDING") {
      throw new AppError(
        `Delivery request is already ${existingRequest.status}`,
        400,
      );
    }

    await tx.deliveryRequest.update({
      where: { id: requestId },
      data: { status: "REJECTED" },
    });

    return existingRequest;
  });

  const recipientUser = requestResult.donationClaim.recipient.user;
  const donorUser = requestResult.donationClaim.donation.donor.user;
  const donationTitle = requestResult.donationClaim.donation.title;

  try {
    await createNotificationService(
      recipientUser.id,
      "Delivery Declined",
      `Your delivery request for "${donationTitle}" was declined by the volunteer.`,
    );
  } catch (error: any) {
    console.error("Failed to notify recipient:", error.message || error);
  }

  try {
    await createNotificationService(
      donorUser.id,
      "Delivery Declined",
      `A volunteer was unable to accept the delivery request for your donation "${donationTitle}".`,
    );
  } catch (error: any) {
    console.error("Failed to notify donor:", error.message || error);
  }

  try {
    await sendRejectDeliveryRecipientMail(
      recipientUser.email,
      recipientUser.name,
      donationTitle,
    );
  } catch (error: any) {
    console.error("Failed to send email to recipient:", error.message || error);
  }

  try {
    await sendRejectDeliveryDonorMail(
      donorUser.email,
      donorUser.name,
      donationTitle,
    );
  } catch (error: any) {
    console.error("Failed to send email to donor:", error.message || error);
  }

  return requestResult;
}

export async function completeDeliveryService(id: string, userId: string) {
  const delivery = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`
    SELECT id
    FROM "delivery"
    WHERE id = ${id}::uuid
    FOR UPDATE`;

    const existingDelivery = await tx.delivery.findUnique({
      where: { id },
      include: deliveryDetailsInclude,
    });

    if (!existingDelivery) {
      throw new AppError("Delivery not found", 404);
    }

    const volunteerProfile = await tx.volunteerProfile.findUnique({
      where: { userId },
      select: {
        id: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const isForThisUser = existingDelivery.volunteer?.userId === userId;

    if (!isForThisUser) {
      throw new AppError(
        "You are not authorized to complete this delivery",
        403,
      );
    }

    if (existingDelivery.status === DeliveryStatus.COMPLETED) {
      throw new AppError("Delivery is already completed", 400);
    }

    if (existingDelivery.status !== DeliveryStatus.PICKED_UP) {
      throw new AppError(
        `Cannot complete delivery that is ${existingDelivery.status}. It must be PICKED_UP first.`,
        400,
      );
    }

    const now = new Date();

    await tx.delivery.update({
      where: { id },
      data: {
        status: DeliveryStatus.COMPLETED,
        completedAt: now,
      },
    });

    await tx.donationClaim.update({
      where: { id: existingDelivery.donationClaimId },
      data: {
        status: ClaimStatus.COMPLETED,
        collectedAt: now,
      },
    });

    const donation = existingDelivery.donationClaim.donation;
    const completedClaims = await tx.donationClaim.findMany({
      where: {
        donationId: donation.id,
        status: ClaimStatus.COMPLETED,
      },
      select: { quantityClaimed: true },
    });

    const totalQuantityCompleted = completedClaims.reduce(
      (sum, claim) => sum + claim.quantityClaimed,
      0,
    );

    if (totalQuantityCompleted >= donation.quantity) {
      await tx.donation.update({
        where: { id: donation.id },
        data: { status: DonationStatus.COMPLETED },
      });
    }

    const volunteerUser =
      existingDelivery.volunteer?.user || volunteerProfile?.user;

    return {
      ...existingDelivery,
      volunteerUser,
    };
  });

  const volunteerUser = delivery.volunteerUser;
  const recipientUser = delivery.donationClaim.recipient.user;
  const donorUser = delivery.donationClaim.donation.donor.user;
  const donationTitle = delivery.donationClaim.donation.title;

  if (volunteerUser) {
    try {
      await createNotificationService(
        volunteerUser.id,
        "Delivery Completed! 🌟",
        `You have successfully completed the delivery for "${donationTitle}". Thank you for your service!`,
      );
    } catch (error: any) {
      console.error("Failed to notify volunteer:", error.message || error);
    }

    try {
      await sendCompleteDeliveryVolunteerMail(
        volunteerUser.email,
        volunteerUser.name,
        donationTitle,
      );
    } catch (error: any) {
      console.error(
        "Failed to send email to volunteer:",
        error.message || error,
      );
    }
  }

  try {
    await createNotificationService(
      recipientUser.id,
      "Meal Delivered! 🎉",
      `The volunteer has successfully delivered your meal "${donationTitle}".`,
    );
  } catch (error: any) {
    console.error("Failed to notify recipient:", error.message || error);
  }

  try {
    await createNotificationService(
      donorUser.id,
      "Donation Delivered! 🎉",
      `The volunteer has successfully delivered your donation "${donationTitle}" to the recipient.`,
    );
  } catch (error: any) {
    console.error("Failed to notify donor:", error.message || error);
  }

  try {
    await sendCompleteDeliveryRecipientMail(
      recipientUser.email,
      recipientUser.name,
      donationTitle,
      delivery.donationClaim.donationRequest.deliveryAddress,
    );
  } catch (error: any) {
    console.error("Failed to send email to recipient:", error.message || error);
  }

  try {
    await sendCompleteDeliveryDonorMail(
      donorUser.email,
      donorUser.name,
      donationTitle,
    );
  } catch (error: any) {
    console.error("Failed to send email to donor:", error.message || error);
  }

  return delivery;
}

export async function emergencyCancelDeliveryService(
  id: string,
  userId: string,
  reason?: string,
) {
  const delivery = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`
    SELECT id
    FROM "delivery"
    WHERE id = ${id}::uuid
    FOR UPDATE`;

    const existingDelivery = await tx.delivery.findUnique({
      where: { id },
      include: deliveryDetailsInclude,
    });

    if (!existingDelivery) {
      throw new AppError("Delivery not found", 404);
    }

    const isForThisUser = existingDelivery.volunteer?.userId === userId;

    if (!isForThisUser) {
      throw new AppError("You are not authorized to cancel this delivery", 403);
    }

    if (
      existingDelivery.status !== DeliveryStatus.PENDING &&
      existingDelivery.status !== DeliveryStatus.PICKED_UP
    ) {
      throw new AppError(
        `Cannot cancel delivery that is ${existingDelivery.status}.`,
        400,
      );
    }

    const hasCancelledThisWeek = await getWeeklyLimit(userId);
    if (hasCancelledThisWeek !== null) {
      throw new AppError(
        "You have already used your 1 emergency cancellation for this week. Please contact support.",
        403,
      );
    }
    await setWeeklyLimit(userId, 1, 60 * 60 * 24 * 7);

    await tx.delivery.update({
      where: { id },
      data: {
        status: DeliveryStatus.CANCELLED,
        canceledBy: Role.VOLUNTEER,
        canceledAt: new Date(),
        canceledReason: reason,
      },
    });

    await tx.volunteerProfile.update({
      where: { id: existingDelivery.volunteerId },
      data: { availabilityStatus: true },
    });

    return existingDelivery;
  });

  const recipientUser = delivery.donationClaim.recipient.user;
  const volunteerUser = delivery.volunteer?.user;
  const donationTitle = delivery.donationClaim.donation.title;

  try {
    await createNotificationService(
      recipientUser.id,
      "Delivery Cancelled",
      `The volunteer has had an emergency and cancelled the delivery for "${donationTitle}".`,
    );
  } catch (error: any) {
    console.error("Failed to notify recipient:", error.message || error);
  }

  try {
    await sendCancelDeliveryRecipientMail(
      recipientUser.email,
      recipientUser.name,
      donationTitle,
      "Volunteer Emergency Cancellation",
    );
  } catch (error: any) {
    console.error("Failed to send email to recipient:", error.message || error);
  }

  if (volunteerUser) {
    try {
      await createNotificationService(
        volunteerUser.id,
        "Delivery Cancelled",
        `You have used your emergency cancellation for "${donationTitle}".`,
      );
    } catch (error: any) {
      console.error("Failed to notify volunteer:", error.message || error);
    }

    try {
      await sendCancelDeliveryVolunteerMail(
        volunteerUser.email,
        volunteerUser.name,
        donationTitle,
        "Volunteer Emergency Cancellation",
      );
    } catch (error: any) {
      console.error(
        "Failed to send email to volunteer:",
        error.message || error,
      );
    }
  }

  const donorUser = delivery.donationClaim.donation.donor.user;
  try {
    await createNotificationService(
      donorUser.id,
      "Delivery Cancelled",
      `The volunteer has had an emergency and cancelled the delivery for "${donationTitle}".`,
    );
  } catch (error: any) {
    console.error("Failed to notify donor:", error.message || error);
  }

  try {
    await sendCancelDeliveryDonorMail(
      donorUser.email,
      donorUser.name,
      donationTitle,
      "Volunteer Emergency Cancellation",
    );
  } catch (error: any) {
    console.error("Failed to send email to donor:", error.message || error);
  }
}

export async function pickupDeliveryService(userId: string, id: string) {
  const existingDelivery = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`
    SELECT id
    FROM "delivery"
    WHERE id = ${id}::uuid
    FOR UPDATE`;

    const existingDelivery = await tx.delivery.findUnique({
      where: { id },
      include: deliveryDetailsInclude,
    });

    if (!existingDelivery) {
      throw new AppError("Delivery not found", 404);
    }

    const isForThisUser = existingDelivery.volunteer?.userId === userId;

    if (!isForThisUser) {
      throw new AppError("You are not authorized to update this delivery", 403);
    }

    if (existingDelivery.status !== DeliveryStatus.PENDING) {
      throw new AppError(
        `Cannot mark as picked up delivery that is ${existingDelivery.status}. It must be PENDING first.`,
        400,
      );
    }

    const updated = await tx.delivery.update({
      where: { id },
      data: {
        status: DeliveryStatus.PICKED_UP,
      },
      include: deliveryDetailsInclude,
    });

    return updated;
  });

  try {
    await createNotificationService(
      existingDelivery.donationClaim.recipient.userId,
      "Delivery Picked Up! 🚚",
      `The volunteer has picked up your meal "${existingDelivery.donationClaim.donation.title}".`,
    );
  } catch (error: any) {
    console.error("Failed to notify recipient:", error.message || error);
  }
  try {
    await createNotificationService(
      existingDelivery.donationClaim.donation.donor.userId,
      "Delivery Picked Up! 🚚",
      `The volunteer has picked up your meal "${existingDelivery.donationClaim.donation.title}".`,
    );
  } catch (error: any) {
    console.error("Failed to notify donor:", error.message || error);
  }
}
