import { ClaimStatus, DonationRequestStatus, Prisma, type Donation } from "@prisma/client";
import prisma from "../../database/index.js";
import { uploadDonationPicsToCloudinary } from "../../utils/cloudinary/uploadImage.js";
import AppError from "../../utils/errors/AppError.js";
import { deleteFromCloudinary } from "../../utils/cloudinary/deleteImage.js";

export const getMyDonationsService = async (
  donorId: string,
  page: number = 1,
  limit: number = 10,
) => {
  const skip = (page - 1) * limit;

  const donations = await prisma.donation.findMany({
    where: { donorId },
    take: limit,
    skip,
  });

  return donations;
};

export const getDonationByIdService = async (
  donorId: string,
  donationId: string,
) => {
  const donation = await prisma.donation.findUnique({
    where: { donorId, id: donationId },
    include: { donationClaims: true, donationRequests: true },
  });

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
      status: "AVAILABLE",
      images: uploadedImages,
    },
  });
};

export const updateDonationService = async (
  donorId: string,
  donationData: Partial<
    Omit<Donation, "createdAt" | "updatedAt" | "donorId" | "status" | "images">
  >,
) => {
  const donation = await prisma.donation.findUnique({
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

  await prisma.donation.update({
    where: { donorId, id: donationData.id },
    data: { ...donationDataToSend },
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

  await prisma.donation.update({
    where: { donorId, id: donationId },
    data: { images: { push: uploadedImages } },
  });
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

  await deleteFromCloudinary(publicId);
  const updatedImages = images.filter((img) => img.publicId !== publicId);

  await prisma.donation.update({
    where: { id: donationId },
    data: { images: updatedImages },
  });
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
};
