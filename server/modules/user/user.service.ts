import prisma from "../../database/index.js";
import { Prisma } from "@prisma/client";
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
import { Role } from "@prisma/client";
import {
  comparePassword,
  hashPassword,
} from "../../utils/password/passwordFunctions.js";
import {
  deleteOtpSession,
  getOtpSession,
  setOtpSession,
} from "../../utils/redis/otp.redis.js";
import type { OtpSessionDatachangeEmailRequest } from "./user.otp.store.js";
import { generateOtp, verifyOtp } from "../../utils/otp/generateOtp.js";
import { sendChangeEmailOtpMail } from "../../utils/mail/email.service.js";
import { formatPhoneNumber } from "../../utils/phoneNumber/formatPhoneNumber.js";

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

  const existingProfile = await prisma.donorProfile.findUnique({
    where: { userId },
  });

  if (!existingProfile &&  !profileData.address) {
    throw new AppError("Address is required to complete your profile setup", 400);
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
            address: profileData.address!,
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

  const existingProfile = await prisma.recipientProfile.findUnique({
    where: { userId },
  });

  if (!existingProfile && !profileData.address) {
    throw new AppError("Address is required to complete your profile setup", 400);
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
            address: profileData.address!,
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

  const existingProfile = await prisma.volunteerProfile.findUnique({
    where: { userId },
  });

  if (!existingProfile) {
    if (!profileData.address) throw new AppError("Address is required to complete your profile setup", 400);
    if (!profileData.type) throw new AppError("Type is required to complete your profile setup", 400);
    if (!profileData.transportType) throw new AppError("Transport Type is required to complete your profile setup", 400);
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
            address: profileData.address!,
            type: profileData.type!,
            transportType: profileData.transportType!,
          },
        },
      },
    },
  });
};

export const updateProfilePictureService = async (
  userId: string,
  role: Role,
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
  if (role === Role.DONOR)
    currentPic = existingProfile?.donorProfile?.profilePicture;
  if (role === Role.RECIPIENT)
    currentPic = existingProfile?.recipientProfile?.profilePicture;
  if (role === Role.VOLUNTEER)
    currentPic = existingProfile?.volunteerProfile?.profilePicture;

  const uploadResult = await uploadPFPToCloudinary(fileBuffer);

  const profilePictureJson = {
    secure_url: uploadResult.secure_url,
    public_id: uploadResult.public_id,
  };

  try {
    if (role === Role.DONOR) {
      await prisma.donorProfile.update({
        where: { userId },
        data: { profilePicture: profilePictureJson },
      });
    } else if (role === Role.RECIPIENT) {
      await prisma.recipientProfile.update({
        where: { userId },
        data: { profilePicture: profilePictureJson },
      });
    } else if (role === Role.VOLUNTEER) {
      await prisma.volunteerProfile.update({
        where: { userId },
        data: { profilePicture: profilePictureJson },
      });
    } else {
      throw new AppError("Invalid role for profile picture update", 400);
    }
  } catch (error: any) {
    await deleteFromCloudinary(profilePictureJson.public_id);
    if (error.code === "P2025") {
      throw new AppError(
        "Profile not found. Please complete your profile first.",
        404,
      );
    }
    throw new AppError(
      `Failed to update profile picture because of : ${error.message ? error.message : error}`,
      500,
    );
  }

  if (currentPic && currentPic.public_id) {
    await deleteFromCloudinary(currentPic.public_id);
  }
};

export const deleteProfilePictureService = async (
  userId: string,
  role: Role,
  public_id: string,
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
  if (role === Role.DONOR)
    currentPic = existingProfile?.donorProfile?.profilePicture;
  if (role === Role.RECIPIENT)
    currentPic = existingProfile?.recipientProfile?.profilePicture;
  if (role === Role.VOLUNTEER)
    currentPic = existingProfile?.volunteerProfile?.profilePicture;

  if (
    !currentPic ||
    !currentPic.public_id ||
    currentPic.public_id !== public_id
  ) {
    throw new AppError("Profile picture not found", 404);
  }

  try {
    if (role === Role.DONOR) {
      await prisma.donorProfile.update({
        where: { userId },
        data: { profilePicture: Prisma.DbNull },
      });
    } else if (role === Role.RECIPIENT) {
      await prisma.recipientProfile.update({
        where: { userId },
        data: { profilePicture: Prisma.DbNull },
      });
    } else if (role === Role.VOLUNTEER) {
      await prisma.volunteerProfile.update({
        where: { userId },
        data: { profilePicture: Prisma.DbNull },
      });
    } else {
      throw new AppError("Invalid role for profile picture deletion", 400);
    }
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new AppError(
        "Profile not found. Please complete your profile first.",
        400,
      );
    }
    throw new AppError("Failed to delete profile picture.", 500);
  }

  await deleteFromCloudinary(public_id);
};

