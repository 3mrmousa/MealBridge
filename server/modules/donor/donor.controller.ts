import type { Response } from "express";
import asyncHandler from "../../utils/errors/asyncHandler.js";
import type { AuthRequest } from "../auth/auth.types.js";
import {
  createDonationService,
  getDonationByIdService,
  getMyDonationsService,
} from "./donor.service.js";
import type {
  CreateDonationInput,
  GetDonationByIdInput,
  GetMyDonationsInput,
  UpdateDonationParams,
  UpdateDonationBody,
} from "./donor.zod.js";
import AppError from "../../utils/errors/AppError.js";

export const getMyDonations = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { page, limit } = req.query as GetMyDonationsInput;
    const donations = await getMyDonationsService(userId!, page, limit);
    res.status(200).json({
      success: true,
      message: "Donations fetched successfully",
      data: donations,
    });
  },
);

export const getDonationById = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id: donationId } = req.params as GetDonationByIdInput;
    const userId = req.user?.id;
    const donation = await getDonationByIdService(userId!, donationId);
    res.status(200).json({
      success: true,
      message: "Donation fetched successfully",
      data: donation,
    });
  },
);

export const createDonation = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const {
      title,
      description,
      foodType,
      quantity,
      unit,
      address,
      availableFrom,
      availableTo,
      expirationDate,
    } = req.body as CreateDonationInput;
    const files = req.files as { [fileName: string]: Express.Multer.File[] };
    const donationPictures = files["donationPicture"];

    if (!donationPictures || donationPictures.length === 0) {
      throw new AppError("Please upload at least one donation picture", 400);
    }

    await createDonationService(
      userId!,
      {
        title,
        description,
        foodType,
        quantity,
        unit,
        address,
        availableFrom,
        availableTo,
        expirationDate,
      },
      donationPictures,
    );

    res.status(200).json({
      success: true,
      message: "Donation created successfully",
    });
  },
);

export const updateDonation = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { id: donationId } = req.params as UpdateDonationParams;
    const {
      title,
      description,
      foodType,
      quantity,
      unit,
      address,
      availableFrom,
      availableTo,
      expirationDate,
    } = req.body as UpdateDonationBody;
    const files = req.files as {
      [fileName: string]: Express.Multer.File[];
    };
    const donationPictures = files["donationPicture"];
    const donation = await getDonationByIdService(userId!, donationId);
    res.status(200).json({
      success: true,
      message: "Donation fetched successfully",
      data: donation,
    });
  },
);
