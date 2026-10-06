import type { Prisma } from "@prisma/client";
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

  const data: Prisma.NotificationCreateInput = {
    user: {
      connect: {
        id: userId,
      },
    },
    title,
    message,
  };

  if (sourceReportId) {
    data.sourceReport = {
      connect: {
        id: sourceReportId,
      },
    };
  }

  await prisma.notification.create({
    data,
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
    include: {
      sourceReport: true,
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
