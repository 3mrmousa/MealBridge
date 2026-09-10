import type { Response } from "express";
import asyncHandler from "../../utils/errors/asyncHandler.js";
import type { AuthRequest } from "../auth/auth.types.js";
import {
  addPicsToDonationService,
  createDonationService,
  deleteDonationService,
  getDonationByIdService,
  getMyDonationsService,
  removePicFromDonationService,
  updateDonationService,
} from "./donation.service.js";
import type {
  CreateDonationBody,
  GetDonationByIdParams,
  GetMyDonationsQuery,
  UpdateDonationParams,
  UpdateDonationBody,
  OnlyIdParamParams,
} from "./donation.zod.js";
import AppError from "../../utils/errors/AppError.js";

export const getMyDonations = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { page, limit } = req.query as GetMyDonationsQuery;
    const donations = await getMyDonationsService(userId!, page, limit);
    res.status(200).json({
      status: "success",
      message: "Donations fetched successfully",
      data: donations,
    });
  },
);

export const getDonationById = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id: donationId } = req.params as GetDonationByIdParams;
    const userId = req.user!.id;
    const donation = await getDonationByIdService(userId!, donationId);
    res.status(200).json({
      status: "success",
      message: "Donation fetched successfully",
      data: donation,
    });
  },
);

export const createDonation = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const {
      title,
      description,
      foodType,
      quantity,
      unit,
      address,
      availableFrom,
      availableUntil,
    } = req.body as CreateDonationBody;
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
        availableUntil,
      },
      donationPictures,
    );

    res.status(200).json({
      status: "success",
      message: "Donation created successfully",
    });
  },
);

export const updateDonation = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { id: donationId } = req.params as UpdateDonationParams;
    const {
      title,
      description,
      foodType,
      quantity,
      unit,
      address,
      availableFrom,
      availableUntil,
    } = req.body as UpdateDonationBody;
    const donation = await updateDonationService(userId!, {
      id: donationId,
      title,
      description,
      foodType,
      quantity,
      unit,
      address,
      availableFrom,
      availableUntil,
    });
    res.status(200).json({
      status: "success",
      message: "Donation fetched successfully",
      data: donation,
    });
  },
);

export const addPicsToDonation = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { id: donationId } = req.params as OnlyIdParamParams;
    const files = req.files as { [fileName: string]: Express.Multer.File[] };
    const donationPictures = files["donationPictures"];
    if (!donationPictures || donationPictures.length === 0) {
      throw new AppError("Please upload at least one donation picture", 400);
    }
    await addPicsToDonationService(userId!, donationId, donationPictures);
    res.status(200).json({
      status: "success",
      message: "Donation pictures added successfully",
    });
  },
);

export const removePicFromDonation = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { id: donationId } = req.params as OnlyIdParamParams;
    const { publicId } = req.body as { publicId: string };
    if (!publicId) {
      throw new AppError(
        "Please provide the publicId of the picture to remove",
        400,
      );
    }
    await removePicFromDonationService(userId!, donationId, publicId);
    res.status(200).json({
      status: "success",
      message: "Donation picture removed successfully",
    });
  },
);

export const deleteDonation = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { id: donationId } = req.params as OnlyIdParamParams;
    await deleteDonationService(userId!, donationId);
    res.status(200).json({
      status: "success",
      message: "Donation deleted successfully",
    });
  },
);
