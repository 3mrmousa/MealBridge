import type { Response } from "express";
import asyncHandler from "../../utils/errors/asyncHandler.js";
import type { AuthRequest } from "../auth/auth.types.js";
import {
  acceptDonationRequestService,
  getAllDonationRequestsService,
  getSingleDonationRequestsService,
  rejectDonationRequestService,
} from "./donationRequest.service.js";
import type {
  GetDonationRequestsParams,
  GetDonationRequestsQuery,
  GetSingleDonationRequestParams,
  AcceptRequestParams,
  RejectRequestParams,
} from "./donationRequest.zod.js";

export const getAllDonationRequests = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { id: donationId } = req.params as GetDonationRequestsParams;
    const { limit, page } = req.query as GetDonationRequestsQuery;

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
      req.params as GetSingleDonationRequestParams;

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
