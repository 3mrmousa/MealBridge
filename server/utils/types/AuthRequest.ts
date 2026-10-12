import type { Request } from "express";
import type { Prisma } from "@prisma/client";

export type AuthUser = Prisma.UserGetPayload<{
  include: {
    donorProfile: true;
    recipientProfile: true;
    volunteerProfile: true;
  };
}>;

export interface AuthRequest extends Request {
  user?: AuthUser;
}
