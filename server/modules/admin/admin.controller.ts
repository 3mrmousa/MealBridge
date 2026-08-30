import type { Response } from "express";
import asyncHandler from "../../utils/errors/asyncHandler.js";
import type { AuthRequest, Role } from "../auth/auth.types.js";
import AppError from "../../utils/errors/AppError.js";
import {
  getAllUsersService,
  getAllUsersWithProfileService,
  getSingleUserByIdService,
  AcceptUserVerificationStatusService,
  blockUserService,
  RejectUserVerificationStatusService,
} from "./admin.service.js";
import type {
  GetSingleUserByIdInput,
  toggleUserVerificationStatusInput,
  toggleUserBlockStatusInput,
} from "./admin.zod.js";

export const getAllUsers = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const data = await getAllUsersService();
    res.status(200).json({
      success: "success",
      message: "Users fetched successfully.",
      data,
    });
  },
);

export const getAllUsersWithProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const data = await getAllUsersWithProfileService();
    res.status(200).json({
      success: "success",
      message: "Users with profiles fetched successfully.",
      data,
    });
  },
);

export const getSingleUserById = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params as GetSingleUserByIdInput;
    const data = await getSingleUserByIdService(id);
    res.status(200).json({
      success: "success",
      message: "User fetched successfully.",
      data,
    });
  },
);

export const AcceptUserVerificationStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params as toggleUserVerificationStatusInput;
    const { role } = req.body as toggleUserVerificationStatusInput;

    if (!role) {
      throw new AppError("Role is required to toggle verification status", 400);
    }

    await AcceptUserVerificationStatusService(id, role);
    res.status(200).json({
      success: "success",
      message: "User verification status Accepted successfully.",
    });
  },
);
export const RejectUserVerificationStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params as toggleUserVerificationStatusInput;
    const { role } = req.body as toggleUserVerificationStatusInput;

    if (!role) {
      throw new AppError("Role is required to toggle verification status", 400);
    }

    await RejectUserVerificationStatusService(id, role);
    res.status(200).json({
      success: "success",
      message: "User verification status Rejected successfully.",
    });
  },
);

export const toggleUserBlockStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params as toggleUserBlockStatusInput;
    await blockUserService(id);
    res.status(200).json({
      success: "success",
      message: "User block status toggled successfully.",
    });
  },
);
