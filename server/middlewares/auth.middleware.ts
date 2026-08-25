import jwt from "jsonwebtoken";
import AppError from "../utils/errors/AppError.js";
import asyncHandler from "../utils/errors/asyncHandler.js";
import type { AuthRequest, Role } from "../modules/auth/auth.types.js";
import type { NextFunction, Response } from "express";
import prisma from "../database/index.js";

interface JWTPayload {
  userId: string;
}

export const protect = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.cookies?.access_token;
    if (!token) {
      throw new AppError("You are not logged in!", 401);
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new AppError("JWT secret is not defined", 500);
    }

    const decodedToken = jwt.verify(token, secret) as JWTPayload;

    if (!decodedToken || !decodedToken.userId) {
      throw new AppError("Not Authorized", 401);
    }

    const user = await prisma.user.findUnique({
      where: {
        id: decodedToken.userId,
      },
    });

    if (!user) {
      throw new AppError("Not Authorized", 401);
    }

    req.user = user as any;
    return next();
  },
);

export const authorizeRoles = (...roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user!.role)) {
      return next(new AppError("Unauthorized", 403));
    }
    next();
  };
};
