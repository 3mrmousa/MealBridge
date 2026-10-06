import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  acceptDeliveryRequest,
  cancelDelivery,
  completeDelivery,
  emergencyCancelDelivery,
  getAllCancelDeliveries,
  getAllDeliveries,
  getDeliveryRequests,
  rejectDeliveryRequest,
  singleCancelDelivery,
  singleDelivery,
} from "./volunteer.controller.js";
import { authorizeRoles, protect } from "../../middlewares/auth.middleware.js";
import { Role } from "@prisma/client";
import {
  getAllDeliveriesSchema,
  getCancelDeliveriesSchema,
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

volunteerRouter.get(
  "/deliveries/cancel-requests",
  validate(getCancelDeliveriesSchema),
  getAllCancelDeliveries,
);

volunteerRouter.get(
  "/deliveries/:id/cancel-request",
  validate(singleIdRequestSchema),
  singleCancelDelivery,
);



volunteerRouter.patch(
  "/deliveries/:id/complete",
  validate(singleIdRequestSchema),
  completeDelivery,
);

volunteerRouter.patch(
  "/deliveries/:id/emergency-cancel",
  validate(singleIdRequestSchema),
  emergencyCancelDelivery,
);

volunteerRouter.patch(
  "/deliveries/:id/cancel-request",
  validate(singleIdRequestSchema),
  cancelDelivery
);

export default volunteerRouter;
