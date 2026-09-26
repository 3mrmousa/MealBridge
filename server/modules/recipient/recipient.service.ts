import {
  DonationRequestStatus,
  DonationStatus,
  type Prisma,
} from "@prisma/client";
import prisma from "../../database/index.js";
import AppError from "../../utils/errors/AppError.js";
import type { GetMyDonationRequestsQuery } from "./recipient.zod.js";
import { createNotificationService } from "../notification/notification.service.js";
import { sendCreateRequestForDonorMail } from "../../utils/mail/email.service.js";

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
  message?: string,
) => {
  const { donation, request } = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`
      SELECT id
      FROM "Donation"
      WHERE id = ${donationId}
      FOR UPDATE
    `;

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
      where: { recipientId, donationId },
      select: { id: true },
    });

    if (existingRequest) {
      throw new AppError("You have already requested this donation", 400);
    }

    const request = await tx.donationRequest.create({
      data: {
        recipientId,
        donationId,
        quantityRequested,
        message,
        status: DonationRequestStatus.PENDING,
      },
      include: { recipient: { include: { user: { select: { name: true } } } } },
    });

    return { donation, request };
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
      recipientId,
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
    FROM "Donation"
    WHERE id = ${donationRequest.donationId}
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
      throw new AppError("Donation not found ,Please delete the request ", 404);
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

    await tx.donationRequest.update({
      where: { recipientId, id: requestId },
      data: { ...data, status: DonationRequestStatus.PENDING },
    });
  });
};

export const deleteDonationRequestService = async (
  recipientId: string,
  requestId: string,
) => {
  const donationRequest = await prisma.donationRequest.findUnique({
    where: { id: requestId, recipientId },
  });

  if (!donationRequest) {
    throw new AppError("Donation request not found", 404);
  }

  if (donationRequest.status !== DonationRequestStatus.PENDING) {
    throw new AppError("You can only delete pending requests", 400);
  }

  await prisma.donationRequest.delete({
    where: { id: requestId, recipientId },
  });
};
