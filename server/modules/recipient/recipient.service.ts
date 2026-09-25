import {
  DonationRequestStatus,
  DonationStatus,
  type Prisma,
} from "@prisma/client";
import prisma from "../../database/index.js";
import AppError from "../../utils/errors/AppError.js";
import type { GetMyDonationRequestsQuery } from "./recipient.zod.js";

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

export const createDonationService = async (
  recipientId: string,
  donationId: string,
  quantityRequested: number,
  message?: string,
) => {
  await prisma.$transaction(async (tx) => {
    const donation = await tx.donation.findUnique({
      where: { id: donationId },
    });

    if (!donation) {
      throw new AppError("Donation not found", 404);
    }

    if (donation.status !== DonationStatus.AVAILABLE) {
      throw new AppError("This donation is not available", 400);
    }

    if (donation.quantity < quantityRequested) {
      throw new AppError(
        `Only ${donation.quantity} unit(s) available`,
        400,
      );
    }

    const existingRequest = await tx.donationRequest.findFirst({
      where: { recipientId, donationId },
      select: { id: true },
    });

    if (existingRequest) {
      throw new AppError("You have already requested this donation", 400);
    }

    await tx.donation.update({
      where: { id: donationId, quantity: { gte: quantityRequested } },
      data: { quantity: { decrement: quantityRequested } },
    });

    await tx.donationRequest.create({
      data: {
        recipientId,
        donationId,
        quantityRequested,
        message,
        status: DonationRequestStatus.PENDING,
      },
    });
  });
};
