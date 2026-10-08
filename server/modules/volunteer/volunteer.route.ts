import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  acceptDeliveryRequest,
  cancelDelivery,
  completeDelivery,
  getAllDeliveries,
  getDeliveryRequests,
  rejectDeliveryRequest,
  singleDelivery,
  pickupDelivery,
} from "./volunteer.controller.js";
import { authorizeRoles, protect } from "../../middlewares/auth.middleware.js";
import { Role } from "@prisma/client";
import {
  getAllDeliveriesSchema,
  getDeliveryRequestsSchema,
  singleIdRequestSchema,
} from "./volunteer.zod.js";

const volunteerRouter = Router();

volunteerRouter.use(protect);
volunteerRouter.use(authorizeRoles(Role.VOLUNTEER));

// Delivery Request Routes (Volunteer Perspective)

volunteerRouter.get(
  "/delivery-requests",
  validate(getDeliveryRequestsSchema),
  getDeliveryRequests,
);

volunteerRouter.patch(
  "/delivery-requests/:id/accept",
  validate(singleIdRequestSchema),
  acceptDeliveryRequest,
);

volunteerRouter.patch(
  "/delivery-requests/:id/reject",
  validate(singleIdRequestSchema),
  rejectDeliveryRequest,
);

// Delivery Routes (Volunteer Perspective)

volunteerRouter.get(
  "/deliveries",
  validate(getAllDeliveriesSchema),
  getAllDeliveries,
);

volunteerRouter.get(
  "/deliveries/:id",
  validate(singleIdRequestSchema),
  singleDelivery,
);

volunteerRouter.patch(
  "/deliveries/:id/pickup",
  validate(singleIdRequestSchema),
  pickupDelivery,
);

volunteerRouter.patch(
  "/deliveries/:id/complete",
  validate(singleIdRequestSchema),
  completeDelivery,
);

volunteerRouter.patch(
  "/deliveries/:id/cancel",
  validate(singleIdRequestSchema),
  cancelDelivery
);

export default volunteerRouter;
