import type { Response } from "express";
import asyncHandler from "../../utils/errors/asyncHandler.js";
import type { AuthRequest } from "../auth/auth.types.js";
import AppError from "../../utils/errors/AppError.js";
import {
  getUserProfileService,
  updateDonorProfileService,
  updateRecipientProfileService,
  updateVolunteerProfileService,
} from "./user.service.js";
import {
  updateDonorProfileSchema,
  updateRecipientProfileSchema,
  updateVolunteerProfileSchema,
} from "./user.zod.js";

export const getUserProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Login or Register First", 404);
    }
    const data = await getUserProfileService(userId.toString());

    res.status(200).json({
      success: "success",
      message: "Profile Fetched.",
      data,
    });
  },
);

export const updateProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) {
      throw new AppError("Login or Register First", 404);
    }

    if (role === "DONOR") {
      const {
        name,
        phone,
        organizationName,
        organizationType,
        address,
        verificationDocument,
      } = req.body;
      const validatedData = updateDonorProfileSchema.parse({
        name,
        phone,
        organizationName,
        organizationType,
        address,
        verificationDocument,
      });
      await updateDonorProfileService(userId, validatedData);
    } else if (role === "RECIPIENT") {
      const {
        name,
        phone,
        organizationName,
        organizationType,
        address,
        verificationDocument,
      } = req.body;
      const validatedData = updateRecipientProfileSchema.parse({
        name,
        phone,
        organizationName,
        organizationType,
        address,
        verificationDocument,
      });
      await updateRecipientProfileService(userId, validatedData);
    } else if (role === "VOLUNTEER") {
      const {
        name,
        phone,
        address,
        type,
        transportType,
        availabilityStatus,
        verificationDocument,
      } = req.body;
      const validatedData = updateVolunteerProfileSchema.parse({
        name,
        phone,
        address,
        type,
        transportType,
        availabilityStatus,
        verificationDocument,
      });
      await updateVolunteerProfileService(userId, validatedData);
    } else {
      throw new AppError("You can't edit this type of profile", 401);
    }

    res.status(200).json({
      success: "success",
      message: "Profile Updated.",
    });
  },
);
