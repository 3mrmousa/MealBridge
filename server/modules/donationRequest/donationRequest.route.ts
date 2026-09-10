import { Router } from "express";
import {
  getAllDonationRequests,
  getSingleDonationRequest,
  acceptDonationRequest,
  rejectDonationRequest,
} from "./donationRequest.controller.js";
import { authorizeRoles, protect } from "../../middlewares/auth.middleware.js";
import { Role } from "@prisma/client";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  acceptRequestSchema,
  getDonationRequestsSchema,
  getSingleDonationRequestSchema,
  rejectRequestSchema,
} from "./donationRequest.zod.js";

const donationRequestRouter = Router();

donationRequestRouter.use(protect);
donationRequestRouter.use(authorizeRoles(Role.DONOR));

donationRequestRouter.get(
  "/:id/request",
  validate(getDonationRequestsSchema),
  getAllDonationRequests,
);

donationRequestRouter.get(
  "/:id/request/:reqId",
  validate(getSingleDonationRequestSchema),
  getSingleDonationRequest,
);

donationRequestRouter.patch(
  "/:id/request/accept/:reqId",
  validate(acceptRequestSchema),
  acceptDonationRequest,
);

donationRequestRouter.patch(
  "/:id/request/reject/:reqId",
  validate(rejectRequestSchema),
  rejectDonationRequest,
);

export default donationRequestRouter;
