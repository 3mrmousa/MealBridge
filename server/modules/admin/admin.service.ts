import prisma from "../../database/index.js";
import AppError from "../../utils/errors/AppError.js";
import {
  sendVerificationStatusChangeMail,
  sendBlockStatusChangeMail,
  sendWelcomeMail,
} from "../../utils/mail/email.service.js";
import { hashPassword } from "../../utils/password/passwordFunctions.js";
import { formatPhoneNumber } from "../../utils/phoneNumber/formatPhoneNumber.js";
import type { Role } from "../auth/auth.types.js";

export const getAllUsersService = async () => {
  const users = await prisma.user.findMany();

  return users;
};

export const getAllUsersWithProfileService = async () => {
  const users = await prisma.user.findMany({
    include: {
      donorProfile: true,
      recipientProfile: true,
      volunteerProfile: true,
    },
  });

  const donors = users.filter((user) => user.role === "DONOR");
  const recipients = users.filter((user) => user.role === "RECIPIENT");
  const volunteers = users.filter((user) => user.role === "VOLUNTEER");

  return { donors, recipients, volunteers };
};

export const getSingleUserByIdService = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      donorProfile: true,
      recipientProfile: true,
      volunteerProfile: true,
    },
  });

  return user;
};

export const AcceptUserVerificationStatusService = async (
  id: string,
  role: Role,
) => {
  if (role === "ADMIN" || role === "MANAGER") {
    throw new AppError(
      "You are an admin or manager, you cannot be verified",
      400,
    );
  }

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      donorProfile: role === "DONOR",
      recipientProfile: role === "RECIPIENT",
      volunteerProfile: role === "VOLUNTEER",
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (role === "DONOR") {
    if (!user.donorProfile) throw new AppError("User has no profile", 404);
    await prisma.donorProfile.update({
      where: { userId: id },
      data: { verificationStatus: !user.donorProfile.verificationStatus },
    });
  } else if (role === "RECIPIENT") {
    if (!user.recipientProfile) throw new AppError("User has no profile", 404);
    await prisma.recipientProfile.update({
      where: { userId: id },
      data: { verificationStatus: !user.recipientProfile.verificationStatus },
    });
  } else if (role === "VOLUNTEER") {
    if (!user.volunteerProfile) throw new AppError("User has no profile", 404);
    await prisma.volunteerProfile.update({
      where: { userId: id },
      data: { verificationStatus: !user.volunteerProfile.verificationStatus },
    });
  }

  await sendVerificationStatusChangeMail(
    user.email,
    "Accepted",
    role,
    "Your verification docs is accepted",
  );

  // TODO: Send notification to user
};

export const RejectUserVerificationStatusService = async (
  id: string,
  role: Role,
) => {
  if (role === "ADMIN" || role === "MANAGER") {
    throw new AppError(
      "You are an admin or manager, you cannot be verified",
      400,
    );
  }

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      donorProfile: role === "DONOR",
      recipientProfile: role === "RECIPIENT",
      volunteerProfile: role === "VOLUNTEER",
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  await sendVerificationStatusChangeMail(
    user.email,
    "Rejected",
    role,
    "Your verification docs is rejected",
  );

  // TODO: Send notification to user
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

  // TODO: Send notification to user
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

  // TODO: Send notification to user
};

export const getAllManagerService = async () => {
  const users = await prisma.user.findMany({
    where: { role: "MANAGER" },
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

  if (name) user.name = name;
  if (email) user.email = email;
  if (phone) user.phone = phone;
  if (password) user.passwordHash = await hashPassword(password);

  await prisma.user.update({
    where: { id },
    data: user,
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
