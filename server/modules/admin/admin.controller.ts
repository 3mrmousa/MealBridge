import type { Response } from "express";
import asyncHandler from "../../utils/errors/asyncHandler.js";
import type { AuthRequest } from "../auth/auth.types.js";
import AppError from "../../utils/errors/AppError.js";
import {
  getAllUsersService,
  getAllUsersWithProfileService,
  getSingleUserByIdService,
  AcceptUserVerificationStatusService,
  blockUserService,
  RejectUserVerificationStatusService,
  unBlockUserService,
  getAllManagerService,
  createManagerService,
  updateManagerService,
  deleteManagerService,
} from "./admin.service.js";
import type {
  getSingleUserByIdInput,
  userAcceptVerificationStatusParams,
  userAcceptVerificationStatusBody,
  userRejectVerificationStatusParams,
  userRejectVerificationStatusBody,
  toggleUserBlockStatusParams,
  toggleUserBlockStatusBody,
  createManagerInput,
  toggleUserUnBlockStatusParams,
  toggleUserUnBlockStatusBody,
  updateManagerParams,
  updateManagerBody,
  deleteManagerInput,
} from "./admin.zod.js";

export const getAllUsers = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const data = await getAllUsersService();
    res.status(200).json({
      status: "success",
      message: "Users fetched successfully.",
      data,
    });
  },
);

export const getAllUsersWithProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const data = await getAllUsersWithProfileService();
    res.status(200).json({
      status: "success",
      message: "Users with profiles fetched successfully.",
      data,
    });
  },
);

export const getSingleUserById = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params as getSingleUserByIdInput;
    const data = await getSingleUserByIdService(id);
    res.status(200).json({
      status: "success",
      message: "User fetched successfully.",
      data,
    });
  },
);

export const AcceptUserVerificationStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params as userAcceptVerificationStatusParams;
    const { role } = req.body as userAcceptVerificationStatusBody;

    if (!role) {
      throw new AppError("Role is required to accept verification status", 400);
    }

    await AcceptUserVerificationStatusService(id, role);
    res.status(200).json({
      status: "success",
      message: "User verification status Accepted successfully.",
    });
  },
);

export const RejectUserVerificationStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params as userRejectVerificationStatusParams;
    const { role, rejectReason } =
      req.body as userRejectVerificationStatusBody;

    if (!role) {
      throw new AppError("Role is required to reject verification status", 400);
    }

    await RejectUserVerificationStatusService(id, role, rejectReason);
    res.status(200).json({
      status: "success",
      message: "User verification status Rejected successfully.",
    });
  },
);

export const toggleUserBlockStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw new AppError("User not found", 404);
    }
    const blockerRole = req.user.role;
    const blockerId = req.user.id;
    const { id: blockedId } = req.params as toggleUserBlockStatusParams;
    const { reason, message } = req.body as toggleUserBlockStatusBody;
    await blockUserService(blockedId, blockerId, blockerRole, reason, message);
    res.status(200).json({
      status: "success",
      message: "User blocked successfully.",
    });
  },
);

export const toggleUserUnblockStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw new AppError("User not found", 404);
    }
    const blockerRole = req.user.role;
    const { id: blockedId } = req.params as toggleUserUnBlockStatusParams;
    const { message } = req.body as toggleUserUnBlockStatusBody;
    await unBlockUserService(blockedId, blockerRole, message);
    res.status(200).json({
      status: "success",
      message: "User unblocked successfully.",
    });
  },
);

export const getAllManager = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const data = await getAllManagerService();
    res.status(200).json({
      status: "success",
      message: "Managers fetched successfully.",
      data,
    });
  },
);

export const createManager = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw new AppError("User not found", 404);
    }
    const { name, email, phone, password } = req.body as createManagerInput;
    const data = await createManagerService(name, email, phone, password);
    res.status(200).json({
      status: "success",
      message: "Manager created successfully.",
      data,
    });
  },
);

export const updateManager = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw new AppError("User not found", 404);
    }
    const { id } = req.params as updateManagerParams;
    const { name, email, phone, password } = req.body as updateManagerBody;
    await updateManagerService(id, name, email, phone, password);
    res.status(200).json({
      status: "success",
      message: "Manager updated successfully.",
    });
  },
);

export const deleteManager = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw new AppError("User not found", 404);
    }
    const { id } = req.params as deleteManagerInput;
    await deleteManagerService(id);
    res.status(200).json({
      status: "success",
      message: "Manager deleted successfully.",
    });
  },
);
