import prisma from "../../database/index.js";
import AppError from "../../utils/errors/AppError.js";
import {
  sendVerificationStatusChangeMail,
  sendBlockStatusChangeMail,
  sendWelcomeMail,
} from "../../utils/mail/email.service.js";
import { hashPassword } from "../../utils/password/passwordFunctions.js";
import { formatPhoneNumber } from "../../utils/phoneNumber/formatPhoneNumber.js";
import { Role } from "@prisma/client";
import { createNotificationService } from "../notification/notification.service.js";
import { userOnly, userWithProfiles } from "../../database/selectors.js";

export const getAllUsersService = async () => {
  const users = await prisma.user.findMany({ select: userOnly });

  return users;
};

export const getAllUsersWithProfileService = async () => {
  const users = await prisma.user.findMany({
    select: userWithProfiles,
  });

  const donors = users.filter((user) => user.role === "DONOR");
  const recipients = users.filter((user) => user.role === "RECIPIENT");
  const volunteers = users.filter((user) => user.role === "VOLUNTEER");

  return { donors, recipients, volunteers };
};

export const getSingleUserByIdService = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: userWithProfiles,
  });

  return user;
};

export const AcceptUserVerificationStatusService = async (
  id: string,
  role: Role,
) => {
  if (role === Role.ADMIN || role === Role.MANAGER) {
    throw new AppError(
      "You are an admin or manager, you cannot be verified",
      400,
    );
  }

  const user = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`
      SELECT id FROM "users"
      WHERE id = ${id}::uuid
      FOR UPDATE
    `;

    const user = await tx.user.findUnique({
      where: { id },
      include: {
        donorProfile: role === Role.DONOR,
        recipientProfile: role === Role.RECIPIENT,
        volunteerProfile: role === Role.VOLUNTEER,
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (role === Role.DONOR) {
      if (!user.donorProfile) throw new AppError("User has no profile", 404);
      await tx.donorProfile.update({
        where: { userId: id },
        data: { verificationStatus: true },
      });
    } else if (role === Role.RECIPIENT) {
      if (!user.recipientProfile) throw new AppError("User has no profile", 404);
      await tx.recipientProfile.update({
        where: { userId: id },
        data: { verificationStatus: true },
      });
    } else if (role === Role.VOLUNTEER) {
      if (!user.volunteerProfile) throw new AppError("User has no profile", 404);
      await tx.volunteerProfile.update({
        where: { userId: id },
        data: { verificationStatus: true },
      });
    }

    return user;
  });

  await sendVerificationStatusChangeMail(
    user.email,
    "Accepted",
    role,
    "Your verification docs has been accepted",
  );

  await createNotificationService(
    user.id,
    "Verification Accepted",
    "Your verification docs has been accepted",
  );
};

export const RejectUserVerificationStatusService = async (
  id: string,
  role: Role,
  rejectionReason?: string,
) => {
  if (role === Role.ADMIN || role === Role.MANAGER) {
    throw new AppError(
      "You are an admin or manager, you cannot be verified",
      400,
    );
  }

  const user = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`
      SELECT id FROM "users"
      WHERE id = ${id}::uuid
      FOR UPDATE
    `;

    const user = await tx.user.findUnique({
      where: { id },
      include: {
        donorProfile: role === Role.DONOR,
        recipientProfile: role === Role.RECIPIENT,
        volunteerProfile: role === Role.VOLUNTEER,
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (role === Role.DONOR) {
      if (!user.donorProfile) throw new AppError("User has no profile", 404);
      await tx.donorProfile.update({
        where: { userId: id },
        data: { verificationStatus: false },
      });
    } else if (role === Role.RECIPIENT) {
      if (!user.recipientProfile) throw new AppError("User has no profile", 404);
      await tx.recipientProfile.update({
        where: { userId: id },
        data: { verificationStatus: false },
      });
    } else if (role === Role.VOLUNTEER) {
      if (!user.volunteerProfile) throw new AppError("User has no profile", 404);
      await tx.volunteerProfile.update({
        where: { userId: id },
        data: { verificationStatus: false },
      });
    }

    return user;
  });

  await sendVerificationStatusChangeMail(
    user.email,
    "Rejected",
    role,
    rejectionReason || "Your verification docs is rejected",
  );

  await createNotificationService(
    user.id,
    "Verification Rejected",
    rejectionReason || "Your verification docs has been rejected",
  );
};

export const blockUserService = async (
  blockedId: string,
  blockerId: string,
  blockerRole: Role,
  reason: string,
  message: string,
) => {
  if (blockerRole !== "ADMIN" && blockerRole !== "MANAGER") {
    throw new AppError("You are not authorized to perform this action", 403);
  }
  const user = await prisma.user.findUnique({
    where: { id: blockedId },
  });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const userBlockStatus = await prisma.blockedUser.findUnique({
    where: { blockedId },
  });

  if (userBlockStatus) {
    throw new AppError("User is already blocked", 400);
  }

  if (user.role === "ADMIN") {
    throw new AppError("You are an admin, you cannot be blocked", 400);
  }

  if (blockerRole === "MANAGER" && user.role === "MANAGER") {
    throw new AppError(
      "Manager cannot block manager, please contact admin",
      400,
    );
  }

  await prisma.blockedUser.create({
    data: {
      blockedId,
      blockerId,
      reason,
      message,
    },
  });

  await prisma.user.update({
    where: { id: blockedId },
    data: { isBlocked: true },
  });

  await sendBlockStatusChangeMail(user.email, "Blocked", message);
};

export const unBlockUserService = async (
  blockedId: string,
  blockerRole: Role,
  message: string,
) => {
  if (blockerRole !== "ADMIN" && blockerRole !== "MANAGER") {
    throw new AppError("You are not authorized to perform this action", 403);
  }
  const user = await prisma.user.findUnique({
    where: { id: blockedId },
  });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const userBlockStatus = await prisma.blockedUser.findUnique({
    where: { blockedId },
  });

  if (!userBlockStatus) {
    throw new AppError("User is not blocked", 400);
  }

  await prisma.blockedUser.delete({
    where: { blockedId },
  });

  await prisma.user.update({
    where: { id: blockedId },
    data: { isBlocked: false },
  });

  await sendBlockStatusChangeMail(user.email, "Unblocked", message);

  await createNotificationService(blockedId, "Unblocked", message);
};

export const getAllManagerService = async () => {
  const users = await prisma.user.findMany({
    where: { role: "MANAGER" },
    select: userOnly,
  });

  return users;
};

export const createManagerService = async (
  name: string,
  email: string,
  phone: string,
  password: string,
) => {
  const formattedPhone = formatPhoneNumber(phone);

  const userExistByEmail = await prisma.user.findUnique({
    where: { email },
  });
  if (userExistByEmail) {
    throw new AppError("Email already exists", 400);
  }
  const userExistByPhone = await prisma.user.findUnique({
    where: { phone: formattedPhone },
  });
  if (userExistByPhone) {
    throw new AppError("Phone number already exists", 400);
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone: formattedPhone,
      passwordHash: hashedPassword,
      role: "MANAGER",
      isBlocked: false,
      isEmailVerified: true,
    },
  });

  await sendWelcomeMail(user.email, user.name, "Manager");
};

export const updateManagerService = async (
  id: string,
  name?: string,
  email?: string,
  phone?: string,
  password?: string,
) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const updatedUser: Record<string, unknown> = {};

  if (name) updatedUser.name = name;
  if (email) updatedUser.email = email;
  if (phone) updatedUser.phone = phone;
  if (password) updatedUser.passwordHash = await hashPassword(password);

  await prisma.user.update({
    where: { id },
    data: updatedUser,
  });
};

export const deleteManagerService = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.role !== "MANAGER") {
    throw new AppError("User is not a manager", 400);
  }

  await prisma.user.delete({
    where: { id },
  });
};
