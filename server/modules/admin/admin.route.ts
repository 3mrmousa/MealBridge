import { Router } from "express";
import {
  AcceptUserVerificationStatus,
  RejectUserVerificationStatus,
  getAllUsers,
  getSingleUserById,
  getAllUsersWithProfile,
  toggleUserBlockStatus,
} from "./admin.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  getSingleUserByIdSchema,
  toggleUserVerificationStatusSchema,
  toggleUserBlockStatusSchema,
} from "./admin.zod.js";

const adminRouter = Router();

// Admin routes

adminRouter.get("/users", getAllUsers);
adminRouter.get("/users/with-profile", getAllUsersWithProfile);
adminRouter.get(
  "/users/:id",
  validate(getSingleUserByIdSchema),
  getSingleUserById,
);
adminRouter.patch(
  "/users/:id/verify/accept",
  validate(toggleUserVerificationStatusSchema),
  AcceptUserVerificationStatus,
);
adminRouter.patch(
  "/users/:id/verify/reject",
  validate(toggleUserVerificationStatusSchema),
  RejectUserVerificationStatus,
);
adminRouter.patch(
  "/users/:id/block",
  validate(toggleUserBlockStatusSchema),
  toggleUserBlockStatus,
);

export default adminRouter;
