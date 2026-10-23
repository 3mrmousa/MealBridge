import {
  ClaimStatus,
  ConversationType,
  DeliveryRequestStatus,
  DeliveryStatus,
  DonationRequestStatus,
  DonationStatus,
  PickupMethod,
  Role,
  type DonationClaim,
  type Prisma,
} from "@prisma/client";
import prisma from "../../database/index.js";
import {
  donorWithUser,
  recipientOnly,
  recipientWithUser,
  volunteerWithUser,
} from "../../database/selectors.js";
import { deliveryDetailsInclude } from "../../database/includes.js";
import AppError from "../../utils/errors/AppError.js";
import type {
  GetAllDonationsQuery,
  GetMyDonationRequestsQuery,
  GetClaimsQuery,
  GetVolunteersQuery,
  GetDeliveryRequestsQuery,
  GetDeliveriesQuery,
} from "./recipient.zod.js";
import { createNotificationService } from "../notification/notification.service.js";
import {
  sendCreateRequestForDonorMail,
  sendClaimCancelForDonorMail,
  sendClaimCancelForVolunteerMail,
  sendCreateDeliveryRequestVolunteerMail,
  sendCancelDeliveryRequestVolunteerMail,
  sendSelfPickupCompletedDonorMail,
  sendSelfPickupCompletedRecipientMail,
  sendCompleteDeliveryVolunteerMail,
  sendCompleteDeliveryRecipientMail,
  sendCompleteDeliveryDonorMail,
} from "../../utils/mail/email.service.js";
import {
  lockConversationByType,
  lockConversationsForClaim,
} from "../chat/chat.service.js";

