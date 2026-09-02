import type { Request, Response } from "express";
import asyncHandler from "../../utils/errors/asyncHandler.js";
import type { AuthRequest } from "../auth/auth.types.js";
import AppError from "../../utils/errors/AppError.js";
import {
  getUserNotificationsService,
  markNotificationAsReadService,
} from "./notification.service.js";
import type { MarkAsReadInput } from "./notification.zod.js";

export const getUserNotifications = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw new AppError("User is not found", 404);
    }

    const notifications = await getUserNotificationsService(req.user.id);

    res.status(200).json({
      status: "success",
      message: "User notifications fetched successfully",
      data: notifications,
    });
  },
);

export const markAsRead = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw new AppError("User is not found", 404);
    }

    const { notificationId } = req.params as MarkAsReadInput;

    await markNotificationAsReadService(req.user.id, notificationId);

    res.status(200).json({
      status: "success",
    });
  },
);
