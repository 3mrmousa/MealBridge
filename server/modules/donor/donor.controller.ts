import type { Response } from "express";
import asyncHandler from "../../utils/errors/asyncHandler.js";
import type { AuthRequest } from "../auth/auth.types.js";
import {
  addPicsToDonationService,
  createDonationService,
  cancelDonationService,
  getDonationByIdService,
  getMyDonationsService,
  removePicFromDonationService,
  updateDonationService,
  getDonorDonationRequestsService,
  getDonorDonationRequestService,
  acceptDonationRequestService,
  rejectDonationRequestService,
  getAllDonationClaimsService,
  getSingleDonationClaimService,
} from "./donor.service.js";
import type {
  CreateDonationBody,
  GetDonationByIdParams,
  GetMyDonationsQuery,
  UpdateDonationParams,
  UpdateDonationBody,
  OnlyIdParamParams,
  GetDonationRequestsParams,
  GetDonationRequestsQuery,
  GetSingleDonationRequestParams,
  AcceptRequestParams,
  RejectRequestParams,
  GetAllDonationClaimsParams,
  GetAllDonationClaimsQuery,
  GetSingleDonationClaimParams,
} from "./donor.zod.js";
import AppError from "../../utils/errors/AppError.js";

export const getMyDonations = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { page, limit, status, sortBy, sortOrder } =
      req.query as GetMyDonationsQuery;
    const result = await getMyDonationsService(userId!, {
      page,
      limit,
      status,
      sortBy,
      sortOrder,
    });
    res.status(200).json({
      status: "success",
      message: "Donations fetched successfully",
      data: result.donations,
      pagination: result.pagination,
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
      pickupAddress,
      availableFrom,
      availableUntil,
    } = req.body as CreateDonationBody;
    const files = req.files as { [fileName: string]: Express.Multer.File[] };
    const donationPictures = files["donationPicture"];

    if (!donationPictures || donationPictures.length === 0) {
      throw new AppError("Please upload at least one donation picture", 400);
    }

    if (donationPictures.length > 5) {
      throw new AppError("Please upload at most 5 donation pictures", 400);
    }

    await createDonationService(
      userId!,
      {
        title,
        description,
        foodType,
        quantity,
        unit,
        pickupAddress,
        availableFrom,
        availableUntil,
      },
      donationPictures,
    );

    res.status(201).json({
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
      pickupAddress,
      availableFrom,
      availableUntil,
    } = req.body as UpdateDonationBody;
    await updateDonationService(userId!, donationId, {
      title,
      description,
      foodType,
      quantity,
      unit,
      pickupAddress,
      availableFrom,
      availableUntil,
    });
    res.status(200).json({
      status: "success",
      message: "Donation updated successfully",
    });
  },
);

export const addPicsToDonation = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { id: donationId } = req.params as OnlyIdParamParams;
    const files = req.files as { [fileName: string]: Express.Multer.File[] };
    const donationPictures = files["donationPicture"];
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

export const cancelDonation = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { id: donationId } = req.params as OnlyIdParamParams;
    await cancelDonationService(userId!, donationId);
    res.status(200).json({
      status: "success",
      message: "Donation cancelled successfully",
    });
  },
);

export const getDonorDonationRequests = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { id: donationId } = req.params as GetDonationRequestsParams;
    const { limit, page, status, sortBy, sortOrder } =
      req.query as GetDonationRequestsQuery;

    const result = await getDonorDonationRequestsService(userId!, donationId, {
      limit,
      page,
      status,
      sortBy,
      sortOrder,
    });

    res.status(200).json({
      status: "success",
      message: "Donation requests fetched successfully",
      data: result.requests,
      pagination: result.pagination,
    });
  },
);

export const getDonorDonationRequest = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { id: donationId, reqId } =
      req.params as GetSingleDonationRequestParams;

    const request = await getDonorDonationRequestService(
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
    const { id: donationId, reqId } = req.params as AcceptRequestParams;

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
    const { id: donationId, reqId } = req.params as RejectRequestParams;

    await rejectDonationRequestService(userId!, donationId, reqId);

    res.status(200).json({
      status: "success",
      message: "Donation request rejected successfully",
    });
  },
);

export const getAllDonationClaims = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params as GetAllDonationClaimsParams;
    const { page, limit, sortBy, pickupMethod, sortOrder, status } =
      req.query as GetAllDonationClaimsQuery;

    const result = await getAllDonationClaimsService(userId, id, {
      sortBy,
      page,
      limit,
      pickupMethod,
      sortOrder,
      status,
    });

    res.status(200).json({
      status: "success",
      message: "Donation claims fetched successfully",
      data: result.claims,
      pagination: result.pagination,
    });
  },
);

export const getSingleDonationClaim = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { id, claimId } = req.params as GetSingleDonationClaimParams;

    const claim = await getSingleDonationClaimService(userId, id, claimId);

    res.status(200).json({
      status: "success",
      message: "Donation claim fetched successfully",
      data: claim,
    });
  },
);
