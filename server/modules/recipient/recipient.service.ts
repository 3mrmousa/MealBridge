import {
  ClaimStatus,
  DonationRequestStatus,
  DonationStatus,
  type Prisma,
} from "@prisma/client";
import prisma from "../../database/index.js";
import AppError from "../../utils/errors/AppError.js";
import type {
  GetAllDonationsQuery,
  GetMyDonationRequestsQuery,
  GetClaimsQuery,
} from "./recipient.zod.js";
import { createNotificationService } from "../notification/notification.service.js";
import {
  sendCreateRequestForDonorMail,
  sendClaimCancelForDonorMail,
} from "../../utils/mail/email.service.js";

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
      FROM "donation"
      WHERE id = ${donationId}::uuid
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
    include: { donation: { select: { donorId: true, title: true } } },
  });

  if (!donationRequest) {
    throw new AppError("Donation request not found", 404);
  }

  if (donationRequest.status !== DonationRequestStatus.PENDING) {
    throw new AppError("You can only delete pending requests", 400);
  }

  const result = await prisma.donationRequest.deleteMany({
    where: {
      id: requestId,
      recipientId,
      status: DonationRequestStatus.PENDING,
    },
  });

  if (result.count === 0) {
    throw new AppError(
      "Could not delete request, It may no longer be pending",
      400,
    );
  }

  try {
    await createNotificationService(
      donationRequest.donation.donorId,
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
        include: {
          user: true,
        },
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
) => {
  const [donation, claim] = await prisma.$transaction(async (tx) => {
    const claim = await tx.donationClaim.findFirst({
      where: {
        id: claimId,
        recipientId,
      },
      include: {
        recipient: true,
      },
    });

    if (!claim) {
      throw new AppError("Claim not found", 404);
    }

    if (claim.status !== ClaimStatus.ACTIVE) {
      throw new AppError("You can't cancel this claim, it is not active", 400);
    }

    // Lock the Donation row to prevent race conditions during updates
    await tx.$queryRaw`
      SELECT id
      FROM "donation"
      WHERE id = ${claim.donationId}::uuid
      FOR UPDATE
    `;

    await tx.donationClaim.update({
      where: { id: claimId },
      data: { status: ClaimStatus.CANCELLED },
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
        donor: { select: { user: { select: { email: true } } } },
      },
    });
    return [lastDonation, claim];
  });

  try {
    await createNotificationService(
      recipientId,
      `Claim on ${donation.title} cancelled successfully`,
      `Your claim on ${donation.title} has been cancelled successfully by you on ${new Date(Date.now()).toLocaleString()}`,
    );
  } catch (e: any) {
    console.error("Error sending notification to recipient:", e.message || e);
  }
  try {
    await createNotificationService(
      donation.donorId,
      `Claim on ${donation.title} has been cancelled`,
      `Claim on ${donation.title} has been cancelled by ${claim.recipient?.organizationName} on ${new Date(Date.now()).toLocaleString()}`,
    );
  } catch (e: any) {
    console.error("Error sending notification:", e.message || e);
  }

  try {
    await sendClaimCancelForDonorMail(
      donation.donor.user.email,
      donation.title,
      claim.recipient?.organizationName,
    );
  } catch (error: any) {
    console.error("Error sending email:", error.message || error);
  }
};
