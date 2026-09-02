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
import { Role } from "../auth/auth.types.js";

const adminRouter = Router();

// Admin routes

adminRouter.use(protect);

adminRouter.get("/user", authorizeRoles(Role.Admin, Role.Manager), getAllUsers);
adminRouter.get(
  "/user/with-profile",
  authorizeRoles(Role.Admin, Role.Manager),
  getAllUsersWithProfile,
);
adminRouter.get(
  "/user/:id",
  authorizeRoles(Role.Admin, Role.Manager),
  validate(getSingleUserByIdSchema),
  getSingleUserById,
);

adminRouter.patch(
  "/user/:id/verify/accept",
  authorizeRoles(Role.Admin, Role.Manager),
  validate(userAcceptVerificationStatusSchema),
  AcceptUserVerificationStatus,
);
adminRouter.patch(
  "/user/:id/verify/reject",
  authorizeRoles(Role.Admin, Role.Manager),
  validate(userRejectVerificationStatusSchema),
  RejectUserVerificationStatus,
);

adminRouter.patch(
  "/user/:id/block",
  authorizeRoles(Role.Admin, Role.Manager),
  validate(toggleUserBlockStatusSchema),
  toggleUserBlockStatus,
);
adminRouter.patch(
  "/user/:id/unblock",
  authorizeRoles(Role.Admin),
  validate(toggleUserUnBlockStatusSchema),
  toggleUserUnblockStatus,
);

adminRouter.get("/manager", authorizeRoles(Role.Admin), getAllManager);
adminRouter.post(
  "/manager",
  validate(createManagerSchema),
  authorizeRoles(Role.Admin),
  createManager,
);
adminRouter.patch(
  "/manager/:id",
  validate(updateManagerSchema),
  authorizeRoles(Role.Admin),
  updateManager,
);
adminRouter.delete(
  "/manager/:id",
  validate(deleteManagerSchema),
  authorizeRoles(Role.Admin),
  deleteManager,
);

export default adminRouter;
