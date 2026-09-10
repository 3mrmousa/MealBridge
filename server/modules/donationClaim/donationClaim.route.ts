import { Router } from "express";
import {
  getAllDonationClaims,
  getSingleDonationClaim,
} from "./donationClaim.controller.js";
import { authorizeRoles, protect } from "../../middlewares/auth.middleware.js";
import { Role } from "@prisma/client";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  getAllDonationClaimsSchema,
  getSingleDonationClaimSchema,
} from "./donationClaim.zod.js";

const donationClaimRouter = Router();

donationClaimRouter.use(protect);
donationClaimRouter.use(authorizeRoles(Role.DONOR));

donationClaimRouter.get(
  "/:id/claim",
  validate(getAllDonationClaimsSchema),
  getAllDonationClaims,
);

donationClaimRouter.get(
  "/:id/claim/:claimId",
  validate(getSingleDonationClaimSchema),
  getSingleDonationClaim,
);

export default donationClaimRouter;
