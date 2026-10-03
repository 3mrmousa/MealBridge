import type { Request, Response } from "express";
import asyncHandler from "../../utils/errors/asyncHandler.js";
import type { AuthRequest } from "../auth/auth.types.js";
import type {
  CreateDonationRequestBody,
  DeleteDonationRequestParams,
  GetAllDonationsQuery,
  GetDonationByIdParams,
  GetMyDonationRequestByIdParams,
  GetMyDonationRequestsQuery,
  UpdateDonationRequestBody,
  UpdateDonationRequestParams,
  GetClaimsQuery,
  GetClaimByIdParams,
  CancelClaimParams,
} from "./recipient.zod.js";
import {
  getMyDonationRequestByIdService,
  getMyDonationRequestsService,
  createDonationRequestService,
  updateDonationRequestService,
  deleteDonationRequestService,
  getAllDonationsService,
  getDonationByIdService,
  getClaimsService,
  getClaimByIdService,
  cancelClaimService,
} from "./recipient.service.js";

export const getMyDonationRequests = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const recipientId = req.user!.id;
    const { limit, page, status, sortBy, sortOrder } =
      req.query as GetMyDonationRequestsQuery;

    const result = await getMyDonationRequestsService(recipientId, {
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

export const getMyDonationRequestById = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const recipientId = req.user!.id;
    const { id } = req.params as GetMyDonationRequestByIdParams;

    const request = await getMyDonationRequestByIdService(recipientId, id);
    res.status(200).json({
      status: "success",
      message: "Donation request fetched successfully",
      data: request,
    });
  },
);

export const createDonationRequest = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const recipientId = req.user!.id;
    const { donationId, quantityRequested, message } =
      req.body as CreateDonationRequestBody;

    await createDonationRequestService(
      recipientId,
      donationId,
      quantityRequested,
      message,
    );

    res.status(201).json({
      status: "success",
      message: "Donation request created successfully",
    });
  },
);

export const updateDonationRequest = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const recipientId = req.user!.id;
    const { id } = req.params as UpdateDonationRequestParams;
    const { quantityRequested, message } =
      req.body as UpdateDonationRequestBody;

    await updateDonationRequestService(
      recipientId,
      id,
      quantityRequested,
      message,
    );

    res.status(200).json({
      status: "success",
      message: "Donation request created successfully",
    });
  },
);

export const deleteDonationRequest = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const recipientId = req.user!.id;
    const { id } = req.params as DeleteDonationRequestParams;
    await deleteDonationRequestService(recipientId, id);
    res.status(200).json({
      status: "success",
      message: "Donation request deleted successfully",
    });
  },
);

// Donations Routes (Recipient Perspective) Controllers

export const getAllDonations = asyncHandler(
  async (req: Request, res: Response) => {
    const { limit, page, sortBy, sortOrder } =
      req.query as GetAllDonationsQuery;
    const result = await getAllDonationsService({
      limit,
      page,
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
  async (req: Request, res: Response) => {
    const { id } = req.params as GetDonationByIdParams;
    const donation = await getDonationByIdService(id);
    res.status(200).json({
      status: "success",
      message: "Donation fetched successfully",
      data: donation,
    });
  },
);

// Donation Claim Routes (Recipient Perspective) Controllers

export const getClaims = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const recipientId = req.user!.id;
    const { limit, page, status, sortBy, sortOrder } =
      req.query as GetClaimsQuery;

    const result = await getClaimsService(recipientId, {
      limit,
      page,
      status,
      sortBy,
      sortOrder,
    });

    res.status(200).json({
      status: "success",
      message: "Claims fetched successfully",
      data: result.claims,
      pagination: result.pagination,
    });
  },
);

export const getClaimById = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const recipientId = req.user!.id;
    const { id } = req.params as GetClaimByIdParams;

    const claim = await getClaimByIdService(recipientId, id);

    res.status(200).json({
      status: "success",
      message: "Claim fetched successfully",
      data: claim,
    });
  },
);

export const cancelClaim = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const recipientId = req.user!.id;
    const { id } = req.params as CancelClaimParams;
    await cancelClaimService(recipientId, id);
    res.status(200).json({
      status: "success",
      message: "Claim cancelled successfully",
    });
  },
);
