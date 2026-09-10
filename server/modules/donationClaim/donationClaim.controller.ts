import type { Response } from "express";
import asyncHandler from "../../utils/errors/asyncHandler.js";
import type { AuthRequest } from "../auth/auth.types.js";
import {
  getAllDonationClaimsService,
  getSingleDonationClaimService,
} from "./donationClaim.service.js";
import type {
  GetAllDonationClaimsQuery,
  GetAllDonationClaimsParams,
  GetSingleDonationClaimParams,
} from "./donationClaim.zod.js";

export const getAllDonationClaims = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params as GetAllDonationClaimsParams;
    const { page, limit } = req.query as GetAllDonationClaimsQuery;

    const claims = await getAllDonationClaimsService(userId, id, page, limit);

    res.status(200).json({
      status: "success",
      message: "Donation claims fetched successfully",
      data: claims,
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
