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
import type { Role } from "../auth/auth.types.js";
import {
  comparePassword,
  hashPassword,
} from "../../utils/password/passwordFunctions.js";
import {
  deleteOtpSession,
  getOtpSession,
  setOtpSession,
} from "../../utils/otp/otp.redis.js";
import type { OtpSessionDatachangeEmailRequest } from "./user.otp.store.js";
import { generateOtp, verifyOtp } from "../../utils/otp/generateOtp.js";
import { sendChangeEmailOtpMail } from "../../utils/mail/email.service.js";

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
  if (role === "DONOR")
    currentPic = existingProfile?.donorProfile?.profilePicture;
  if (role === "RECIPIENT")
    currentPic = existingProfile?.recipientProfile?.profilePicture;
  if (role === "VOLUNTEER")
    currentPic = existingProfile?.volunteerProfile?.profilePicture;

  if (
    currentPic &&
    currentPic.public_id &&
    currentPic.public_id === public_id
  ) {
    await deleteFromCloudinary(public_id);
  } else {
    throw new AppError("Profile picture not found", 404);
  }

  if (role === "DONOR") {
    await prisma.donorProfile.update({
      where: { userId },
      data: { profilePicture: Prisma.DbNull },
    });
  } else if (role === "RECIPIENT") {
    await prisma.recipientProfile.update({
      where: { userId },
      data: { profilePicture: Prisma.DbNull },
    });
  } else if (role === "VOLUNTEER") {
    await prisma.volunteerProfile.update({
      where: { userId },
      data: { profilePicture: Prisma.DbNull },
    });
  } else {
    throw new AppError("Invalid role for profile picture deletion", 400);
  }
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
  if (role === "DONOR")
    currentDocs = existingProfile?.donorProfile?.verificationDocuments;
  if (role === "RECIPIENT")
    currentDocs = existingProfile?.recipientProfile?.verificationDocuments;
  if (role === "VOLUNTEER")
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
      secure_url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    };
  });

  const newVerificationDocuments = await Promise.all(uploadPromises);

  const updatedVerificationDocuments = [
    ...existingDocs,
    ...newVerificationDocuments,
  ];

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

export const deleteVerificationDocumentService = async (
  userId: string,
  role: Role,
  public_id: string,
) => {
  if (role !== "DONOR" && role !== "RECIPIENT" && role !== "VOLUNTEER") {
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
  if (role === "DONOR")
    currentDocs = existingProfile?.donorProfile?.verificationDocuments;
  if (role === "RECIPIENT")
    currentDocs = existingProfile?.recipientProfile?.verificationDocuments;
  if (role === "VOLUNTEER")
    currentDocs = existingProfile?.volunteerProfile?.verificationDocuments;

  if (!currentDocs || currentDocs.length === 0 || !Array.isArray(currentDocs)) {
    throw new AppError("No verification documents found", 404);
  }

  const filteredDocs = currentDocs.filter(
    (doc: { secure_url: string; public_id: string }) =>
      doc.public_id !== public_id,
  );

  if (filteredDocs.length === currentDocs.length) {
    throw new AppError("Document not found", 404);
  }

  await deleteFromCloudinary(public_id);

  if (role === "DONOR") {
    await prisma.donorProfile.update({
      where: { userId },
      data: { verificationDocuments: filteredDocs },
    });
  } else if (role === "RECIPIENT") {
    await prisma.recipientProfile.update({
      where: { userId },
      data: { verificationDocuments: filteredDocs },
    });
  } else if (role === "VOLUNTEER") {
    await prisma.volunteerProfile.update({
      where: { userId },
      data: { verificationDocuments: filteredDocs },
    });
  }
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

  const hashedPassword = await hashPassword(newPassword);

  if (user.passwordHash === hashedPassword) {
    throw new AppError("New password is same as current password", 400);
  }

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: hashedPassword },
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
    },
  });

  await deleteOtpSession(`changeEmail:${currentEmail}`);
};

export const changePhoneService = async (userId: string, phone: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError("User not found", 404);
  const phoneNumber = phone?.startsWith("+20")
    ? phone
    : phone?.startsWith("20")
      ? `+${phone}`
      : phone?.startsWith("0")
        ? `+2${phone}`
        : `+20${phone}`;
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
