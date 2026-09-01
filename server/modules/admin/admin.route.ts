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
  toggleUserVerificationStatusSchema,
  toggleUserBlockStatusSchema,
  createManagerSchema,
  toggleUserUnBlockStatusSchema,
  updateManagerSchema,
  deleteManagerSchema,
} from "./admin.zod.js";
import { protect } from "../../middlewares/auth.middleware.js";

const adminRouter = Router();

// Admin routes

adminRouter.use(protect);

adminRouter.get("/user", getAllUsers);
adminRouter.get("/user/with-profile", getAllUsersWithProfile);
adminRouter.get(
  "/user/:id",
  validate(getSingleUserByIdSchema),
  getSingleUserById,
);

adminRouter.patch(
  "/user/:id/verify/accept",
  validate(toggleUserVerificationStatusSchema),
  AcceptUserVerificationStatus,
);
adminRouter.patch(
  "/user/:id/verify/reject",
  validate(toggleUserVerificationStatusSchema),
  RejectUserVerificationStatus,
);

adminRouter.patch(
  "/user/:id/block",
  validate(toggleUserBlockStatusSchema),
  toggleUserBlockStatus,
);
adminRouter.patch(
  "/user/:id/unblock",
  validate(toggleUserUnBlockStatusSchema),
  toggleUserUnblockStatus,
);

adminRouter.get("/manager", getAllManager);
adminRouter.post("/manager", validate(createManagerSchema), createManager);
adminRouter.patch("/manager/:id", validate(updateManagerSchema) ,updateManager);
adminRouter.delete("/manager/:id", validate(deleteManagerSchema),deleteManager);

export default adminRouter;
