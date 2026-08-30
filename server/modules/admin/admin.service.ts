import prisma from "../../database/index.js";
import AppError from "../../utils/errors/AppError.js";
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

  // TODO: Send mail and notification to reject user verification status
};

export const blockUserService = async (id: string) => {
  // TODO: Implement block user logic and mail send for blocked user
};
