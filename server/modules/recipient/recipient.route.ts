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
  cancleClaimSchema,
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
  cancleClaim,
} from "./recipient.controller.js";

const recipientRouter = Router();

recipientRouter.use(protect);
recipientRouter.use(authorizeRoles(Role.RECIPIENT));

// Donation Request Routes (Recipient Perspective)
recipientRouter
  .route("/request")
  .get(validate(getMyDonationRequestsSchema), getMyDonationRequests)
  .post(
    heavyRateLimiter,
    validate(createDonationRequestSchema),
    createDonationRequest,
  );

recipientRouter
  .route("/request/:id")
  .get(validate(getMyDonationRequestByIdSchema), getMyDonationRequestById)
  .patch(
    heavyRateLimiter,
    validate(updateDonationRequestSchema),
    updateDonationRequest,
  )
  .delete(validate(deleteDonationRequestSchema), deleteDonationRequest);

// Donations Routes (Recipient Perspective)
recipientRouter.get(
  "/donation",
  validate(getAllDonationsSchema),
  getAllDonations,
);
recipientRouter.get(
  "/donation/:id",
  validate(getDonationByIdSchema),
  getDonationById,
);

// Donation Claim Routes (Recipient Perspective)
recipientRouter.get("/claim", validate(getClaimsSchema), getClaims);
recipientRouter
  .route("/claim/:id")
  .get(validate(getClaimByIdSchema), getClaimById)
  .delete(validate(cancleClaimSchema), cancleClaim);

export default recipientRouter;
