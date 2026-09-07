import type { Request } from "express";
import type { User } from "@prisma/client";

// Role enum is now imported from @prisma/client (Prisma-generated enum)
// export enum Role {
//   Admin = "ADMIN",
//   Manager = "MANAGER",
//   Donor = "DONOR",
//   Recipient = "RECIPIENT",
//   Volunteer = "VOLUNTEER",
// }

export interface AuthRequest extends Request {
  user?: User;
}