export const updateVerificationDocumentService = async (
  userId: string,
  role: Role,
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
  if (role === Role.DONOR)
    currentDocs = existingProfile?.donorProfile?.verificationDocuments;
  if (role === Role.RECIPIENT)
    currentDocs = existingProfile?.recipientProfile?.verificationDocuments;
  if (role === Role.VOLUNTEER)
    currentDocs = existingProfile?.volunteerProfile?.verificationDocuments;

  const existingDocs = Array.isArray(currentDocs) ? currentDocs : [];

  if (files.length + existingDocs.length > 5) {
    throw new AppError(
      "You can only upload a maximum of 5 verification documents in total",
      400,
    );
  }

  const uploadPromises = files.map(async (file) => {
    const uploadResult = await uploadVerificationDocsToCloudinary(file.buffer);
    return {
      imageUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    };
  });

  const newVerificationDocuments = await Promise.all(uploadPromises);

  const updatedVerificationDocuments = [
    ...existingDocs,
    ...newVerificationDocuments,
  ];

  try {
    if (role === Role.DONOR) {
      await prisma.donorProfile.update({
        where: { userId },
        data: { verificationDocuments: updatedVerificationDocuments },
      });
    } else if (role === Role.RECIPIENT) {
      await prisma.recipientProfile.update({
        where: { userId },
        data: { verificationDocuments: updatedVerificationDocuments },
      });
    } else if (role === Role.VOLUNTEER) {
      await prisma.volunteerProfile.update({
        where: { userId },
        data: { verificationDocuments: updatedVerificationDocuments },
      });
    } else {
      throw new AppError("Invalid role for verification document update", 400);
    }
  } catch (error: any) {
    const deletePromises = newVerificationDocuments.map(async (doc) => {
      return deleteFromCloudinary(doc.publicId);
    });
    await Promise.all(deletePromises);
    if (error.code === "P2025") {
      throw new AppError(
        "Profile not found. Please complete your profile details before uploading documents.",
        400,
      );
    }
    throw new AppError("Failed to update verification document", 500);
  }
};

export const deleteVerificationDocumentService = async (
  userId: string,
  role: Role,
  public_id: string,
) => {
  if (role !== Role.DONOR && role !== Role.RECIPIENT && role !== Role.VOLUNTEER) {
    throw new AppError("Not allowed operation", 404);
  }

  const existingProfile = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      donorProfile: true,
      recipientProfile: true,
      volunteerProfile: true,
    },
  });

  let currentDocs: any = null;
  if (role === Role.DONOR)
    currentDocs = existingProfile?.donorProfile?.verificationDocuments;
  if (role === Role.RECIPIENT)
    currentDocs = existingProfile?.recipientProfile?.verificationDocuments;
  if (role === Role.VOLUNTEER)
    currentDocs = existingProfile?.volunteerProfile?.verificationDocuments;

  if (!currentDocs || currentDocs.length === 0 || !Array.isArray(currentDocs)) {
    throw new AppError("No verification documents found", 404);
  }

  const filteredDocs = currentDocs.filter(
    (doc: { secureUrl: string; publicId: string }) =>
      doc.publicId !== public_id,
  );

  if (filteredDocs.length === currentDocs.length) {
    throw new AppError("Document not found", 404);
  }

  try {
    if (role === Role.DONOR) {
      await prisma.donorProfile.update({
        where: { userId },
        data: { verificationDocuments: filteredDocs },
      });
    } else if (role === Role.RECIPIENT) {
      await prisma.recipientProfile.update({
        where: { userId },
        data: { verificationDocuments: filteredDocs },
      });
    } else if (role === Role.VOLUNTEER) {
      await prisma.volunteerProfile.update({
        where: { userId },
        data: { verificationDocuments: filteredDocs },
      });
    }
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new AppError(
        "Profile not found. Please complete your profile first.",
        400,
      );
    }
    throw new AppError("Failed to delete verification document.", 500);
  }
  await deleteFromCloudinary(public_id);
};

