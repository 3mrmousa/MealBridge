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

adminRouter.get(
  "/users",
  authorizeRoles(Role.ADMIN, Role.MANAGER),
  getAllUsers,
);
adminRouter.get(
  "/users/with-profile",
  authorizeRoles(Role.ADMIN, Role.MANAGER),
  getAllUsersWithProfile,
);
adminRouter.get(
  "/users/:id",
  authorizeRoles(Role.ADMIN, Role.MANAGER),
  validate(getSingleUserByIdSchema),
  getSingleUserById,
);

adminRouter.patch(
  "/users/:id/verify/accept",
  authorizeRoles(Role.ADMIN, Role.MANAGER),
  validate(userAcceptVerificationStatusSchema),
  AcceptUserVerificationStatus,
);
adminRouter.patch(
  "/users/:id/verify/reject",
  authorizeRoles(Role.ADMIN, Role.MANAGER),
  validate(userRejectVerificationStatusSchema),
  RejectUserVerificationStatus,
);

adminRouter.patch(
  "/users/:id/block",
  authorizeRoles(Role.ADMIN, Role.MANAGER),
  validate(toggleUserBlockStatusSchema),
  toggleUserBlockStatus,
);
adminRouter.patch(
  "/users/:id/unblock",
  authorizeRoles(Role.ADMIN),
  validate(toggleUserUnBlockStatusSchema),
  toggleUserUnblockStatus,
);

adminRouter
  .route("/managers")
  .get(authorizeRoles(Role.ADMIN), getAllManager)
  .post(
    validate(createManagerSchema),
    authorizeRoles(Role.ADMIN),
    createManager,
  );

adminRouter
  .route("/managers/:id")
  .patch(
    validate(updateManagerSchema),
    authorizeRoles(Role.ADMIN),
    updateManager,
  )
  .delete(
    validate(deleteManagerSchema),
    authorizeRoles(Role.ADMIN),
    deleteManager,
  );

export default adminRouter;
