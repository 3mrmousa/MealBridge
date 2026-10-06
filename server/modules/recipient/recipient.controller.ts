import type { Request, Response } from "express";
import asyncHandler from "../../utils/errors/asyncHandler.js";
import type { AuthRequest } from "../auth/auth.types.js";
import type {
  CreateDonationRequestBody,
  CancelDonationRequestParams,
  GetAllDonationsQuery,
  GetDonationByIdParams,
  GetMyDonationRequestByIdParams,
  GetMyDonationRequestsQuery,
  UpdateDonationRequestBody,
  UpdateDonationRequestParams,
  GetClaimsQuery,
  GetClaimByIdParams,
  CancelClaimParams,
  CreateDeliveryRequestBody,
  GetDeliveryRequestsQuery,
  GetVolunteersQuery,
  GetVolunteerByIdParams,
} from "./recipient.zod.js";
import {
  getMyDonationRequestByIdService,
  getMyDonationRequestsService,
  createDonationRequestService,
  updateDonationRequestService,
  cancelDonationRequestService,
  getAllDonationsService,
  getDonationByIdService,
  getClaimsService,
  getClaimByIdService,
  cancelClaimService,
  createDeliveryRequestService,
  getDeliveryRequestsService,
  getAllVolunteersService,
  getVolunteerByIdService,
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
    const { donationId, quantityRequested, deliveryAddress, message } =
      req.body as CreateDonationRequestBody;

    await createDonationRequestService(
      recipientId,
      donationId,
      quantityRequested,
      deliveryAddress,
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
    const { quantityRequested, deliveryAddress, message } =
      req.body as UpdateDonationRequestBody;

    await updateDonationRequestService(
      recipientId,
      id,
      quantityRequested,
      deliveryAddress,
      message,
    );

    res.status(200).json({
      status: "success",
      message: "Donation request created successfully",
    });
  },
);

export const cancelDonationRequest = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const recipientId = req.user!.id;
    const { id } = req.params as CancelDonationRequestParams;
    await cancelDonationRequestService(recipientId, id);
    res.status(200).json({
      status: "success",
      message: "Donation request cancelled successfully",
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

// Delivery Request Operations

export const createDeliveryRequest = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const recipientId = req.user!.id;
    // Assuming the route is /delivery-requests with body { donationClaimId, volunteerId, notes }
    const { donationClaimId, volunteerId, notes } = req.body as CreateDeliveryRequestBody;

    const request = await createDeliveryRequestService(recipientId, donationClaimId, volunteerId, notes);

    res.status(201).json({
      status: "success",
      message: "Delivery request created successfully",
      data: request,
    });
  },
);

export const getDeliveryRequests = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const recipientId = req.user!.id;
    const { limit, page, sortBy, sortOrder } = req.query as GetDeliveryRequestsQuery;

    const result = await getDeliveryRequestsService(recipientId, {
      limit,
      page,
      sortBy,
      sortOrder,
    });

    res.status(200).json({
      status: "success",
      message: "Delivery requests fetched successfully",
      data: result.requests,
      pagination: result.pagination,
    });
  },
);

// Volunteer Listing Routes (Recipient Perspective) Controllers

export const getAllVolunteers = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { limit, page, sortBy, sortOrder } =
      req.query as GetVolunteersQuery;
    const result = await getAllVolunteersService({
      limit,
      page,
      sortBy,
      sortOrder,
    });
    res.status(200).json({
      status: "success",
      message: "Volunteers fetched successfully",
      data: result.volunteers,
      pagination: result.pagination,
    });
  },
);

export const getVolunteerById = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params as GetVolunteerByIdParams;
    const volunteer = await getVolunteerByIdService(id);
    res.status(200).json({
      status: "success",
      message: "Volunteer fetched successfully",
      data: volunteer,
    });
  },
);
