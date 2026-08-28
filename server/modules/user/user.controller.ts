import type { Response } from "express";
import asyncHandler from "../../utils/errors/asyncHandler.js";
import type { AuthRequest } from "../auth/auth.types.js";
import AppError from "../../utils/errors/AppError.js";
import {
  getUserProfileService,
  updateDonorProfileService,
  updateRecipientProfileService,
  updateVolunteerProfileService,
  updateProfilePictureService,
  updateVerificationDocumentService,
} from "./user.service.js";
import {
  updateDonorProfileSchema,
  updateRecipientProfileSchema,
  updateVolunteerProfileSchema,
  type DeleteImageInput,
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

export const updateProfilePicture = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const role = req.user?.role;
    const file = req.file;

    if (!userId || !role) {
      throw new AppError("Login or Register First", 404);
    }

    if (!file) {
      throw new AppError("Please upload an image", 400);
    }

    const imageUrl = await updateProfilePictureService(
      userId,
      role,
      file.buffer,
    );

    res.status(200).json({
      success: "success",
      message: "Profile Picture Updated.",
      data: {
        profilePicture: imageUrl,
      },
    });
  },
);

export const deleteProfilePicture = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const role = req.user?.role;
    const { public_id } = req.body as DeleteImageInput;

    if (!userId || !role) {
      throw new AppError("Login or Register First", 404);
    }

    await deleteProfilePictureService(userId, role, public_id);

    res.status(200).json({
      success: "success",
      message: "Profile Picture Deleted.",
    });
  },
);

export const updateVerificationDocument = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId || !role) {
      throw new AppError("Login or Register First", 404);
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const verificationDocs = files["verificationDocument"];

    if (!verificationDocs || verificationDocs.length === 0) {
      throw new AppError(
        "Please upload at least one verification document",
        400,
      );
    }

    if (verificationDocs.length > 5) {
      throw new AppError("Maximum of 5 verification documents allowed", 400);
    }

    const verificationDocuments = await updateVerificationDocumentService(
      userId,
      role,
      verificationDocs,
    );

    res.status(200).json({
      success: "success",
      message: "Verification Documents Updated.",
      data: {
        verificationDocuments,
      },
    });
  },
);

export const deleteVerificationDocument = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const role = req.user?.role;
    const { public_id } = req.body as DeleteImageInput;

    if (!userId || !role) {
      throw new AppError("Login or Register First", 404);
    }

    await deleteVerificationDocumentService(
      userId,
      role,
      public_id,
    );

    res.status(200).json({
      success: "success",
      message: "Verification Document Deleted.",
    });
  },
);
