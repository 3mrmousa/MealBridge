import { ClaimStatus, DonationRequestStatus } from "@prisma/client";
import prisma from "../../database/index.js";
import AppError from "../../utils/errors/AppError.js";

export const getAllDonationRequestsService = async (
  donorId: string,
  donationId: string,
  limit: number = 10,
  page: number = 1,
) => {
  const skip = (page - 1) * limit;

  const donation = await prisma.donation.findUnique({
    where: { id: donationId, donorId },
  });

  if (!donation) {
    throw new AppError("Donation not found", 404);
  }

  const requests = await prisma.donationRequest.findMany({
    where: { donationId },
    take: limit,
    skip,
  });

  return requests;
};

export const getSingleDonationRequestsService = async (
  donorId: string,
  donationId: string,
  requestId: string,
) => {
  const donation = await prisma.donation.findUnique({
    where: { id: donationId, donorId },
  });

  if (!donation) {
    throw new AppError("Donation not found", 404);
  }

  const request = await prisma.donationRequest.findUnique({
    where: { id: requestId, donationId },
    include: { recipient: true },
  });

  if (!request) {
    throw new AppError("Request not found", 404);
  }

  return request;
};

export const acceptDonationRequestService = async (
  donorId: string,
  donationId: string,
  requestId: string,
) => {
  const donation = await prisma.donation.findUnique({
    where: { id: donationId, donorId },
  });

  if (!donation) {
    throw new AppError("Donation not found", 404);
  }

  const request = await prisma.donationRequest.findUnique({
    where: { id: requestId, donationId },
  });

  if (!request) {
    throw new AppError("Request not found", 404);
  }

  if (request.status !== DonationRequestStatus.PENDING) {
    throw new AppError("Request is not in pending state", 400);
  }

  await prisma.donationRequest.update({
    where: { id: requestId, donationId },
    data: { status: DonationRequestStatus.ACCEPTED },
  });

  await prisma.donationClaim.create({
    data: {
      donationId: donationId,
      donationRequestId: requestId,
      recipientId: request.recipientId,
      quantityClaimed: request.quantityRequested,
      pickupDeadline: donation.availableUntil,
      status: ClaimStatus.ACTIVE,
    },
  });
};

export const rejectDonationRequestService = async (
  donorId: string,
  donationId: string,
  requestId: string,
) => {
  const donation = await prisma.donation.findUnique({
    where: { id: donationId, donorId },
  });

  if (!donation) {
    throw new AppError("Donation not found", 404);
  }

  const request = await prisma.donationRequest.findUnique({
    where: { id: requestId, donationId },
  });

  if (!request) {
    throw new AppError("Request not found", 404);
  }

  if (request.status !== DonationRequestStatus.PENDING) {
    throw new AppError("Request is not in pending state", 400);
  }

  await prisma.donationRequest.update({
    where: { id: requestId, donationId },
    data: { status: DonationRequestStatus.REJECTED },
  });
};
