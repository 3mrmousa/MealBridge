import type { Response } from "express";
import asyncHandler from "../../utils/errors/asyncHandler.js";
import type { AuthRequest } from "../auth/auth.types.js";
import {
  acceptDonationRequestService,
  addPicsToDonationService,
  createDonationService,
  deleteDonationService,
  getAllDonationRequestsService,
  getDonationByIdService,
  getMyDonationsService,
  getSingleDonationRequestsService,
  rejectDonationRequestService,
  removePicFromDonationService,
  updateDonationService,
} from "./donor.service.js";
import type {
  CreateDonationBody,
  GetDonationByIdParams,
  GetMyDonationsQuery,
  UpdateDonationParams,
  UpdateDonationBody,
  OnlyIdParamParams,
  IdWithPangitinationRequestsParams,
  IdWithPangitinationRequestsQuery,
  IdWithPangitinationSingleRequestParams,
  AcceptRequestParams,
  RejectRequestParams,
} from "./donor.zod.js";
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
      expirationDate,
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
        expirationDate,
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
      expirationDate,
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
      expirationDate,
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

// Requests by recipient

export const getAllDonationRequests = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { id: donationId } = req.params as IdWithPangitinationRequestsParams;
    const { limit, page } = req.query as IdWithPangitinationRequestsQuery;

    const requests = await getAllDonationRequestsService(
      userId!,
      donationId,
      limit,
      page,
    );

    res.status(200).json({
      status: "success",
      message: "Donation requests fetched successfully",
      data: requests,
    });
  },
);

export const getSingleDonationRequest = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { id: donationId, reqId } =
      req.params as IdWithPangitinationSingleRequestParams;

    const request = await getSingleDonationRequestsService(
      userId!,
      donationId,
      reqId,
    );

    res.status(200).json({
      status: "success",
      message: "Donation request fetched successfully",
      data: request,
    });
  },
);

export const acceptDonationRequest = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { id: donationId, reqId } =
      req.params as AcceptRequestParams;

    await acceptDonationRequestService(userId!, donationId, reqId);

    res.status(200).json({
      status: "success",
      message: "Donation request accepted successfully",
    });
  },
);

export const rejectDonationRequest = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { id: donationId, reqId } =
      req.params as RejectRequestParams;

    await rejectDonationRequestService(userId!, donationId, reqId);

    res.status(200).json({
      status: "success",
      message: "Donation request rejected successfully",
    });
  },
);