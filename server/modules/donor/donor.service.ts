import {
  ClaimStatus,
  ConversationType,
  DeliveryRequestStatus,
  DeliveryStatus,
  DonationRequestStatus,
  DonationStatus,
  PickupMethod,
  Prisma,
  Role,
  type Donation,
} from "@prisma/client";
import prisma from "../../database/index.js";
import {
  donorOnly,
  donorWithUser,
  recipientOnly,
  recipientWithUser,
  volunteerWithUser,
} from "../../database/selectors.js";
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
  sendClaimCancelForRecipientMail,
  sendClaimCancelForVolunteerMail,
  sendEmergencyDonationCancellationRecipientMail,
  sendEmergencyDonationCancellationVolunteerMail,
  sendRejectDonationRequestDonorPovMail,
  sendRejectDonationRequestRecipientPovMail,
} from "../../utils/mail/email.service.js";
import {
  createConversationAndNotify,
  lockConversationsForClaim,
} from "../chat/chat.service.js";

export const getMyDonationsService = async (
  donorId: string,
  query: SortAndPaginateOnDonations,
) => {
  const {
    page = 1,
    limit = 10,
    status,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

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
    | "id"
    | "createdAt"
    | "updatedAt"
    | "donorId"
    | "status"
    | "images"
    | "pickupAddress"
  > & { pickupAddress?: string },
  images: Express.Multer.File[],
) => {
  const donorProfile = await prisma.donorProfile.findUnique({
    where: { id: donorId },
  });

  if (!donorProfile) {
    throw new AppError("Donor profile not found", 404);
  }

  const finalPickupAddress = donationData.pickupAddress || donorProfile.address;

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
        donorId: donorProfile.id,
        title: donationData.title,
        description: donationData.description,
        foodType: donationData.foodType,
        quantity: donationData.quantity,
        unit: donationData.unit,
        pickupAddress: finalPickupAddress,
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
  donationId: string,
  donationData: Partial<
    Omit<
      Donation,
      "id" | "createdAt" | "updatedAt" | "donorId" | "status" | "images"
    >
  >,
) => {
  await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`
      SELECT id
      FROM "donation"
      WHERE id = ${donationId}::uuid
      FOR UPDATE
    `;

    const donation = await tx.donation.findUnique({
      where: { donorId, id: donationId },
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
    if (
      donationData.pickupAddress &&
      donationData.pickupAddress !== donation.pickupAddress
    ) {
      if (hasActiveInteractions) {
        throw new AppError(
          "Can't change pickup address once there is a pending request or active claim",
          400,
        );
      }
    }

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
    if (donationData.pickupAddress)
      donationDataToSend.pickupAddress = donationData.pickupAddress;
    if (donationData.availableFrom)
      donationDataToSend.availableFrom = donationData.availableFrom;
    if (donationData.availableUntil)
      donationDataToSend.availableUntil = donationData.availableUntil;

    if (!Object.keys(donationDataToSend).length) {
      throw new AppError("No data to update", 400);
    }

    await tx.donation.update({
      where: { donorId, id: donationId },
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

export const cancelDonationService = async (
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

  await prisma.donation.update({
    where: { donorId, id: donationId },
    data: {
      status: DonationStatus.CANCELLED,
    },
  });

  if (donation.images && Array.isArray(donation.images)) {
    const deletePromises = donation.images.map(async (img: any) => {
      if (img.publicId) return deleteFromCloudinary(img.publicId);
    });
    await Promise.all(deletePromises);
  }
};

export const getDonationRequestsService = async (
  donorId: string,
  donationId: string,
  query: SortAndPaginateOnDonationRequests,
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
      include: {
        recipient: {
          select: recipientWithUser,
        },
      },
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

export const getSingleDonationRequestService = async (
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
    include: {
      recipient: {
        select: recipientWithUser,
      },
    },
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
  const { donation, request, claim } = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`
    SELECT id
    FROM "donation"
    WHERE id = ${donationId}::uuid
    FOR UPDATE`;

    await tx.$queryRaw`
    SELECT id
    FROM "donation_request"
    WHERE id = ${requestId}::uuid
    FOR UPDATE`;

    const donation = await tx.donation.findUnique({
      where: { id: donationId, donorId },
      include: {
        donor: {
          select: donorWithUser,
        },
      },
    });
    if (!donation) {
      throw new AppError("Donation not found", 404);
    }

    if (donation.status !== DonationStatus.AVAILABLE) {
      throw new AppError("Donation is no longer available", 400);
    }

    if (new Date(donation.availableUntil) < new Date()) {
      throw new AppError("Donation has already expired", 400);
    }
    const request = await tx.donationRequest.findUnique({
      where: { id: requestId, donationId },
      include: {
        recipient: {
          select: recipientWithUser,
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

    let claim;
    try {
      claim = await tx.donationClaim.create({
        data: {
          donationRequestId: requestId,
          donationId: donationId,
          recipientId: request.recipientId,
          quantityClaimed: request.quantityRequested,
          pickupDeadline: donation.availableUntil,
          pickupMethod: PickupMethod.SELF,
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
        ...(remainingQuantity === 0 ? { status: DonationStatus.CLAIMED } : {}),
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

    return { donation, request, claim };
  });

  try {
    await createConversationAndNotify(
      claim.id,
      ConversationType.DONOR_RECIPIENT,
      [donation.donor.userId, request.recipient.userId],
    );
  } catch (error: any) {
    console.error("Failed to create conversation:", error.message || error);
  }

  try {
    await createNotificationService(
      request.recipient.userId,
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
  const { donation, request } = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`
    SELECT id
    FROM "donation"
    WHERE id = ${donationId}::uuid
    FOR UPDATE`;

    await tx.$queryRaw`
    SELECT id
    FROM "donation_request"
    WHERE id = ${requestId}::uuid
    FOR UPDATE`;

    const donation = await tx.donation.findUnique({
      where: { id: donationId, donorId },
      include: {
        donor: {
          select: donorWithUser,
        },
      },
    });

    if (!donation) {
      throw new AppError("Donation not found", 404);
    }

    const request = await tx.donationRequest.findUnique({
      where: { id: requestId, donationId },
      include: {
        recipient: {
          select: recipientWithUser,
        },
      },
    });

    if (!request) {
      throw new AppError("Request not found", 404);
    }

    if (request.status !== DonationRequestStatus.PENDING) {
      throw new AppError("Request is not in pending state", 400);
    }

    await tx.donationRequest.update({
      where: { id: requestId, donationId },
      data: { status: DonationRequestStatus.REJECTED },
    });

    return { donation, request };
  });

  try {
    await createNotificationService(
      request.recipient.userId,
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
      include: {
        recipient: {
          select: recipientOnly,
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

export const cancelClaimService = async (
  donorId: string,
  claimId: string,
  reason: string,
) => {
  const [donation, claim, delivery] = await prisma.$transaction(async (tx) => {
    const claim = await tx.donationClaim.findFirst({
      where: {
        id: claimId,
        donation: {
          donorId: donorId,
        },
      },
      include: {
        donation: {
          include: {
            donor: {
              select: donorOnly,
            },
          },
        },
        recipient: {
          select: {
            organizationName: true,
            userId: true,
            user: { select: { email: true } },
          },
        },
        deliveryRequests: true,
      },
    });

    if (!claim) {
      throw new AppError("Claim not found or you don't have permission", 404);
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
        canceledBy: Role.DONOR,
        canceledReason: reason,
      },
    });

    await tx.donationRequest.update({
      where: { id: claim.donationRequestId },
      data: { status: DonationRequestStatus.CANCELLED },
    });

    const shouldMakeAvailable =
      claim.donation.status !== DonationStatus.EXPIRED &&
      claim.donation.status !== DonationStatus.CANCELLED;

    const lastDonation = await tx.donation.update({
      where: { id: claim.donationId },
      data: {
        quantity: {
          increment: claim.quantityClaimed,
        },
        ...(shouldMakeAvailable ? { status: DonationStatus.AVAILABLE } : {}),
      },
    });

    await tx.deliveryRequest.updateMany({
      where: {
        id: {
          in: claim.deliveryRequests.map(
            (deliveryRequest) => deliveryRequest.id,
          ),
        },
      },
      data: { status: DeliveryRequestStatus.CANCELLED },
    });

    var delivery;
    if (claim.pickupMethod === PickupMethod.VOLUNTEER) {
      delivery = await tx.delivery.update({
        where: {
          donationClaimId: claimId,
        },
        data: { status: DeliveryStatus.CANCELLED },
        include: {
          volunteer: {
            select: { userId: true, user: { select: { email: true } } },
          },
        },
      });

      await tx.volunteerProfile.update({
        where: {
          id: delivery.volunteerId,
        },
        data: {
          availabilityStatus: true,
        },
      });
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
      claim.recipient.userId,
      `Claim on ${donation.title} cancelled by donor`,
      `Your claim on ${donation.title} has been cancelled by the donor on ${new Date(Date.now()).toLocaleString()}. Reason: ${reason}`,
    );
  } catch (e: any) {
    console.error("Error sending notification to recipient:", e.message || e);
  }
  try {
    await createNotificationService(
      claim.donation.donor.userId,
      `Claim on ${donation.title} cancelled by you`,
      `Claim on "${donation.title}" has been cancelled by you on ${new Date(Date.now()).toLocaleString()}. Reason: ${reason}`,
    );
  } catch (e: any) {
    console.error("Error sending notification to donor:", e.message || e);
  }

  if (delivery) {
    try {
      await createNotificationService(
        delivery.volunteer.userId,
        `Claim on ${donation.title} cancelled by donor`,
        `Claim on "${donation.title}" has been cancelled by donor on ${new Date(Date.now()).toLocaleString()}. Reason: ${reason}`,
      );
    } catch (e: any) {
      console.error("Error sending notification to volunteer:", e.message || e);
    }
  }

  try {
    await sendClaimCancelForRecipientMail(
      claim.recipient.user.email,
      donation.title,
      claim.donation.donor.organizationName || "the donor",
      reason,
    );
  } catch (e: any) {
    console.error("Error sending email to recipient:", e.message || e);
  }

  if (delivery && delivery.volunteer) {
    try {
      await sendClaimCancelForVolunteerMail(
        delivery.volunteer.user.email,
        donation.title,
        claim.donation.donor.organizationName || "the donor",
        reason,
      );
    } catch (e: any) {
      console.error("Error sending email to volunteer:", e.message || e);
    }
  }
};

export const emergencyCancelDonationService = async (
  donorId: string,
  donationId: string,
) => {
  const existingDonation = await prisma.$transaction(async (tx) => {
    // Lock for donation related records
    await tx.$queryRaw`
      SELECT id
      FROM "donation"
      WHERE id = ${donationId}::uuid
      FOR UPDATE`;
    await tx.$queryRaw`
      SELECT id
      FROM "donation_request"
      WHERE donation_id = ${donationId}::uuid
      FOR UPDATE`;
    await tx.$queryRaw`
      SELECT id
      FROM "donation_claim"
      WHERE donation_id = ${donationId}::uuid
      FOR UPDATE`;

    // Lock for delivery related records
    await tx.$queryRaw`
      SELECT dr.id
      FROM "delivery_request" as dr
      JOIN "donation_claim" as dc
      ON dc.id = dr.donation_claim_id
      WHERE dc.donation_id = ${donationId}::uuid
      FOR UPDATE OF dr`;
    await tx.$queryRaw`
      SELECT d.id
      FROM "delivery" as d
      JOIN "donation_claim" as dc
      ON dc.id = d.donation_claim_id
      WHERE dc.donation_id = ${donationId}::uuid
      FOR UPDATE OF d`;

    const donation = await tx.donation.findUnique({
      where: { id: donationId, donorId },
      include: {
        donor: {
          select: donorWithUser,
        },
      },
    });

    if (!donation) {
      throw new AppError("Donation not found", 404);
    }

    if (donation.status === DonationStatus.COMPLETED) {
      throw new AppError(
        "Cannot emergency cancel an already completed donation",
        400,
      );
    }

    if (donation.status === DonationStatus.CANCELLED) {
      throw new AppError("Donation is already cancelled", 400);
    }

    await tx.donation.update({
      where: { id: donationId },
      data: { status: DonationStatus.CANCELLED },
    });

    await tx.donationRequest.updateMany({
      where: { donationId, status: DonationRequestStatus.PENDING },
      data: { status: DonationRequestStatus.CANCELLED },
    });

    const claims = await tx.donationClaim.findMany({
      where: { donationId, status: ClaimStatus.ACTIVE },
      select: {
        id: true,
        recipient: { select: recipientWithUser },
        delivery: {
          select: {
            id: true,
            volunteerId: true,
            volunteer: { select: volunteerWithUser },
          },
        },
      },
    });

    const claimIds = claims.map((claim) => claim.id);

    if (claimIds.length > 0) {
      await tx.donationClaim.updateMany({
        where: { id: { in: claimIds } },
        data: {
          status: ClaimStatus.CANCELLED,
          canceledBy: Role.DONOR,
          canceledReason: "Emergency cancellation by donor",
        },
      });

      await tx.deliveryRequest.updateMany({
        where: {
          donationClaimId: { in: claimIds },
          status: {
            in: [DeliveryRequestStatus.PENDING, DeliveryRequestStatus.ACCEPTED],
          },
        },
        data: { status: DeliveryRequestStatus.CANCELLED },
      });

      const deliveries = claims
        .map((c) => c.delivery)
        .filter((d): d is NonNullable<typeof d> => d !== null);

      if (deliveries.length > 0) {
        await tx.delivery.updateMany({
          where: {
            donationClaimId: { in: claimIds },
            status: {
              in: [DeliveryStatus.PENDING, DeliveryStatus.PICKED_UP],
            },
          },
          data: {
            status: DeliveryStatus.CANCELLED,
            canceledAt: new Date(),
            canceledBy: Role.DONOR,
            canceledReason: "Emergency cancellation by donor",
          },
        });

        const volunteerIds = deliveries.map((d) => d.volunteerId);
        await tx.volunteerProfile.updateMany({
          where: { id: { in: volunteerIds }, availabilityStatus: false },
          data: { availabilityStatus: true },
        });
      }
    }

    return { donation, claims };
  });

  for (const claim of existingDonation.claims) {
    try {
      await lockConversationsForClaim(claim.id);
    } catch (err: any) {
      console.error(
        "Failed to lock conversations for claim:",
        err.message || err,
      );
    }
    try {
      await createNotificationService(
        claim.recipient.userId,
        `Emergency Cancellation: ${existingDonation.donation.title}`,
        `The donation "${existingDonation.donation.title}" was emergency cancelled by the donor. Reason: Food spoiled or safety issue.`,
      );
    } catch (err: any) {
      console.error(
        "Failed to notify recipient of emergency cancellation:",
        err.message || err,
      );
    }

    try {
      await sendEmergencyDonationCancellationRecipientMail(
        claim.recipient.user.email,
        claim.recipient.organizationName || claim.recipient.user.name,
        existingDonation.donation.title,
        existingDonation.donation.donor.organizationName ||
          existingDonation.donation.donor.user.name ||
          "the donor",
        "Food spoiled or safety issue",
      );
    } catch (err: any) {
      console.error(
        "Failed to send emergency cancellation email to recipient:",
        err.message || err,
      );
    }

    if (claim.delivery?.volunteer) {
      try {
        await createNotificationService(
          claim.delivery.volunteer.userId,
          `Emergency Delivery Cancellation`,
          `The delivery for "${existingDonation.donation.title}" has been cancelled due to an emergency donor cancellation. Do not proceed with pickup.`,
        );
      } catch (err: any) {
        console.error(
          "Failed to notify volunteer of emergency cancellation:",
          err.message || err,
        );
      }

      try {
        await sendEmergencyDonationCancellationVolunteerMail(
          claim.delivery.volunteer.user.email,
          claim.delivery.volunteer.user.name,
          existingDonation.donation.title,
          existingDonation.donation.donor.organizationName ||
            existingDonation.donation.donor.user.name ||
            "the donor",
          "Food spoiled or safety issue",
        );
      } catch (err: any) {
        console.error(
          "Failed to send emergency cancellation email to volunteer:",
          err.message || err,
        );
      }
    }
  }

  return existingDonation.donation;
};
