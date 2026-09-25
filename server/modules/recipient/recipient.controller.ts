import type { Response } from "express";
import asyncHandler from "../../utils/errors/asyncHandler.js";
import type { AuthRequest } from "../auth/auth.types.js";
import AppError from "../../utils/errors/AppError.js";
import type {
    CreateDonationRequestBody,
  GetMyDonationRequestByIdParams,
  GetMyDonationRequestsQuery,
} from "./recipient.zod.js";
import {
  getMyDonationRequestByIdService,
  getMyDonationRequestsService,
  createDonationService,
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

    await createDonationService(
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

// export const updateDonationRequest = asyncHandler(
//   async (req: AuthRequest, res: Response) => {
//     const recipientId = req.user?.id;
//     const { donationId, quantityRequested, message } =
//       req.body as UpdateDonationRequestBody;

//     if (!recipientId) {
//       throw new AppError("Recipient not found", 404);
//     }
//     await createDonationService(
//       recipientId!,
//       quantityRequested,
//       message,
//     );

//     res.status(200).json({
//       status: "success",
//       message: "Donation request created successfully",
//     });
//   },
// );

export const deleteDonationRequest = asyncHandler(
  async (req: AuthRequest, res: Response) => {},
);
