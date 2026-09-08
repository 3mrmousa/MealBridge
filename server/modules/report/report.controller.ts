import type { Response, Request } from "express";
import asyncHandler from "../../utils/errors/asyncHandler.js";
import type { AuthRequest } from "../auth/auth.types.js";
import type {
  CreateReportInput,
  HandleReportInput,
  HandleReportParams,
  HandleReportBody,
  SingleReportIdInput,
} from "./report.zod.js";
import {
  createReportService,
  getAllReportsService,
  getSingleReportService,
  handleReportService,
} from "./report.service.js";
import AppError from "../../utils/errors/AppError.js";

export const createReport = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("User is not authenticated", 401);
    }

    const { reportedUserId, title, description } =
      req.body as CreateReportInput;

    await createReportService(userId, title, description, reportedUserId);

    res.status(200).json({
      status: "success",
      message: "Report sent successfully",
    });
  },
);

export const getAllReports = asyncHandler(
  async (req: Request, res: Response) => {
    const reports = await getAllReportsService();

    res.status(200).json({
      status: "success",
      message: "Reports sent successfully",
      data: { reports },
    });
  },
);

export const getSingleReport = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params as SingleReportIdInput;
    const report = await getSingleReportService(id);

    res.status(200).json({
      status: "success",
      message: "Report sent successfully",
      data: { report },
    });
  },
);

export const handleReport = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const reviewerId = req.user!.id;
    const { id } = req.params as HandleReportParams;
    const { status, message } = req.body as HandleReportBody;

    await handleReportService(reviewerId, id, status, message);

    res.status(200).json({
      status: "success",
      message: "Report handled successfully",
    });
  },
);
