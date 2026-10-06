import { Router } from "express";
import { authorizeRoles, protect } from "../../middlewares/auth.middleware.js";
import { heavyRateLimiter } from "../../middlewares/rateLimit.middleware.js";
import { Role } from "@prisma/client";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  createDonationRequestSchema,
  cancelDonationRequestSchema,
  getAllDonationsSchema,
  getDonationByIdSchema,
  getMyDonationRequestByIdSchema,
  getMyDonationRequestsSchema,
  updateDonationRequestSchema,
  getClaimsSchema,
  getClaimByIdSchema,
  cancelClaimSchema,
  createDeliveryRequestSchema,
  getDeliveryRequestsSchema,
  getVolunteersSchema,
  getVolunteerByIdSchema,
} from "./recipient.zod.js";
import {
  createDonationRequest,
  cancelDonationRequest,
  getAllDonations,
  getDonationById,
  getMyDonationRequestById,
  getMyDonationRequests,
  updateDonationRequest,
  getClaims,
  getClaimById,
  cancelClaim,
  createDeliveryRequest,
  getDeliveryRequests,
  getAllVolunteers,
  getVolunteerById,
} from "./recipient.controller.js";

const recipientRouter = Router();

recipientRouter.use(protect);
recipientRouter.use(authorizeRoles(Role.RECIPIENT));

// Donation Request Routes (Recipient Perspective)
recipientRouter
  .route("/requests")
  .get(validate(getMyDonationRequestsSchema), getMyDonationRequests)
  .post(
    heavyRateLimiter,
    validate(createDonationRequestSchema),
    createDonationRequest,
  );

recipientRouter
  .route("/requests/:id")
  .get(validate(getMyDonationRequestByIdSchema), getMyDonationRequestById)
  .patch(
    heavyRateLimiter,
    validate(updateDonationRequestSchema),
    updateDonationRequest,
  )
  .delete(validate(cancelDonationRequestSchema), cancelDonationRequest);

// Donations Routes (Recipient Perspective)
recipientRouter.get(
  "/donations",
  validate(getAllDonationsSchema),
  getAllDonations,
);
recipientRouter.get(
  "/donations/:id",
  validate(getDonationByIdSchema),
  getDonationById,
);

// Donation Claim Routes (Recipient Perspective)
recipientRouter.get("/claims", validate(getClaimsSchema), getClaims);
recipientRouter
  .route("/claims/:id")
  .get(validate(getClaimByIdSchema), getClaimById)
  .delete(validate(cancelClaimSchema), cancelClaim);

// Volunteer Listing Routes (Recipient Perspective)
recipientRouter.get(
  "/volunteers",
  validate(getVolunteersSchema),
  getAllVolunteers,
);

recipientRouter.get(
  "/volunteers/:id",
  validate(getVolunteerByIdSchema),
  getVolunteerById,
);

// Delivery Request Routes (Recipient Perspective)
recipientRouter
  .route("/delivery-requests")
  .post(validate(createDeliveryRequestSchema), createDeliveryRequest)
  .get(validate(getDeliveryRequestsSchema), getDeliveryRequests);

export default recipientRouter;
