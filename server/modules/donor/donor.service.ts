import prisma from "../../database/index.js";
import { uploadDonationPicsToCloudinary } from "../../utils/cloudinary/uploadImage.js";

export const getMyDonationsService = async (
  userId: string,
  page: number = 1,
  limit: number = 10,
) => {
  const skip = (page - 1) * limit;

  const donations = await prisma.donation.findMany({
    where: {
      donorId: userId,
    },
    take: limit,
    skip,
  });

  return donations;
};

export const getDonationByIdService = async (
  userId: string,
  donationId: string,
) => {
  const donation = await prisma.donation.findUnique({
    where: {
      donorId: userId,
      id: donationId,
    },
    include: {
      donationClaims: true,
      donationRequests: true,
    },
  });

  return donation;
};

export const createDonationService = async (
  userId: string,
  donationData: {
    title: string;
    description: string;
    foodType: string;
    quantity: number;
    unit: string;
    address: string;
    availableFrom: Date;
    availableTo: Date;
    expirationDate: Date;
  },
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
      donorId: userId,
      title: donationData.title,
      description: donationData.description,
      foodType: donationData.foodType,
      quantity: donationData.quantity,
      unit: donationData.unit,
      address: donationData.address,
      availableFrom: donationData.availableFrom,
      availableUntil: donationData.availableTo,
      expirationDate: donationData.expirationDate,
      status: "AVAILABLE",
      images: uploadedImages,
    },
  });
};
