import { Router } from "express";
import {
  AcceptUserVerificationStatus,
  RejectUserVerificationStatus,
  getAllUsers,
  getSingleUserById,
  getAllUsersWithProfile,
  toggleUserBlockStatus,
  toggleUserUnblockStatus,
  getAllManager,
  createManager,
  updateManager,
  deleteManager,
} from "./admin.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  getSingleUserByIdSchema,
  userAcceptVerificationStatusSchema,
  userRejectVerificationStatusSchema,
  toggleUserBlockStatusSchema,
  createManagerSchema,
  toggleUserUnBlockStatusSchema,
  updateManagerSchema,
  deleteManagerSchema,
} from "./admin.zod.js";
import { authorizeRoles, protect } from "../../middlewares/auth.middleware.js";
import { Role } from "@prisma/client";

const adminRouter = Router();

// Admin routes

adminRouter.use(protect);

adminRouter.get("/user", authorizeRoles(Role.ADMIN, Role.MANAGER), getAllUsers);
adminRouter.get(
  "/user/with-profile",
  authorizeRoles(Role.ADMIN, Role.MANAGER),
  getAllUsersWithProfile,
);
adminRouter.get(
  "/user/:id",
  authorizeRoles(Role.ADMIN, Role.MANAGER),
  validate(getSingleUserByIdSchema),
  getSingleUserById,
);

adminRouter.patch(
  "/user/:id/verify/accept",
  authorizeRoles(Role.ADMIN, Role.MANAGER),
  validate(userAcceptVerificationStatusSchema),
  AcceptUserVerificationStatus,
);
adminRouter.patch(
  "/user/:id/verify/reject",
  authorizeRoles(Role.ADMIN, Role.MANAGER),
  validate(userRejectVerificationStatusSchema),
  RejectUserVerificationStatus,
);

adminRouter.patch(
  "/user/:id/block",
  authorizeRoles(Role.ADMIN, Role.MANAGER),
  validate(toggleUserBlockStatusSchema),
  toggleUserBlockStatus,
);
adminRouter.patch(
  "/user/:id/unblock",
  authorizeRoles(Role.ADMIN),
  validate(toggleUserUnBlockStatusSchema),
  toggleUserUnblockStatus,
);

adminRouter.get("/manager", authorizeRoles(Role.ADMIN), getAllManager);
adminRouter.post(
  "/manager",
  validate(createManagerSchema),
  authorizeRoles(Role.ADMIN),
  createManager,
);
adminRouter.patch(
  "/manager/:id",
  validate(updateManagerSchema),
  authorizeRoles(Role.ADMIN),
  updateManager,
);
adminRouter.delete(
  "/manager/:id",
  validate(deleteManagerSchema),
  authorizeRoles(Role.ADMIN),
  deleteManager,
);

export default adminRouter;
