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
  getSingleDeliveryRequestSchema,
  cancelDeliveryRequestSchema,
  getDeliveriesSchema,
  getSingleDeliverySchema,
  cancelDeliverySchema,
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
  getSingleDeliveryRequest,
  cancelDeliveryRequest,
  getDeliveries,
  getSingleDeliveries,
  markDeliveryAsReceived,
  cancelDelivery,
  isDonationClaimHasDelivery,
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
  );

recipientRouter.patch(
  "/donation-requests/:id/cancel",
  validate(cancelDonationRequestSchema),
  cancelDonationRequest,
);

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
  .get(validate(getClaimByIdSchema), getClaimById);

recipientRouter.patch(
  "/claims/:id/cancel",
  validate(cancelClaimSchema),
  cancelClaim,
);

// Take the claim route
// recipientRouter.patch(
//   "/claims/:id/self-pickup",
//   validate(selfPickupClaimSchema),
//   selfPickupClaim,
// );

// Delivery & Volunteer Routes (Recipient Perspective)
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

recipientRouter
  .route("/delivery-requests")
  .post(validate(createDeliveryRequestSchema), createDeliveryRequest)
  .get(validate(getDeliveryRequestsSchema), getDeliveryRequests);

recipientRouter
  .route("/delivery-requests/:id")
  .get(validate(getSingleDeliveryRequestSchema), getSingleDeliveryRequest);

recipientRouter.patch(
  "/delivery-requests/:id/cancel",
  validate(cancelDeliveryRequestSchema),
  cancelDeliveryRequest,
);

recipientRouter.get(
  "/delivery-requests/:id/has-delivery",
  validate(getSingleDeliverySchema),
  isDonationClaimHasDelivery,
);

recipientRouter.get(
  "/deliveries",
  validate(getDeliveriesSchema),
  getDeliveries,
);

recipientRouter
  .route("/deliveries/:id")
  .get(validate(getSingleDeliverySchema), getSingleDeliveries)
  .patch(validate(getSingleDeliverySchema), markDeliveryAsReceived);

recipientRouter.patch(
  "/deliveries/:id/cancel",
  validate(cancelDeliverySchema),
  cancelDelivery,
);

export default recipientRouter;
