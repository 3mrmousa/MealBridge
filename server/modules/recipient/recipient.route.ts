import { Router } from "express";
import { authorizeRoles, protect } from "../../middlewares/auth.middleware.js";
import { heavyRateLimiter } from "../../middlewares/rateLimit.middleware.js";
import { Role } from "@prisma/client";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  createDonationRequestSchema,
  deleteDonationRequestSchema,
  getMyDonationRequestByIdSchema,
  getMyDonationRequestsSchema,
  updateDonationRequestSchema,
} from "./recipient.zod.js";
import {
  createDonationRequest,
  deleteDonationRequest,
  getMyDonationRequestById,
  getMyDonationRequests,
  updateDonationRequest,
} from "./recipient.controller.js";

const recipientRouter = Router();

recipientRouter.use(protect);
recipientRouter.use(authorizeRoles(Role.RECIPIENT));

recipientRouter.get(
  "/request",
  validate(getMyDonationRequestsSchema),
  getMyDonationRequests,
);
recipientRouter.get(
  "/request/:id",
  validate(getMyDonationRequestByIdSchema),
  getMyDonationRequestById,
);
recipientRouter.post(
  "/request",
  heavyRateLimiter,
  validate(createDonationRequestSchema),
  createDonationRequest,
);
recipientRouter.patch(
  "/request/:id",
  heavyRateLimiter,
  validate(updateDonationRequestSchema),
  updateDonationRequest,
);
recipientRouter.delete(
  "/request/:id",
  validate(deleteDonationRequestSchema),
  deleteDonationRequest,
);

// // Donations Routes (Recipient Perspective)
// recipientRouter.get("/donation", getAllDonations);
// recipientRouter.get("/donation/:id", getDonationById);

// // Donation Request Routes (Recipient Perspective)
// recipientRouter.get("/request", getMyDonationRequests);
// recipientRouter.get("/request/:id", getMyDoantionRequestById);
// recipientRouter.post("/request/:id", createDonationRequest);
// recipientRouter.patch("/request/:id", updateDonationRequest);
// recipientRouter.delete("/request/:id", deleteDonationRequest);

// // Donation Claim Routes (Recipient Perspective)
// recipientRouter.get("/claim", getClaims);
// recipientRouter.get("/claim/:id", getClaimById);
// recipientRouter.delete("/claim/:id", deleteClaimById);

export default recipientRouter;
