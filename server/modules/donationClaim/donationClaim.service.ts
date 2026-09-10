import prisma from "../../database/index.js";
import AppError from "../../utils/errors/AppError.js";

export const getAllDonationClaimsService = async (
  donorId: string,
  donationId: string,
  limit: number = 10,
  page: number = 1,
) => {
  const donation = await prisma.donation.findUnique({
    where: { id: donationId, donorId },
  });
  if (!donation) {
    throw new AppError("Donation not found", 404);
  }
  const skip = (page - 1) * limit;

  const claims = await prisma.donationClaim.findMany({
    where: { donationId },
    take: limit,
    skip,
  });
  return claims;
};

export const getSingleDonationClaimService = async (
  donorId: string,
  donationId: string,
  claimId: string,
) => {
  const donation = await prisma.donation.findUnique({
    where: { id: donationId, donorId },
  });
  if (!donation) {
    throw new AppError("Donation not found", 404);
  }

  const claim = await prisma.donationClaim.findUnique({
    where: { id: claimId, donationId },
  });
  if (!claim) {
    throw new AppError("Claim not found", 404);
  }

  return claim;
};
