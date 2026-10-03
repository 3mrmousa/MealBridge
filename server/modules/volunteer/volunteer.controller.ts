import type { Response } from "express";
import asyncHandler from "../../utils/errors/asyncHandler.js";
import type { AuthRequest } from "../auth/auth.types.js";
import {
  acceptPickupRequestService,
  getAllPickupRequestsService,
  rejectPickupRequestService,
  singlePickupRequestService,
} from "./volunteer.service.js";
import type {
  GetAllPickupRequestsQuery,
  SingleIdRequestParams,
} from "./volunteer.zod.js";

// Pickup Routes (Volunteer Perspective)

export const getAllPickupRequests = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { sortBy, sortOrder, status, limit, page } =
      req.query as GetAllPickupRequestsQuery;

    const result = await getAllPickupRequestsService(userId, {
      sortBy,
      sortOrder,
      status,
      limit,
      page,
    });

    res.status(200).json({
      success: true,
      message: "Pickup requests fetched successfully",
      data: result.pickupRequests,
      pagination: result.pagination,
    });
  },
);

export const singlePickupRequest = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params as SingleIdRequestParams;

    const pickupRequest = await singlePickupRequestService(id, userId);

    res.status(200).json({
      success: true,
      message: "Pickup request fetched successfully",
      data: pickupRequest,
    });
  },
);

export const acceptPickupRequest = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params as SingleIdRequestParams;

    await acceptPickupRequestService(id, userId);

    res.status(200).json({
      success: true,
      message: "Pickup request accepted successfully",
    });
  },
);

export const rejectPickupRequest = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params as SingleIdRequestParams;

    await rejectPickupRequestService(id, userId);

    res.status(200).json({
      success: true,
      message: "Pickup request rejected successfully",
    });
  },
);
