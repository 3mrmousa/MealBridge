import {
  ClaimStatus,
  DonationRequestStatus,
  DonationStatus,
  Prisma,
  type Donation,
} from "@prisma/client";
import prisma from "../../database/index.js";
import { uploadDonationPicsToCloudinary } from "../../utils/cloudinary/uploadImage.js";
import AppError from "../../utils/errors/AppError.js";
import { deleteFromCloudinary } from "../../utils/cloudinary/deleteImage.js";
import type {
  SortAndPaginateOnDonationClaims,
  SortAndPaginateOnDonationRequests,
  SortAndPaginateOnDonations,
} from "../../utils/types/sort.types.js";
import { createNotificationService } from "../notification/notification.service.js";
import {
  sendAcceptDonationRequestDonorPovMail,
  sendAcceptDonationRequestRecipientPovMail,
  sendChangeEmailOtpMail,
  sendRejectDonationRequestDonorPovMail,
  sendRejectDonationRequestRecipientPovMail,
} from "../../utils/mail/email.service.js";

export const getMyDonationsService = async (
  donorId: string,
  options: SortAndPaginateOnDonations,
) => {
  const {
    page = 1,
    limit = 10,
    status,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = options;

  const skip = (page - 1) * limit;

  const where: Prisma.DonationWhereInput = {
    donorId,
    ...(status && { status }),
  };

  const [donations, totalCount] = await Promise.all([
    prisma.donation.findMany({
      where,
      take: limit,
      skip,
      orderBy: {
        [sortBy]: sortOrder,
      },
    }),
    prisma.donation.count({ where }),
  ]);

  return {
    donations,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
};

export const getDonationByIdService = async (
  donorId: string,
  donationId: string,
) => {
  const donation = await prisma.donation.findUnique({
    where: { donorId, id: donationId },
    include: { donationClaims: true, donationRequests: true },
  });

  if (!donation) throw new AppError("Donation not found", 404);

  return donation;
};

export const createDonationService = async (
  donorId: string,
  donationData: Omit<
    Donation,
    "id" | "createdAt" | "updatedAt" | "donorId" | "status" | "images"
  >,
  images: Express.Multer.File[],
) => {
  const uploadPromises = images.map(async (image) => {
    const uploadResult = await uploadDonationPicsToCloudinary(image.buffer);
    return {
      imageUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    };
  });
  const uploadedImages = await Promise.all(uploadPromises);

  try {
    await prisma.donation.create({
      data: {
        donorId,
        title: donationData.title,
        description: donationData.description,
        foodType: donationData.foodType,
        quantity: donationData.quantity,
        unit: donationData.unit,
        address: donationData.address,
        availableFrom: donationData.availableFrom,
        availableUntil: donationData.availableUntil,
        status: DonationStatus.AVAILABLE,
        images: uploadedImages,
      },
    });
  } catch (error) {
    const deletePromises = uploadedImages.map(async (img) => {
      return deleteFromCloudinary(img.publicId);
    });
    await Promise.all(deletePromises);
    throw new AppError("Failed to create donation", 500);
  }
};

export const updateDonationService = async (
  donorId: string,
  donationData: Partial<
    Omit<Donation, "createdAt" | "updatedAt" | "donorId" | "status" | "images">
  >,
) => {
  await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`
      SELECT id
      FROM "Donation"
      WHERE id = ${donationData.id}
      FOR UPDATE
    `;

    const donation = await tx.donation.findUnique({
      where: { donorId, id: donationData.id },
      include: { donationRequests: true, donationClaims: true },
    });

    if (!donation) {
      throw new AppError("Donation not found", 404);
    }

    const hasActiveInteractions =
      donation.donationClaims.some((d) => d.status === ClaimStatus.ACTIVE) ||
      donation.donationRequests.some(
        (r) => r.status === DonationRequestStatus.PENDING,
      );

    if (hasActiveInteractions) {
      throw new AppError(
        "Can't change donation once there is a pending request or active claim until they are resolved or cancelled",
        400,
      );
    }

    const donationDataToSend: Prisma.DonationUpdateInput = {};
    if (donationData.title) donationDataToSend.title = donationData.title;
    if (donationData.description)
      donationDataToSend.description = donationData.description;
    if (donationData.foodType)
      donationDataToSend.foodType = donationData.foodType;
    if (donationData.quantity)
      donationDataToSend.quantity = donationData.quantity;
    if (donationData.unit) donationDataToSend.unit = donationData.unit;
    if (donationData.address) donationDataToSend.address = donationData.address;
    if (donationData.availableFrom)
      donationDataToSend.availableFrom = donationData.availableFrom;
    if (donationData.availableUntil)
      donationDataToSend.availableUntil = donationData.availableUntil;

    if (!Object.keys(donationDataToSend).length) {
      throw new AppError("No data to update", 400);
    }

    await tx.donation.update({
      where: { donorId, id: donationData.id },
      data: { ...donationDataToSend },
    });
  });
};

