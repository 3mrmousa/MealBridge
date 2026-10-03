import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  acceptPickupRequest,
  getAllPickupRequests,
  rejectPickupRequest,
  singlePickupRequest,
} from "./volunteer.controller.js";
import { authorizeRoles, protect } from "../../middlewares/auth.middleware.js";
import { Role } from "@prisma/client";
import {
  getAllPickupRequestsSchema,
  singleIdRequestSchema,
} from "./volunteer.zod.js";

const volunteerRouter = Router();

volunteerRouter.use(protect);
volunteerRouter.use(authorizeRoles(Role.VOLUNTEER));

// Pickup Routes (Volunteer Perspective)

volunteerRouter.get(
  "/",
  validate(getAllPickupRequestsSchema),
  getAllPickupRequests,
);

volunteerRouter
  .route("/:id")
  .get(validate(singleIdRequestSchema), singlePickupRequest);

volunteerRouter.patch(
  "/:id/accept",
  validate(singleIdRequestSchema),
  acceptPickupRequest,
);

volunteerRouter.patch(
  "/:id/reject",
  validate(singleIdRequestSchema),
  rejectPickupRequest,
);

export default volunteerRouter;

