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
  CancelClaimBody,
  CreateDeliveryRequestBody,
  GetDeliveryRequestsQuery,
  GetVolunteersQuery,
  GetVolunteerByIdParams,
  GetSingleDeliveryRequestParams,
  CancelDeliveryRequestParams,
  GetDeliveriesQuery,
  GetSingleDeliveryParams,
  CancelDeliveryParams,
  CancelDeliveryBody,
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
  getSingleDeliveryRequestService,
  cancelDeliveryRequestService,
  getDeliveriesService,
  getSingleDeliveriesService,
  markDeliveryAsReceivedService,
  cancelDeliveryService,
  isDonationClaimHasDeliveryService,
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
      message,
      deliveryAddress,
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
    const { reason } = req.body as CancelClaimBody;
    await cancelClaimService(recipientId, id, reason);
    res.status(200).json({
      status: "success",
      message: "Claim cancelled successfully",
    });
  },
);

// Delivery & Volunteer Controllers

export const getAllVolunteers = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { limit, page, sortBy, sortOrder } = req.query as GetVolunteersQuery;
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

export const getDeliveryRequests = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const recipientId = req.user!.id;
    const { limit, page, sortBy, sortOrder } =
      req.query as GetDeliveryRequestsQuery;

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

export const getSingleDeliveryRequest = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const recipientId = req.user!.id;
    const { id } = req.params as GetSingleDeliveryRequestParams;

    const request = await getSingleDeliveryRequestService(recipientId, id);

    res.status(200).json({
      status: "success",
      message: "Delivery request fetched successfully",
      data: request,
    });
  },
);

export const createDeliveryRequest = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const recipientId = req.user!.id;
    const { donationClaimId, volunteerId, notes } =
      req.body as CreateDeliveryRequestBody;

    await createDeliveryRequestService(
      recipientId,
      donationClaimId,
      volunteerId,
      notes,
    );

    res.status(201).json({
      status: "success",
      message: "Delivery request created successfully",
    });
  },
);

export const cancelDeliveryRequest = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const recipientId = req.user!.id;
    const { id } = req.params as CancelDeliveryRequestParams;
    await cancelDeliveryRequestService(recipientId, id);
    res.status(200).json({
      status: "success",
      message: "Delivery request cancelled successfully",
    });
  },
);

export const getDeliveries = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { limit, page, sortBy, sortOrder, status } =
      req.query as GetDeliveriesQuery;
    const result = await getDeliveriesService(req.user!.id, {
      limit,
      page,
      sortBy,
      sortOrder,
      status,
    });
    res.status(200).json({
      status: "success",
      message: "Deliveries fetched successfully",
      data: result.deliveries,
      pagination: result.pagination,
    });
  },
);

export const getSingleDeliveries = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params as GetSingleDeliveryParams;
    const delivery = await getSingleDeliveriesService(req.user!.id, id);
    res.status(200).json({
      status: "success",
      message: "Delivery fetched successfully",
      data: delivery,
    });
  },
);

export const isDonationClaimHasDelivery = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const recipientId = req.user!.id;
    const { id } = req.params as GetSingleDeliveryParams;
    const result = await isDonationClaimHasDeliveryService(recipientId, id);
    res.status(200).json({
      status: "success",
      message: "Donation claim has delivery fetched successfully",
      data: result,
    });
  },
);

export const markDeliveryAsReceived = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const recipientId = req.user!.id;
    const { id } = req.params as GetSingleDeliveryParams;
    await markDeliveryAsReceivedService(recipientId, id);
    res.status(200).json({
      status: "success",
      message: "Delivery marked as received successfully",
    });
  },
);

export const cancelDelivery = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const recipientId = req.user!.id;
    const { id } = req.params as CancelDeliveryParams;
    const { reason } = req.body as CancelDeliveryBody;
    await cancelDeliveryService(recipientId, id, reason);
    res.status(200).json({
      status: "success",
      message: "Delivery cancelled successfully",
    });
  },
);