export const changePasswordService = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError("User not found", 404);

  const isPasswordValid = await comparePassword(
    currentPassword,
    user.passwordHash,
  );
  if (!isPasswordValid) throw new AppError("Invalid current password", 401);

  const isSame = await comparePassword(newPassword, user.passwordHash);

  if (isSame) {
    throw new AppError("New password is same as current password", 400);
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: hashedPassword, tokenVersion: { increment: 1 } },
  });
};

export const changeEmailRequestService = async (
  currentEmail: string,
  newEmail: string,
) => {
  const existingSession = await getOtpSession<OtpSessionDatachangeEmailRequest>(
    `changeEmail:${currentEmail}`,
  );

  if (existingSession) {
    throw new AppError(
      "You already have an OTP request check your email or spam or try again later",
      400,
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email: newEmail,
    },
  });

  if (existingUser) {
    throw new AppError("This email is already in use", 400);
  }

  const { otp, hashedOtp } = generateOtp();

  await setOtpSession(
    `changeEmail:${currentEmail}`,
    {
      hashedOtpCurrentEmail: hashedOtp,
      hashedOtpNewEmail: null,
      newEmail: newEmail,
      user: {
        email: currentEmail,
      },
      step1: null,
    } as OtpSessionDatachangeEmailRequest,
    600,
  );

  await sendChangeEmailOtpMail(currentEmail, otp);
};

export const currentEmailOtpVerificationService = async (
  currentEmail: string,
  otp: string,
) => {
  const Session = await getOtpSession<OtpSessionDatachangeEmailRequest>(
    `changeEmail:${currentEmail}`,
  );

  if (!Session) {
    throw new AppError("There is no change Email request", 400);
  }

  if (Session.step1 === true) {
    throw new AppError("Enter the otp or wait 10 min and try again", 400);
  }

  const isMatch = verifyOtp(otp, Session.hashedOtpCurrentEmail);

  if (!isMatch) {
    throw new AppError("Invalid or expired OTP", 400);
  }

  const { otp: newOtp, hashedOtp } = generateOtp();

  await setOtpSession(
    `changeEmail:${currentEmail}`,
    {
      ...Session,
      hashedOtpNewEmail: hashedOtp,
      step1: true,
    } as OtpSessionDatachangeEmailRequest,
    600,
  );

  await sendChangeEmailOtpMail(Session.newEmail, newOtp);
};

export const newEmailOtpVerificationAndChangeService = async (
  currentEmail: string,
  otp: string,
) => {
  const Session = await getOtpSession<OtpSessionDatachangeEmailRequest>(
    `changeEmail:${currentEmail}`,
  );

  if (!Session) {
    throw new AppError("There is no change Email request", 400);
  }

  if (Session.step1 !== true || !Session.hashedOtpNewEmail) {
    throw new AppError("Something Wrong try again", 400);
  }

  const isMatch = verifyOtp(otp, Session.hashedOtpNewEmail);

  if (!isMatch) {
    throw new AppError("Invalid or expired OTP", 400);
  }

  await prisma.user.update({
    where: {
      email: currentEmail,
    },
    data: {
      email: Session.newEmail,
      tokenVersion: { increment: 1 },
    },
  });

  await deleteOtpSession(`changeEmail:${currentEmail}`);
};

export const changePhoneService = async (userId: string, phone: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError("User not found", 404);
  const phoneNumber = formatPhoneNumber(phone);
  if (user.phone === phoneNumber) {
    throw new AppError("This phone number is already used by you", 400);
  }
  const existingUser = await prisma.user.findUnique({
    where: {
      phone: phoneNumber,
    },
  });

  if (existingUser) {
    throw new AppError(
      "This phone number is already used by another user",
      400,
    );
  }
  await prisma.user.update({
    where: { id: userId },
    data: { phone: phoneNumber },
  });
};
