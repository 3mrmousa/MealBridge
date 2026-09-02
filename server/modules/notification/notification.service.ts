import prisma from "../../database/index.js";
import AppError from "../../utils/errors/AppError.js";
import { sendNotificationToUser } from "../../utils/socket/socket.js";

export const createNotificationService = async (
  userId: string,
  title: string,
  message: string,
  sourceReportId?: string,
) => {
  if (!userId) {
    throw new AppError("User ID is required", 400);
  }

  if (!title) {
    throw new AppError("Title is required", 400);
  }

  if (!message) {
    throw new AppError("Message is required", 400);
  }

  await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      sourceReportId,
    },
  });

  sendNotificationToUser(userId, "new-notification", {
    userId: userId,
    sourceReportId: sourceReportId,
    title: title,
    message: message,
    isRead: false,
  });
};

export const getUserNotificationsService = async (userId: string) => {
  return await prisma.notification.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const markNotificationAsReadService = async (
  userId: string,
  notificationId: string,
) => {
  return await prisma.notification.update({
    where: {
      id: notificationId,
      userId,
    },
    data: {
      isRead: true,
    },
  });
};
