import { Router } from "express";
import { authorizeRoles, protect } from "../../middlewares/auth.middleware.js";
import { heavyRateLimiter } from "../../middlewares/rateLimit.middleware.js";
import { Role } from "@prisma/client";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  createDonationRequestSchema,
  deleteDonationRequestSchema,
  getAllDonationsSchema,
  getDonationByIdSchema,
  getMyDonationRequestByIdSchema,
  getMyDonationRequestsSchema,
  updateDonationRequestSchema,
  getClaimsSchema,
  getClaimByIdSchema,
  cancelClaimSchema,
} from "./recipient.zod.js";
import {
  createDonationRequest,
  deleteDonationRequest,
  getAllDonations,
  getDonationById,
  getMyDonationRequestById,
  getMyDonationRequests,
  updateDonationRequest,
  getClaims,
  getClaimById,
  cancelClaim,
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
  .delete(validate(deleteDonationRequestSchema), deleteDonationRequest);

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

// Pickup (Recipient Perspective)

// recipientRouter.route("/pickups").get(getAllPickups).post();
// recipientRouter.route("/pickups/:id").get(getPickupById).patch(updatePickup).delete(deletePickup);

export default recipientRouter;
