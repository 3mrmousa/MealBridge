import jwt from "jsonwebtoken";
import AppError from "../utils/errors/AppError.js";
import asyncHandler from "../utils/errors/asyncHandler.js";
import type { AuthRequest } from "../utils/types/AuthRequest.js";
import type { NextFunction, Response } from "express";
import prisma from "../database/index.js";
import { Role } from "@prisma/client";

interface JWTPayload {
  userId: string;
  tokenVersion: number;
}

export const protect = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.cookies) {
      throw new AppError("You are not logged in!", 401);
    }

    const token = req.cookies.access_token;
    if (!token) {
      throw new AppError("You are not logged in!", 401);
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new AppError("JWT secret is not defined", 500);
    }

    const decodedToken = jwt.verify(token, secret) as JWTPayload;

    if (
      !decodedToken ||
      !decodedToken.userId ||
      decodedToken.tokenVersion === undefined
    ) {
      throw new AppError("Not Authorized", 401);
    }

    const user = await prisma.user.findUnique({
      where: {
        id: decodedToken.userId,
      },
      include: {
        donorProfile: true,
        recipientProfile: true,
        volunteerProfile: true,
      },
    });

    if (!user) {
      throw new AppError("Not Authorized", 401);
    }

    if (user.isBlocked) {
      throw new AppError("Your account has been blocked", 403);
    }

    if (user.tokenVersion !== decodedToken.tokenVersion) {
      throw new AppError("Session expired. Please login again.", 401);
    }

    req.user = user;
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

export const isProfileVerified = () => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    if (req.user.role === Role.ADMIN || req.user.role === Role.MANAGER) {
      return next();
    }

    if (req.user.role === Role.DONOR) {
      if (!req.user.donorProfile) {
        throw new AppError("Profile not completed", 403);
      }
      if (!req.user.donorProfile.verificationStatus) {
        throw new AppError("Profile not verified", 403);
      }
    } else if (req.user.role === Role.RECIPIENT) {
      if (!req.user.recipientProfile) {
        throw new AppError("Profile not completed", 403);
      }
      if (!req.user.recipientProfile.verificationStatus) {
        throw new AppError("Profile not verified", 403);
      }
    } else if (req.user.role === Role.VOLUNTEER) {
      if (!req.user.volunteerProfile) {
        throw new AppError("Profile not completed", 403);
      }
      if (!req.user.volunteerProfile.verificationStatus) {
        throw new AppError("Profile not verified", 403);
      }
    }

    next();
  };
};
