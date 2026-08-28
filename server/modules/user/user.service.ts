import prisma from "../../database/index.js";
import AppError from "../../utils/errors/AppError.js";
import type {
  UpdateDonorInput,
  UpdateRecipientInput,
  UpdateVolunteerInput,
} from "./user.zod.js";

export const getUserProfileService = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    omit: { passwordHash: true },
    include: {
      donorProfile: true,
      recipientProfile: true,
      volunteerProfile: true,
    },
  });

  return user;
};

export const updateDonorProfileService = async (
  userId: string,
  data: UpdateDonorInput,
) => {
  const { name, phone, ...profileData } = data;

  if (!profileData.address) {
    throw new AppError("Address is required", 400);
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      phone,
      donorProfile: {
        upsert: {
          update: profileData,
          create: {
            ...profileData,
            address: profileData.address,
          },
        },
      },
    },
  });
};

export const updateRecipientProfileService = async (
  userId: string,
  data: UpdateRecipientInput,
) => {
  const { name, phone, ...profileData } = data;

  if (!profileData.address) {
    throw new AppError("Address is required", 400);
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      phone,
      recipientProfile: {
        upsert: {
          update: profileData,
          create: {
            ...profileData,
            address: profileData.address,
          },
        },
      },
    },
  });
};

export const updateVolunteerProfileService = async (
  userId: string,
  data: UpdateVolunteerInput,
) => {
  const { name, phone, ...profileData } = data;

  if (!profileData.address) {
    throw new AppError("Address is required", 400);
  }

  if (!profileData.type) {
    throw new AppError("Type is required", 400);
  }

  if (!profileData.transportType) {
    throw new AppError("Transport Type is required", 400);
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      phone,
      volunteerProfile: {
        upsert: {
          update: profileData,
          create: {
            ...profileData,
            address: profileData.address,
            type: profileData.type,
            transportType: profileData.transportType,
          },
        },
      },
    },
  });
};
