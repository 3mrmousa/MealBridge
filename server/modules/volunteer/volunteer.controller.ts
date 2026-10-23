import type { Response } from "express";
import asyncHandler from "../../utils/errors/asyncHandler.js";
import type { AuthRequest } from "../../utils/types/AuthRequest.js";
import {
  acceptDeliveryRequestService,
  completeDeliveryService,
  emergencyCancelDeliveryService,
  getAllDeliveriesService,
  getDeliveryRequestsService,
  pickupDeliveryService,
  rejectDeliveryRequestService,
  singleDeliveryService,
} from "./volunteer.service.js";
import type {
  GetAllDeliveriesQuery,
  GetDeliveryRequestsQuery,
  SingleIdRequestParams,
} from "./volunteer.zod.js";

// Delivery Routes (Volunteer Perspective)

export const getAllDeliveries = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const volunteerId = req.user!.volunteerProfile!.id;
    const { sortBy, sortOrder, status, limit, page } =
      req.query as unknown as GetAllDeliveriesQuery;

    const result = await getAllDeliveriesService(volunteerId!, {
      sortBy,
      sortOrder,
      status,
      limit,
      page,
    });

    res.status(200).json({
      success: true,
      message: "Deliveries fetched successfully",
      data: result.deliveries,
      pagination: result.pagination,
    });
  },
);

export const singleDelivery = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const volunteerId = req.user!.volunteerProfile!.id;
    const { id } = req.params as SingleIdRequestParams;

    const delivery = await singleDeliveryService(id, volunteerId!);

    res.status(200).json({
      success: true,
      message: "Delivery fetched successfully",
      data: delivery,
    });
  },
);

export const getDeliveryRequests = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const volunteerId = req.user!.volunteerProfile!.id;
    const { sortBy, sortOrder, status, limit, page } =
      req.query as unknown as GetDeliveryRequestsQuery;

    const result = await getDeliveryRequestsService(volunteerId!, {
      sortBy,
      sortOrder,
      status,
      limit,
      page,
    });

    res.status(200).json({
      success: true,
      message: "Delivery requests fetched successfully",
      data: result.requests,
      pagination: result.pagination,
    });
  },
);

export const acceptDeliveryRequest = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const volunteerId = req.user!.volunteerProfile!.id;
    const { id } = req.params as SingleIdRequestParams;

    await acceptDeliveryRequestService(id, volunteerId!);

    res.status(200).json({
      success: true,
      message: "Delivery request accepted successfully",
    });
  },
);

export const rejectDeliveryRequest = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const volunteerId = req.user!.volunteerProfile!.id;
    const { id } = req.params as SingleIdRequestParams;

    await rejectDeliveryRequestService(id, volunteerId!);

    res.status(200).json({
      success: true,
      message: "Delivery request rejected successfully",
    });
  },
);

export const completeDelivery = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const volunteerId = req.user!.volunteerProfile!.id;
    const { id } = req.params as SingleIdRequestParams;

    await completeDeliveryService(id, volunteerId!);

    res.status(200).json({
      success: true,
      message: "Delivery completed successfully",
    });
  },
);

export const emergencyCancelDelivery = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const volunteerId = req.user!.volunteerProfile!.id;
    const { id } = req.params as SingleIdRequestParams;

    await emergencyCancelDeliveryService(id, volunteerId!);

    res.status(200).json({
      success: true,
      message: "Delivery cancelled successfully",
    });
  },
);

export const cancelDelivery = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const volunteerId = req.user!.volunteerProfile!.id;
    const { id } = req.params as SingleIdRequestParams;
    const { reason } = req.body as { reason?: string };
    await emergencyCancelDeliveryService(id, volunteerId!, reason);

    res.status(200).json({
      success: true,
      message: "Emergency delivery cancellation submitted successfully",
    });
  },
);

export const pickupDelivery = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const volunteerId = req.user!.volunteerProfile!.id;
    const { id } = req.params as SingleIdRequestParams;

    const delivery = await pickupDeliveryService(volunteerId!, id);

    res.status(200).json({
      success: true,
      message: "Delivery marked as picked up successfully",
      data: delivery,
    });
  },
);