export const addPicsToDonationService = async (
  donorId: string,
  donationId: string,
  images: Express.Multer.File[],
) => {
  const donation = await prisma.donation.findUnique({
    where: { id: donationId, donorId },
    select: { images: true },
  });
  if (!donation) {
    throw new AppError("Donation not found", 404);
  }

  if (donation.images.length === 5) {
    throw new AppError("You can only have 5 images for a donation", 400);
  }

  if (donation.images.length + images.length > 5) {
    throw new AppError("You can only have 5 images for a donation", 400);
  }

  const uploadPromises = images.map(async (image) => {
    const uploadResult = await uploadDonationPicsToCloudinary(image.buffer);
    return {
      imageUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    };
  });

  const uploadedImages = await Promise.all(uploadPromises);

  try {
    await prisma.donation.update({
      where: { donorId, id: donationId },
      data: { images: { push: uploadedImages } },
    });
  } catch (error) {
    const deletePromises = uploadedImages.map(async (img) => {
      return deleteFromCloudinary(img.publicId);
    });
    await Promise.all(deletePromises);
    throw new AppError("Failed to add pictures to donation", 500);
  }
};

export const removePicFromDonationService = async (
  donorId: string,
  donationId: string,
  publicId: string,
) => {
  const donation = await prisma.donation.findUnique({
    where: { donorId, id: donationId },
    select: { images: true },
  });

  if (!donation) {
    throw new AppError("Donation not found", 404);
  }

  const images = donation.images as { publicId: string; imageUrl: string }[];
  const imageExists = images.some((img) => img.publicId === publicId);

  if (!imageExists) {
    throw new AppError("Image not found in this donation", 404);
  }

  if (images.length === 1) {
    throw new AppError("You must have at least one image for a donation", 400);
  }

  const updatedImages = images.filter((img) => img.publicId !== publicId);
  await prisma.donation.update({
    where: { id: donationId },
    data: { images: updatedImages },
  });
  await deleteFromCloudinary(publicId);
};

export const deleteDonationService = async (
  donorId: string,
  donationId: string,
) => {
  const donation = await prisma.donation.findUnique({
    where: { id: donationId, donorId },
    include: { donationRequests: true, donationClaims: true },
  });

  if (!donation) {
    throw new AppError("Donation not found", 404);
  }

  const hasActiveInteractions =
    donation.donationClaims.some((d) => d.status === ClaimStatus.ACTIVE) ||
    donation.donationRequests.some(
      (r) => r.status === DonationRequestStatus.PENDING,
    );

  if (hasActiveInteractions) {
    throw new AppError(
      "Can't delete donation once there is a pending request or active claim until they are resolved or cancelled",
      400,
    );
  }

  await prisma.donation.delete({
    where: { donorId, id: donationId },
  });

  if (donation.images && Array.isArray(donation.images)) {
    const deletePromises = donation.images.map(async (img: any) => {
      if (img.publicId) return deleteFromCloudinary(img.publicId);
    });
    await Promise.all(deletePromises);
  }
};

