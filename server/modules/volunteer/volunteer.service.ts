import { PickupRequestStatus, type Prisma } from "@prisma/client";
import type { GetAllPickupRequestsQuery } from "./volunteer.zod.js";
import prisma from "../../database/index.js";
import AppError from "../../utils/errors/AppError.js";
import { createNotificationService } from "../notification/notification.service.js";
import {
  sendAcceptPickupRequestDonorMail,
  sendAcceptPickupRequestRecipientMail,
  sendRejectPickupRequestRecipientMail,
} from "../../utils/mail/email.service.js";

export async function getAllPickupRequestsService(
  userId: string,
  query: GetAllPickupRequestsQuery,
) {
  const {
    limit = 10,
    page = 1,
    sortBy = "createdAt",
    sortOrder = "desc",
    status,
  } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.PickupRequestWhereInput = {
    OR: [{ volunteerId: userId }, { volunteer: { userId } }],
    ...(status ? { status } : {}),
  };


  const [pickupRequests, totalPickupRequests] = await prisma.$transaction([
    prisma.pickupRequest.findMany({
      where,
      take: limit,
      skip,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        recipient: true,
        donationClaim: {
          include: {
            donation: true,
          },
        },
      },
    }),
    prisma.pickupRequest.count({ where }),
  ]);

  return {
    pickupRequests,
    pagination: {
      page,
      limit,
      totalPickupRequests,
      totalPages: Math.ceil(totalPickupRequests / limit),
    },
  };
}

export async function singlePickupRequestService(id: string, userId: string) {
  const volunteerProfile = await prisma.volunteerProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  const pickupRequest = await prisma.pickupRequest.findUnique({
    where: { id },
    include: {
      recipient: true,
      volunteer: {
        select: {
          id: true,
          userId: true,
        },
      },
      donationClaim: {
        include: {
          donation: true,
        },
      },
    },
  });

  if (!pickupRequest) {
    throw new AppError("Pickup request not found", 404);
  }

  const isForThisUser =
    pickupRequest.volunteerId === userId ||
    (volunteerProfile && pickupRequest.volunteerId === volunteerProfile.id) ||
    pickupRequest.volunteer?.userId === userId;

  if (!isForThisUser) {
    throw new AppError(
      "You are not authorized to view this pickup request",
      403,
    );
  }

  return pickupRequest;
}

export async function acceptPickupRequestService(id: string, userId: string) {
  const pickupRequest = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`
    SELECT id
    FROM "pickup_request"
    WHERE id = ${id}::uuid
    FOR UPDATE`;

    const existingPickupRequest = await tx.pickupRequest.findUnique({
      where: { id },
      include: {
        volunteer: {
          select: {
            id: true,
            userId: true,
          },
        },
        recipient: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        donationClaim: {
          include: {
            donation: {
              include: {
                donor: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!existingPickupRequest) {
      throw new AppError("Pickup request not found", 404);
    }

    const volunteerProfile = await tx.volunteerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    const isForThisUser =
      existingPickupRequest.volunteerId === userId ||
      (volunteerProfile &&
        existingPickupRequest.volunteerId === volunteerProfile.id) ||
      existingPickupRequest.volunteer?.userId === userId;

    if (!isForThisUser) {
      throw new AppError(
        "You are not authorized to accept this pickup request",
        403,
      );
    }

    if (existingPickupRequest.status !== PickupRequestStatus.PENDING) {
      throw new AppError(
        `Pickup request is already ${existingPickupRequest.status}`,
        400,
      );
    }

    await tx.pickupRequest.update({
      where: { id },
      data: {
        status: PickupRequestStatus.ACCEPTED,
        acceptedAt: new Date(),
      },
    });

    return existingPickupRequest;
  });

  const recipientUser = pickupRequest.recipient.user;
  const donorUser = pickupRequest.donationClaim.donation.donor.user;
  const donationTitle = pickupRequest.donationClaim.donation.title;

  try {
    await createNotificationService(
      recipientUser.id,
      "Pickup Request Accepted!",
      `A volunteer has accepted the pickup request for "${donationTitle}".`,
    );
  } catch (error: any) {
    console.error("Failed to notify recipient:", error.message || error);
  }

  try {
    await createNotificationService(
      donorUser.id,
      "Pickup Request Accepted!",
      `A volunteer has accepted the pickup request for your donation "${donationTitle}".`,
    );
  } catch (error: any) {
    console.error("Failed to notify donor:", error.message || error);
  }

  try {
    await sendAcceptPickupRequestRecipientMail(
      recipientUser.email,
      recipientUser.name,
      donationTitle,
      pickupRequest.deliveryAddress,
    );
  } catch (error: any) {
    console.error("Failed to send email to recipient:", error.message || error);
  }

  try {
    await sendAcceptPickupRequestDonorMail(
      donorUser.email,
      donorUser.name,
      donationTitle,
      pickupRequest.pickupAddress,
    );
  } catch (error: any) {
    console.error("Failed to send email to donor:", error.message || error);
  }

  return pickupRequest;
}

export async function rejectPickupRequestService(id: string, userId: string) {
  const pickupRequest = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`
    SELECT id
    FROM "pickup_request"
    WHERE id = ${id}::uuid
    FOR UPDATE`;

    const existingPickupRequest = await tx.pickupRequest.findUnique({
      where: { id },
      include: {
        volunteer: {
          select: {
            id: true,
            userId: true,
          },
        },
        recipient: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        donationClaim: {
          include: {
            donation: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    if (!existingPickupRequest) {
      throw new AppError("Pickup request not found", 404);
    }

    const volunteerProfile = await tx.volunteerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    const isForThisUser =
      existingPickupRequest.volunteerId === userId ||
      (volunteerProfile &&
        existingPickupRequest.volunteerId === volunteerProfile.id) ||
      existingPickupRequest.volunteer?.userId === userId;

    if (!isForThisUser) {
      throw new AppError(
        "You are not authorized to reject this pickup request",
        403,
      );
    }

    if (existingPickupRequest.status !== PickupRequestStatus.PENDING) {
      throw new AppError(
        `Pickup request is already ${existingPickupRequest.status}`,
        400,
      );
    }

    await tx.pickupRequest.update({
      where: { id },
      data: { status: PickupRequestStatus.REJECTED },
    });

    return existingPickupRequest;
  });

  const recipientUser = pickupRequest.recipient.user;
  const donationTitle = pickupRequest.donationClaim.donation.title;

  try {
    await createNotificationService(
      recipientUser.id,
      "Pickup Request Declined",
      `Your pickup request for "${donationTitle}" was declined by the volunteer.`,
    );
  } catch (error: any) {
    console.error("Failed to notify recipient:", error.message || error);
  }

  try {
    await sendRejectPickupRequestRecipientMail(
      recipientUser.email,
      recipientUser.name,
      donationTitle,
    );
  } catch (error: any) {
    console.error("Failed to send email to recipient:", error.message || error);
  }

  return pickupRequest;
}