export const getMyDonationRequestsService = async (
  recipientId: string,
  query: GetMyDonationRequestsQuery,
) => {
  const {
    limit = 10,
    page = 1,
    status,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  const skip = (page - 1) * limit;

  const where: Prisma.DonationRequestWhereInput = {
    recipientId,
    ...(status ? { status } : {}),
  };

  const [requests, totalRequests] = await prisma.$transaction([
    prisma.donationRequest.findMany({
      where,
      take: limit,
      skip,
      orderBy: { [sortBy]: sortOrder },
      include: {
        donation: {
          include: {
            donor: { select: { user: { select: { name: true } } } },
          },
        },
      },
    }),
    prisma.donationRequest.count({ where }),
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
};

export const getMyDonationRequestByIdService = async (
  recipientId: string,
  requestId: string,
) => {
  const request = await prisma.donationRequest.findFirst({
    where: {
      recipientId,
      id: requestId,
    },
    include: {
      donation: {
        include: {
          donor: { select: { user: { select: { name: true } } } },
        },
      },
    },
  });

  if (!request) {
    throw new AppError("Donation request not found", 404);
  }

  return request;
};

export const createDonationRequestService = async (
  recipientId: string,
  donationId: string,
  quantityRequested: number,
  message: string,
  deliveryAddress?: string,
) => {
  const { donation, request, recipientUserId } = await prisma.$transaction(
    async (tx) => {
    await tx.$queryRaw`
      SELECT id
      FROM "donation"
      WHERE id = ${donationId}::uuid
      FOR UPDATE
    `;

    const recipient = await tx.recipientProfile.findUnique({
      where: { id: recipientId },
      include: { user: { select: { email: true } } },
    });

    if (!recipient) {
      throw new AppError("Recipient not found", 404);
    }

    const donation = await tx.donation.findUnique({
      where: { id: donationId },
      include: { donor: { include: { user: { select: { email: true } } } } },
    });

    if (!donation) {
      throw new AppError("Donation not found", 404);
    }

    if (donation.status !== DonationStatus.AVAILABLE) {
      throw new AppError("This donation is not available", 400);
    }

    if (donation.quantity < quantityRequested) {
      throw new AppError(`Only ${donation.quantity} unit(s) available`, 400);
    }

    const existingRequest = await tx.donationRequest.findFirst({
      where: { recipientId: recipient.id, donationId },
      select: { id: true },
    });

    if (existingRequest) {
      throw new AppError("You have already requested this donation", 400);
    }

    const finalDeliveryAddress = deliveryAddress || recipient.address;

    const request = await tx.donationRequest.create({
      data: {
        recipientId: recipient.id,
        donationId,
        quantityRequested,
        deliveryAddress: finalDeliveryAddress,
        message,
        status: DonationRequestStatus.PENDING,
      },
      include: { recipient: { include: { user: { select: { name: true } } } } },
    });

    return { donation, request, recipientUserId: recipient.userId };
  });

  try {
    await sendCreateRequestForDonorMail(
      donation.donor.user.email,
      donation.title,
      request.id,
      request.message,
      request.quantityRequested,
    );
  } catch (e: any) {
    console.error("Error sending email:", e.message || e);
  }

  try {
    await createNotificationService(
      donation.donor.userId,
      "New Donation Request",
      `New request for ${donation.title} by ${request.recipient.user.name}`,
    );
  } catch (e: any) {
    console.error("Error sending notification:", e.message || e);
  }

  try {
    await createNotificationService(
      recipientUserId,
      `Donation Request you send for ${donation.title}`,
      `Your request for ${donation.title} has been created`,
    );
  } catch (e: any) {
    console.error("Error sending notification:", e.message || e);
  }
};

export const updateDonationRequestService = async (
  recipientId: string,
  requestId: string,
  quantityRequested?: number,
  deliveryAddress?: string,
  message?: string,
) => {
  await prisma.$transaction(async (tx) => {
    const donationRequest = await tx.donationRequest.findUnique({
      where: {
        id: requestId,
        recipientId,
      },
    });

    if (!donationRequest) {
      throw new AppError("Donation request not found", 404);
    }

    await tx.$queryRaw`
    SELECT id
    FROM "donation"
    WHERE id = ${donationRequest.donationId}::uuid
    FOR UPDATE
  `;
    await tx.$queryRaw`
    SELECT id
    FROM "donation_request"
    WHERE id = ${donationRequest.id}::uuid
    FOR UPDATE
  `;

    if (recipientId !== donationRequest.recipientId) {
      throw new AppError(
        "You are not authorized to update this donation request",
        401,
      );
    }

    if (donationRequest.status !== DonationRequestStatus.PENDING) {
      throw new AppError("You can only update pending donation requests", 400);
    }

    const donation = await tx.donation.findUnique({
      where: { id: donationRequest.donationId },
    });

    if (!donation) {
      throw new AppError("Donation not found, please delete the request", 404);
    }

    const data: Prisma.DonationRequestUpdateInput = {};

    if (quantityRequested) {
      if (quantityRequested > donation.quantity) {
        throw new AppError(`Only ${donation.quantity} unit(s) available`, 400);
      }
      data.quantityRequested = quantityRequested;
    }

    if (message) {
      data.message = message;
    }

    if (deliveryAddress) {
      data.deliveryAddress = deliveryAddress;
    }

    await tx.donationRequest.update({
      where: { recipientId, id: requestId },
      data: { ...data, status: DonationRequestStatus.PENDING },
    });
  });
};

export const cancelDonationRequestService = async (
  recipientId: string,
  requestId: string,
) => {
  const donationRequest = await prisma.donationRequest.findUnique({
    where: { id: requestId, recipientId },
    include: {
      donation: {
        select: { donor: { select: { userId: true } }, title: true },
      },
    },
  });

  if (!donationRequest) {
    throw new AppError("Donation request not found", 404);
  }

  if (donationRequest.status !== DonationRequestStatus.PENDING) {
    throw new AppError("You can only cancel pending requests", 400);
  }

  const result = await prisma.donationRequest.update({
    where: {
      id: requestId,
      recipientId,
      status: DonationRequestStatus.PENDING,
    },
    data: {
      status: DonationRequestStatus.CANCELLED,
    },
  });

  if (!result) {
    throw new AppError(
      "Could not cancel request, it may no longer be pending",
      400,
    );
  }

  try {
    await createNotificationService(
      donationRequest.donation.donor.userId,
      "Donation Request Withdrawn",
      `A pending request for your donation "${donationRequest.donation.title}" has been withdrawn by the recipient.`,
    );
  } catch (e: any) {
    console.error("Error sending notification to donor:", e.message || e);
  }
};

// Donations Routes (Recipient Perspective) Services

export const getAllDonationsService = async (query: GetAllDonationsQuery) => {
  const {
    limit = 10,
    page = 1,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  const skip = (page - 1) * limit;

  const [donations, totalDonations] = await prisma.$transaction([
    prisma.donation.findMany({
      where: { status: DonationStatus.AVAILABLE },
      take: limit,
      skip,
      orderBy: { [sortBy]: sortOrder },
      include: {
        donor: {
          select: {
            organizationName: true,
            profilePicture: true,
            address: true,
            organizationType: true,
          },
        },
      },
    }),
    prisma.donation.count({ where: { status: DonationStatus.AVAILABLE } }),
  ]);

  return {
    donations,
    pagination: {
      page,
      limit,
      totalDonations,
      totalPages: Math.ceil(totalDonations / limit),
    },
  };
};

export const getDonationByIdService = async (donationId: string) => {
  const donation = await prisma.donation.findUnique({
    where: {
      id: donationId,
    },
    include: {
      donor: {
        select: donorWithUser,
      },
    },
  });
  if (!donation) {
    throw new AppError("Donation not found", 404);
  }
  return donation;
};

// Donation Claim Routes (Recipient Perspective) Services

export const getClaimsService = async (
  recipientId: string,
  query: GetClaimsQuery,
) => {
  const {
    limit = 10,
    page = 1,
    status,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  const skip = (page - 1) * limit;

  const where: Prisma.DonationClaimWhereInput = {
    recipientId,
    ...(status ? { status } : {}),
  };

  const [claims, totalClaims] = await prisma.$transaction([
    prisma.donationClaim.findMany({
      where,
      take: limit,
      skip,
      orderBy: { [sortBy]: sortOrder },
      include: {
        donation: {
          include: {
            donor: { select: { user: { select: { name: true } } } },
          },
        },
      },
    }),
    prisma.donationClaim.count({ where }),
  ]);

  return {
    claims,
    pagination: {
      page,
      limit,
      totalClaims,
      totalPages: Math.ceil(totalClaims / limit),
    },
  };
};

export const getClaimByIdService = async (
  recipientId: string,
  claimId: string,
) => {
  const claim = await prisma.donationClaim.findFirst({
    where: {
      id: claimId,
      recipientId,
    },
    include: {
      donation: {
        include: {
          donor: { select: { user: { select: { name: true } } } },
        },
      },
    },
  });

  if (!claim) {
    throw new AppError("Claim not found", 404);
  }

  return claim;
};

export const cancelClaimService = async (
  recipientId: string,
  claimId: string,
  reason: string,
) => {
  const [donation, claim, delivery] = await prisma.$transaction(async (tx) => {
    const claim = await tx.donationClaim.findFirst({
      where: {
        id: claimId,
        recipientId,
      },
      include: {
        recipient: {
          select: recipientOnly,
        },
        deliveryRequests: true,
      },
    });

    if (!claim) {
      throw new AppError("Claim not found", 404);
    }

    if (claim.status !== ClaimStatus.ACTIVE) {
      throw new AppError("You can't cancel this claim, it is not active", 400);
    }

    await tx.$queryRaw`
      SELECT id
      FROM "donation"
      WHERE id = ${claim.donationId}::uuid
      FOR UPDATE
    `;

    await tx.donationClaim.update({
      where: { id: claimId },
      data: {
        status: ClaimStatus.CANCELLED,
        canceledBy: Role.RECIPIENT,
        canceledReason: reason,
      },
    });

    await tx.donationRequest.update({
      where: { id: claim.donationRequestId },
      data: { status: DonationRequestStatus.CANCELLED },
    });

    const donation = await tx.donation.findUnique({
      where: { id: claim.donationId },
    });

    if (!donation) {
      throw new AppError("Donation not found", 404);
    }

    const shouldMakeAvailable =
      donation.status !== DonationStatus.EXPIRED &&
      donation.status !== DonationStatus.CANCELLED;

    const lastDonation = await tx.donation.update({
      where: { id: claim.donationId },
      data: {
        quantity: {
          increment: claim.quantityClaimed,
        },
        ...(shouldMakeAvailable ? { status: DonationStatus.AVAILABLE } : {}),
      },
      include: {
        donor: { select: { userId: true, user: { select: { email: true } } } },
      },
    });

    await tx.deliveryRequest.updateMany({
      where: {
        id: {
          in: claim.deliveryRequests.map((req) => req.id),
        },
      },
      data: { status: DeliveryRequestStatus.CANCELLED },
    });

    var delivery;
    if (claim.pickupMethod === PickupMethod.VOLUNTEER) {
      const existingDelivery = await tx.delivery.findUnique({
        where: { donationClaimId: claimId },
      });

      if (existingDelivery) {
        delivery = await tx.delivery.update({
          where: { id: existingDelivery.id },
          data: { status: DeliveryStatus.CANCELLED },
          include: {
            volunteer: {
              select: { userId: true, user: { select: { email: true } } },
            },
          },
        });

        await tx.volunteerProfile.update({
          where: { id: delivery.volunteerId },
          data: { availabilityStatus: true },
        });
      }
    }

    return [lastDonation, claim, delivery];
  });

  try {
    await lockConversationsForClaim(claimId);
  } catch (e: any) {
    console.error("Error locking conversations for claim:", e.message || e);
  }

  try {
    await createNotificationService(
      donation.donor.userId,
      `Claim on ${donation.title} cancelled by recipient`,
      `Claim on "${donation.title}" has been cancelled by the recipient on ${new Date(Date.now()).toLocaleString()}. Reason: ${reason}`,
    );
  } catch (e: any) {
    console.error("Error sending notification to donor:", e.message || e);
  }
  try {
    await createNotificationService(
      claim.recipient.userId,
      `Claim on ${donation.title} cancelled by you`,
      `Your claim on ${donation.title} has been cancelled by you on ${new Date(Date.now()).toLocaleString()}. Reason: ${reason}`,
    );
  } catch (e: any) {
    console.error("Error sending notification to recipient:", e.message || e);
  }

  if (delivery) {
    try {
      await createNotificationService(
        delivery.volunteer.userId,
        `Claim on ${donation.title} cancelled by recipient`,
        `Claim on "${donation.title}" has been cancelled by recipient on ${new Date(Date.now()).toLocaleString()}. Reason: ${reason}`,
      );
    } catch (e: any) {
      console.error("Error sending notification to volunteer:", e.message || e);
    }
  }

  try {
    await sendClaimCancelForDonorMail(
      donation.donor.user.email,
      donation.title,
      claim.recipient.organizationName,
      reason,
    );
  } catch (error: any) {
    console.error("Error sending email:", error.message || error);
  }

  if (delivery && delivery.volunteer) {
    try {
      await sendClaimCancelForVolunteerMail(
        delivery.volunteer.user.email,
        donation.title,
        claim.recipient.organizationName || "the recipient",
        reason,
      );
    } catch (e: any) {
      console.error("Error sending email to volunteer:", e.message || e);
    }
  }
};

export const selfPickupClaimService = async (
  recipientId: string,
  claimId: string,
) => {
  const [updatedClaim, claim] = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`
      SELECT id FROM "donation_claim"
      WHERE id = ${claimId}::uuid
      FOR UPDATE
    `;

    const claim = await tx.donationClaim.findUnique({
      where: { id: claimId },
      include: {
        recipient: {
          select: recipientWithUser,
        },
        donation: {
          include: {
            donor: {
              select: donorWithUser,
            },
          },
        },
      },
    });

    if (!claim) {
      throw new AppError("Claim not found", 404);
    }
    if (claim.recipientId !== recipientId) {
      throw new AppError("Unauthorized", 401);
    }
    if (claim.status !== ClaimStatus.ACTIVE) {
      throw new AppError(
        "Claim is not active, you can't pick up this donation",
        400,
      );
    }
    if (claim.pickupMethod !== PickupMethod.SELF) {
      throw new AppError(
        "You can't pick up this donation, it is not a self-pickup",
        400,
      );
    }
    if (claim.pickupDeadline && claim.pickupDeadline < new Date(Date.now())) {
      throw new AppError("Pickup deadline has passed", 400);
    }

    const updatedClaim = await tx.donationClaim.update({
      where: { id: claimId },
      data: { status: ClaimStatus.COMPLETED },
    });

    const pendingClaimsCount = await tx.donationClaim.count({
      where: {
        donationId: claim.donationId,
        status: { not: ClaimStatus.COMPLETED },
      },
    });

    const donation = await tx.donation.findUnique({
      where: { id: claim.donationId },
      select: { quantity: true },
    });

    if (donation && donation.quantity === 0 && pendingClaimsCount === 0) {
      await tx.donation.update({
        where: { id: claim.donationId },
        data: { status: DonationStatus.COMPLETED },
      });
    }

    return [updatedClaim, claim];
  });

  try {
    await lockConversationsForClaim(claimId);
  } catch (e: any) {
    console.error("Error locking conversations for claim:", e.message || e);
  }

  try {
    await createNotificationService(
      claim.donation.donor.userId,
      `Self-pickup completed for ${claim.donation.title}`,
      `Recipient "${claim.recipient.organizationName}" has completed the self-pickup for donation "${claim.donation.title}" on ${new Date(Date.now()).toLocaleString()}. The claim is now marked as completed.`,
    );
  } catch (e: any) {
    console.error("Error sending notification to donor:", e.message || e);
  }

  try {
    await createNotificationService(
      claim.recipient.userId,
      `Self-pickup completed for ${claim.donation.title}`,
      `You have successfully confirmed self-pickup for "${claim.donation.title}" on ${new Date(Date.now()).toLocaleString()}.`,
    );
  } catch (e: any) {
    console.error("Error sending notification to recipient:", e.message || e);
  }

  try {
    await sendSelfPickupCompletedDonorMail(
      claim.donation.donor.user.email,
      claim.donation.donor.user.name || claim.donation.donor.organizationName,
      claim.donation.title,
      claim.recipient.organizationName,
    );
  } catch (error: any) {
    console.error(
      "Error sending self-pickup email to donor:",
      error.message || error,
    );
  }

  try {
    await sendSelfPickupCompletedRecipientMail(
      claim.recipient.user.email,
      claim.recipient.user.name || claim.recipient.organizationName,
      claim.donation.title,
      claim.donation.donor.organizationName,
    );
  } catch (error: any) {
    console.error(
      "Error sending self-pickup email to recipient:",
      error.message || error,
    );
  }

  return updatedClaim;
};

// Delivery & Volunteer Services

export const getAllVolunteersService = async (query: GetVolunteersQuery) => {
  const {
    limit = 10,
    page = 1,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.VolunteerProfileWhereInput = {
    availabilityStatus: true,
    verificationStatus: true,
  };

  const [volunteers, totalVolunteers] = await prisma.$transaction([
    prisma.volunteerProfile.findMany({
      where,
      take: limit,
      skip,
      orderBy: { [sortBy]: sortOrder },
      select: volunteerWithUser,
    }),
    prisma.volunteerProfile.count({ where }),
  ]);

  return {
    volunteers,
    pagination: {
      page,
      limit,
      totalVolunteers,
      totalPages: Math.ceil(totalVolunteers / limit),
    },
  };
};

export const getVolunteerByIdService = async (volunteerId: string) => {
  const volunteer = await prisma.volunteerProfile.findFirst({
    where: { id: volunteerId, verificationStatus: true },
    select: volunteerWithUser,
  });

  if (!volunteer) {
    throw new AppError("Volunteer not found", 404);
  }

  return volunteer;
};

export const getDeliveryRequestsService = async (
  recipientId: string,
  query: GetDeliveryRequestsQuery,
) => {
  const {
    limit = 10,
    page = 1,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.DeliveryRequestWhereInput = {
    recipientId,
  };

  const [requests, totalRequests] = await prisma.$transaction([
    prisma.deliveryRequest.findMany({
      where,
      take: limit,
      skip,
      orderBy: { [sortBy]: sortOrder },
      include: {
        volunteer: { select: { user: { select: { name: true } } } },
        donationClaim: { select: { donation: { select: { title: true } } } },
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
};

export const getSingleDeliveryRequestService = async (
  recipientId: string,
  requestId: string,
) => {
  const request = await prisma.deliveryRequest.findUnique({
    where: { id: requestId, recipientId },
    include: {
      volunteer: { select: { user: { select: { name: true } } } },
      donationClaim: { select: { donation: { select: { title: true } } } },
    },
  });

  if (!request) {
    throw new AppError("Delivery request not found", 404);
  }

  return request;
};

export const createDeliveryRequestService = async (
  recipientId: string,
  claimId: string,
  volunteerId: string,
  notes?: string,
) => {
  const deliveryRequest = await prisma.$transaction(async (tx) => {
    const claim = await tx.donationClaim.findFirst({
      where: { id: claimId, recipientId },
      include: {
        donation: true,
        recipient: {
          select: recipientOnly,
        },
      },
    });

    if (!claim) {
      throw new AppError("Donation claim not found", 404);
    }

    if (claim.status !== ClaimStatus.ACTIVE) {
      throw new AppError("Only active claims can request delivery", 400);
    }

    const existingDelivery = await tx.delivery.findUnique({
      where: { donationClaimId: claimId },
    });

    if (existingDelivery) {
      throw new AppError("This claim already has an active delivery.", 400);
    }

    const existingRequest = await tx.deliveryRequest.findFirst({
      where: {
        donationClaimId: claimId,
        volunteerId,
        status: "PENDING",
      },
    });

    if (existingRequest) {
      throw new AppError(
        "A pending request already exists for this volunteer.",
        400,
      );
    }

    const volunteer = await tx.volunteerProfile.findUnique({
      where: { id: volunteerId },
    });

    if (!volunteer) {
      throw new AppError("Volunteer not found", 404);
    }

    if (!volunteer.verificationStatus) {
      throw new AppError("Volunteer is not verified", 400);
    }

    if (!volunteer.availabilityStatus) {
      throw new AppError("Volunteer is not currently available", 400);
    }

    const newRequest = await tx.deliveryRequest.create({
      data: {
        donationClaimId: claimId,
        recipientId,
        volunteerId,
        notes,
      },
      include: {
        donationClaim: { include: { donation: true } },
        volunteer: {
          select: {
            userId: true,
            user: { select: { email: true, name: true } },
          },
        },
      },
    });

    return newRequest;
  });

  try {
    await createNotificationService(
      deliveryRequest.volunteer.userId,
      "Delivery request received",
      `Delivery request for ${deliveryRequest.donationClaim.donation.title} received`,
    );
  } catch (e: any) {
    console.error("Error sending notification to volunteer:", e.message || e);
  }

  try {
    await sendCreateDeliveryRequestVolunteerMail(
      deliveryRequest.volunteer.user.email,
      deliveryRequest.volunteer.user.name,
      deliveryRequest.donationClaim.donation.title,
    );
  } catch (e: any) {
    console.error("Error sending email to volunteer:", e.message || e);
  }
};

export const cancelDeliveryRequestService = async (
  recipientId: string,
  requestId: string,
) => {
  const deliveryRequest = await prisma.$transaction(async (tx) => {
    const result: any = await tx.$queryRaw`
      SELECT id, status 
      FROM "delivery_request" 
      WHERE id = ${requestId}::uuid 
        AND recipient_id = ${recipientId}::uuid 
      FOR UPDATE
    `;
    const request = result[0];
    if (!request) {
      throw new AppError("Delivery request not found", 404);
    }
    if (request.status !== "PENDING") {
      throw new AppError("Delivery request cannot be cancelled", 400);
    }
    const updatedRequest = await tx.deliveryRequest.update({
      where: { id: requestId },
      data: { status: "CANCELLED" },
      include: {
        volunteer: {
          select: {
            userId: true,
            user: { select: { email: true, name: true } },
          },
        },
        donationClaim: { include: { donation: { select: { title: true } } } },
      },
    });

    return updatedRequest;
  });

  try {
    await createNotificationService(
      deliveryRequest.volunteer.userId,
      "Delivery Request Withdrawn",
      `A pending delivery request for "${deliveryRequest.donationClaim.donation.title}" has been withdrawn by the recipient.`,
    );
  } catch (e: any) {
    console.error("Error sending notification to volunteer:", e.message || e);
  }

  try {
    await sendCancelDeliveryRequestVolunteerMail(
      deliveryRequest.volunteer.user.email,
      deliveryRequest.volunteer.user.name,
      deliveryRequest.donationClaim.donation.title,
    );
  } catch (e: any) {
    console.error("Error sending email to volunteer:", e.message || e);
  }
};

export const getDeliveriesService = async (
  recipientId: string,
  query: GetDeliveriesQuery,
) => {
  const {
    limit = 10,
    page = 1,
    status,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  const skip = (page - 1) * limit;

  const where: Prisma.DeliveryWhereInput = {
    recipientId,
    ...(status ? { status } : {}),
  };

  const [deliveries, totalDeliveries] = await prisma.$transaction([
    prisma.delivery.findMany({
      where,
      take: limit,
      skip,
      orderBy: { [sortBy]: sortOrder },
      include: {
        volunteer: {
          select: { user: { select: { name: true, phone: true } } },
        },
        donationClaim: {
          select: {
            donation: { select: { title: true, pickupAddress: true } },
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
};

export const getSingleDeliveriesService = async (
  recipientId: string,
  deliveryId: string,
) => {
  const delivery = await prisma.delivery.findUnique({
    where: {
      id: deliveryId,
      recipientId,
    },
    include: {
      volunteer: {
        select: { user: { select: { name: true, phone: true, email: true } } },
      },
      donationClaim: {
        include: {
          donation: {
            include: {
              donor: {
                select: donorWithUser,
              },
            },
          },
        },
      },
    },
  });

  if (!delivery) {
    throw new AppError("Delivery not found", 404);
  }

  return delivery;
};

export const isDonationClaimHasDeliveryService = async (
  recipientId: string,
  donationClaimId: string,
) => {
  const existingDelivery = await prisma.delivery.findUnique({
    where: { donationClaimId, recipientId },
  });

  return !!existingDelivery;
};

export const markDeliveryAsReceivedService = async (
  recipientId: string,
  deliveryId: string,
) => {
  const existingDelivery = await prisma.$transaction(async (tx) => {
    const existingDelivery = await tx.delivery.findUnique({
      where: { id: deliveryId, recipientId },
      include: deliveryDetailsInclude,
    });

    if (!existingDelivery) {
      throw new AppError("Delivery not found", 404);
    }
    if (existingDelivery.status === DeliveryStatus.COMPLETED) {
      throw new AppError("Delivery is already marked as completed", 400);
    }
    if (existingDelivery.status === DeliveryStatus.CANCELLED) {
      throw new AppError("Cannot complete a cancelled delivery", 400);
    }

    const now = new Date();

    await tx.delivery.update({
      where: { id: deliveryId },
      data: { status: DeliveryStatus.COMPLETED, completedAt: now },
    });

    await tx.donationClaim.update({
      where: { id: existingDelivery.donationClaimId },
      data: { status: ClaimStatus.COMPLETED, collectedAt: now },
    });

    await tx.volunteerProfile.update({
      where: { id: existingDelivery.volunteerId },
      data: { availabilityStatus: true },
    });

    const donation = existingDelivery.donationClaim.donation;
    const pendingClaimsCount = await tx.donationClaim.count({
      where: {
        donationId: donation.id,
        status: { not: ClaimStatus.COMPLETED },
      },
    });

    if (donation.quantity === 0 && pendingClaimsCount === 0) {
      await tx.donation.update({
        where: { id: donation.id },
        data: { status: DonationStatus.COMPLETED },
      });
    }

    return existingDelivery;
  });

  const volunteer = existingDelivery.volunteer;
  const recipient = existingDelivery.donationClaim.recipient;
  const donor = existingDelivery.donationClaim.donation.donor;
  const donationTitle = existingDelivery.donationClaim.donation.title;
  const deliveryAddress =
    existingDelivery.donationClaim.donationRequest?.deliveryAddress ||
    "your address";

  try {
    await lockConversationsForClaim(existingDelivery.donationClaimId);
  } catch (e: any) {
    console.error("Error locking conversations for claim:", e.message || e);
  }

  try {
    await createNotificationService(
      volunteer.userId,
      "Delivery Completed! 🌟",
      `The recipient has confirmed receiving the delivery for "${donationTitle}". Thank you for your service!`,
    );
  } catch (e: any) {
    console.error("Error sending notification to volunteer:", e.message || e);
  }

  try {
    await createNotificationService(
      recipient.userId,
      "Delivery Completed! 🎉",
      `You have successfully confirmed receiving "${donationTitle}".`,
    );
  } catch (e: any) {
    console.error("Error sending notification to recipient:", e.message || e);
  }

  try {
    await createNotificationService(
      donor.userId,
      "Donation Delivered! 🎉",
      `Your donation "${donationTitle}" has been successfully delivered to ${recipient.organizationName} by volunteer ${volunteer.user.name}.`,
    );
  } catch (e: any) {
    console.error("Error sending notification to donor:", e.message || e);
  }

  try {
    await sendCompleteDeliveryVolunteerMail(
      volunteer.user.email,
      volunteer.user.name,
      donationTitle,
    );
  } catch (error: any) {
    console.error(
      "Error sending complete delivery email to volunteer:",
      error.message || error,
    );
  }

  try {
    await sendCompleteDeliveryRecipientMail(
      recipient.user.email,
      recipient.user.name || recipient.organizationName,
      donationTitle,
      deliveryAddress,
    );
  } catch (error: any) {
    console.error(
      "Error sending complete delivery email to recipient:",
      error.message || error,
    );
  }

  try {
    await sendCompleteDeliveryDonorMail(
      donor.user.email,
      donor.user.name || donor.organizationName,
      donationTitle,
    );
  } catch (error: any) {
    console.error(
      "Error sending complete delivery email to donor:",
      error.message || error,
    );
  }

  return existingDelivery;
};

export const cancelDeliveryService = async (
  recipientId: string,
  deliveryId: string,
  reason: string,
) => {
  const existingDelivery = await prisma.$transaction(async (tx) => {
    const existingDelivery = await tx.delivery.findUnique({
      where: { id: deliveryId, recipientId },
      include: {
        volunteer: {
          select: volunteerWithUser,
        },
        donationClaim: { include: { donation: true } },
        recipient: {
          select: recipientWithUser,
        },
      },
    });

    if (!existingDelivery) {
      throw new AppError("Delivery not found", 404);
    }
    if (
      existingDelivery.status === DeliveryStatus.COMPLETED ||
      existingDelivery.status === DeliveryStatus.CANCELLED ||
      existingDelivery.status === DeliveryStatus.PICKED_UP
    ) {
      throw new AppError(
        `Cannot cancel delivery that is ${existingDelivery.status}`,
        400,
      );
    }

    await tx.delivery.update({
      where: { id: deliveryId },
      data: {
        status: DeliveryStatus.CANCELLED,
        canceledBy: Role.RECIPIENT,
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

  try {
    await lockConversationByType(
      existingDelivery.donationClaimId,
      ConversationType.RECIPIENT_VOLUNTEER,
    );
  } catch (e: any) {
    console.error("Error locking recipient-volunteer conversations for claim:", e.message || e);
  }

  try {
    await lockConversationByType(
      existingDelivery.donationClaimId,
      ConversationType.DONOR_VOLUNTEER,
    );
  } catch (e: any) {
    console.error("Error locking donor-volunteer conversations for claim:", e.message || e);
  }

  try {
    await createNotificationService(
      existingDelivery.volunteer.userId,
      "Delivery Cancelled",
      `The recipient has cancelled the delivery for ${existingDelivery.donationClaim.donation.title}. You are now available for other deliveries.`,
    );
  } catch (e: any) {
    console.error("Error sending notification to volunteer:", e.message || e);
  }
  try {
    await createNotificationService(
      existingDelivery.recipient.userId,
      "Delivery Cancelled",
      `You cancelled the delivery for ${existingDelivery.donationClaim.donation.title}.`,
    );
  } catch (e: any) {
    console.error("Error sending notification to recipient:", e.message || e);
  }

  try {
    await sendClaimCancelForVolunteerMail(
      existingDelivery.volunteer!.user.email,
      existingDelivery.donationClaim.donation.title,
      existingDelivery.recipient.user.name,
      "The recipient has cancelled the delivery.",
    );
  } catch (e: any) {
    console.error("Error sending email to volunteer:", e.message || e);
  }
};