export const getDonorDonationRequestsService = async (
  donorId: string,
  donationId: string,
  options: SortAndPaginateOnDonationRequests,
) => {
  const {
    limit = 10,
    page = 1,
    status,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = options;
  const skip = (page - 1) * limit;
  const where: Prisma.DonationRequestWhereInput = {
    donationId,
    ...(status && { status }),
  };

  const donation = await prisma.donation.findUnique({
    where: { id: donationId, donorId },
  });

  if (!donation) {
    throw new AppError("Donation not found", 404);
  }

  const [requests, totalCount] = await prisma.$transaction([
    prisma.donationRequest.findMany({
      where,
      take: limit,
      skip,
      orderBy: { [sortBy]: sortOrder },
      include: { recipient: true },
    }),
    prisma.donationRequest.count({
      where,
    }),
  ]);

  return {
    requests,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
};

export const getDonorDonationRequestService = async (
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
  const { donation, request } = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`
    SELECT id
    FROM "Donation"
    WHERE id = ${donationId}
    FOR UPDATE`;

    const donation = await tx.donation.findUnique({
      where: { id: donationId, donorId },
      include: {
        donor: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    });
    if (!donation) {
      throw new AppError("Donation not found", 404);
    }

    if (donation.status !== DonationStatus.AVAILABLE) {
      throw new AppError("Donation is no longer avilable", 400);
    }

    if (new Date(donation.availableUntil) < new Date()) {
      throw new AppError("Donation has already expired", 400);
    }
    const request = await tx.donationRequest.findUnique({
      where: { id: requestId, donationId },
      include: {
        recipient: {
          include: { user: { select: { name: true, email: true } } },
        },
      },
    });

    if (!request) {
      throw new AppError("Request not found", 404);
    }

    if (request.status !== DonationRequestStatus.PENDING) {
      throw new AppError("Request is not in pending state", 400);
    }

    if (donation.quantity < request.quantityRequested) {
      throw new AppError(
        `Insufficient quantity available (${donation.quantity} available, ${request.quantityRequested} requested)`,
        400,
      );
    }

    const remainingQuantity = donation.quantity - request.quantityRequested;

    await tx.donationRequest.update({
      where: { id: requestId, donationId },
      data: { status: DonationRequestStatus.ACCEPTED },
    });

    try {
      await tx.donationClaim.create({
        data: {
          donationId: donationId,
          donationRequestId: requestId,
          recipientId: request.recipientId,
          quantityClaimed: request.quantityRequested,
          pickupDeadline: donation.availableUntil,
          status: ClaimStatus.ACTIVE,
        },
      });
    } catch (e: any) {
      if (e.code === "P2002")
        throw new AppError("You already accepted this request", 400);
      else
        throw new AppError(
          `Failed to accept request because of : ${e.message ? e.message : e}`,
          500,
        );
    }

    await tx.donation.update({
      where: { id: donationId },
      data: {
        quantity: remainingQuantity,
        ...(remainingQuantity === 0
          ? { status: DonationStatus.COMPLETED }
          : {}),
      },
    });

    if (remainingQuantity === 0) {
      await tx.donationRequest.updateMany({
        where: {
          donationId,
          status: DonationRequestStatus.PENDING,
        },
        data: {
          status: DonationRequestStatus.REJECTED,
        },
      });
    }

    return { donation, request };
  });

  try {
    await createNotificationService(
      request.recipientId,
      "Donation Request Accepted!",
      `Your request for "${donation.title}" has been accepted. A claim has been created.`,
    );
  } catch (error: any) {
    console.error("Failed to notify recipient:", error.message || error);
  }

  try {
    await sendAcceptDonationRequestRecipientPovMail(
      request.recipient.user.email,
      request.recipient.user.name,
      donationId,
      donation.title,
    );
  } catch (error: any) {
    console.error("Failed to send email to recipient:", error.message || error);
  }

  try {
    await sendAcceptDonationRequestDonorPovMail(
      donation.donor.user.email,
      donation.donor.user.name,
      requestId,
      donation.title,
    );
  } catch (error: any) {
    console.error("Failed to send email to donor:", error.message || error);
  }
};

export const rejectDonationRequestService = async (
  donorId: string,
  donationId: string,
  requestId: string,
) => {
  const donation = await prisma.donation.findUnique({
    where: { id: donationId, donorId },
    include: {
      donor: { include: { user: { select: { name: true, email: true } } } },
    },
  });

  if (!donation) {
    throw new AppError("Donation not found", 404);
  }

  const request = await prisma.donationRequest.findUnique({
    where: { id: requestId, donationId },
    include: {
      recipient: {
        include: { user: { select: { name: true, email: true } } },
      },
    },
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

  try {
    await createNotificationService(
      request.recipientId,
      "Donation Request Rejected!",
      `Your request for "${donation.title}" has been rejected.`,
    );
  } catch (error: any) {
    console.error("Failed to notify recipient:", error.message || error);
  }

  try {
    await sendRejectDonationRequestRecipientPovMail(
      request.recipient.user.email,
      request.recipient.user.name,
      donationId,
      donation.title,
    );
  } catch (error: any) {
    console.error("Failed to send email to recipient:", error.message || error);
  }

  try {
    await sendRejectDonationRequestDonorPovMail(
      donation.donor.user.email,
      donation.donor.user.name,
      requestId,
      donation.title,
    );
  } catch (error: any) {
    console.error("Failed to send email to donor:", error.message || error);
  }
};

export const getAllDonationClaimsService = async (
  donorId: string,
  donationId: string,
  options: SortAndPaginateOnDonationClaims,
) => {
  const {
    page = 1,
    limit = 10,
    status,
    pickupMethod,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = options;
  const skip = (page - 1) * limit;

  const where: Prisma.DonationClaimWhereInput = {
    donationId,
    ...(status && { status }),
    ...(pickupMethod && { pickupMethod }),
  };

  const donation = await prisma.donation.findUnique({
    where: { id: donationId, donorId },
  });
  if (!donation) {
    throw new AppError("Donation not found", 404);
  }

  const [claims, totalCount] = await Promise.all([
    prisma.donationClaim.findMany({
      where,
      take: limit,
      skip,
      orderBy: { [sortBy]: sortOrder },
      include: { recipient: true },
    }),
    prisma.donationClaim.count({ where }),
  ]);
  return {
    claims,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
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
