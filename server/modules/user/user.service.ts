import prisma from "../../database/index.js";
import AppError from "../../utils/errors/AppError.js";
import {
  uploadPFPToCloudinary,
  uploadVerificationDocsToCloudinary,
} from "../../utils/cloudinary/uploadImage.js";
import type {
  UpdateDonorInput,
  UpdateRecipientInput,
  UpdateVolunteerInput,
} from "./user.zod.js";
import { deleteFromCloudinary } from "../../utils/cloudinary/deleteImage.js";

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

export const updateProfilePictureService = async (
  userId: string,
  role: string,
  fileBuffer: Buffer,
) => {
  const existingProfile = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      donorProfile: true,
      recipientProfile: true,
      volunteerProfile: true,
    },
  });

  let currentPic: any = null;
  if (role === "DONOR")
    currentPic = existingProfile?.donorProfile?.profilePicture;
  if (role === "RECIPIENT")
    currentPic = existingProfile?.recipientProfile?.profilePicture;
  if (role === "VOLUNTEER")
    currentPic = existingProfile?.volunteerProfile?.profilePicture;

  if (currentPic && currentPic.public_id) {
    await deleteFromCloudinary(currentPic.public_id);
  }

  const uploadResult = await uploadPFPToCloudinary(fileBuffer);
  const profilePictureJson = {
    secure_url: uploadResult.secure_url,
    public_id: uploadResult.public_id,
  };

  if (role === "DONOR") {
    await prisma.donorProfile.update({
      where: { userId },
      data: { profilePicture: profilePictureJson },
    });
  } else if (role === "RECIPIENT") {
    await prisma.recipientProfile.update({
      where: { userId },
      data: { profilePicture: profilePictureJson },
    });
  } else if (role === "VOLUNTEER") {
    await prisma.volunteerProfile.update({
      where: { userId },
      data: { profilePicture: profilePictureJson },
    });
  } else {
    throw new AppError("Invalid role for profile picture update", 400);
  }

  return profilePictureJson;
};

export const updateVerificationDocumentService = async (
  userId: string,
  role: string,
  files: Express.Multer.File[],
) => {
  const existingProfile = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      donorProfile: true,
      recipientProfile: true,
      volunteerProfile: true,
    },
  });

  let currentDocs: any = null;
  if (role === "DONOR")
    currentDocs = existingProfile?.donorProfile?.verificationDocuments;
  if (role === "RECIPIENT")
    currentDocs = existingProfile?.recipientProfile?.verificationDocuments;
  if (role === "VOLUNTEER")
    currentDocs = existingProfile?.volunteerProfile?.verificationDocuments;

  const existingDocs = Array.isArray(currentDocs) ? currentDocs : [];

  if (files.length + existingDocs.length > 5) {
    throw new AppError("You can only upload a maximum of 5 verification documents in total", 400);
  }

  const uploadPromises = files.map(async (file) => {
    const uploadResult = await uploadVerificationDocsToCloudinary(file.buffer);
    return {
      secure_url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    };
  });

  const newVerificationDocuments = await Promise.all(uploadPromises);
  
  const updatedVerificationDocuments = [...existingDocs, ...newVerificationDocuments];

  if (role === "DONOR") {
    await prisma.donorProfile.update({
      where: { userId },
      data: { verificationDocuments: updatedVerificationDocuments },
    });
  } else if (role === "RECIPIENT") {
    await prisma.recipientProfile.update({
      where: { userId },
      data: { verificationDocuments: updatedVerificationDocuments },
    });
  } else if (role === "VOLUNTEER") {
    await prisma.volunteerProfile.update({
      where: { userId },
      data: { verificationDocuments: updatedVerificationDocuments },
    });
  } else {
    throw new AppError("Invalid role for verification document update", 400);
  }

  return updatedVerificationDocuments;
};
