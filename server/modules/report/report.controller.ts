import type { Response, Request } from "express";
import asyncHandler from "../../utils/errors/asyncHandler.js";
import type { AuthRequest } from "../auth/auth.types.js";

export const createReport = asyncHandler(
  async (req: AuthRequest, res: Response) => {},
);
export const getAllReports = asyncHandler(
  async (req: Request, res: Response) => {},
);
export const getSingleReport = asyncHandler(
  async (req: Request, res: Response) => {},
);
export const deleteReport = asyncHandler(
  async (req: AuthRequest, res: Response) => {},
);
export const handleReport = asyncHandler(
  async (req: AuthRequest, res: Response) => {},
);
