import { Router } from "express";
import { heavyRateLimiter } from "../../middlewares/rateLimit.middleware.js";
import {
  addPicsToDonation,
  createDonation,
  getDonationById,
  getMyDonations,
  removePicFromDonation,
  updateDonation,
  cancelDonation,
  getDonorDonationRequests,
  getDonorDonationRequest,
  acceptDonationRequest,
  rejectDonationRequest,
  getAllDonationClaims,
  getSingleDonationClaim,
} from "./donor.controller.js";
import { authorizeRoles, protect } from "../../middlewares/auth.middleware.js";
import { Role } from "@prisma/client";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  createDonationSchema,
  getDonationByIdSchema,
  getMyDonationsSchema,
  onlyIdParamSchema,
  updateDonationSchema,
  getDonationRequestsSchema,
  getSingleDonationRequestSchema,
  acceptRequestSchema,
  rejectRequestSchema,
  getAllDonationClaimsSchema,
  getSingleDonationClaimSchema,
} from "./donor.zod.js";
import { uploadMultipleFilesForDonation } from "../../middlewares/multer.middleware.js";

const donorRouter = Router();

donorRouter.use(protect);
donorRouter.use(authorizeRoles(Role.DONOR));

// Donations Routes (Donor Perspective)
donorRouter
  .route("/")
  .get(validate(getMyDonationsSchema), getMyDonations)
  .post(
    heavyRateLimiter,
    uploadMultipleFilesForDonation,
    validate(createDonationSchema),
    createDonation,
  );
donorRouter
  .route("/:id")
  .get(validate(getDonationByIdSchema), getDonationById)
  .patch(validate(updateDonationSchema), updateDonation)
  .delete(validate(onlyIdParamSchema), cancelDonation);

donorRouter.patch(
  "/:id/add-pics",
  heavyRateLimiter,
  uploadMultipleFilesForDonation,
  validate(onlyIdParamSchema),
  addPicsToDonation,
);
donorRouter.patch(
  "/:id/remove-pics",
  validate(onlyIdParamSchema),
  removePicFromDonation,
);

// Donation Request Routes (Donor Perspective)
donorRouter.get(
  "/:id/requests",
  validate(getDonationRequestsSchema),
  getDonorDonationRequests,
);

donorRouter.get(
  "/:id/requests/:reqId",
  validate(getSingleDonationRequestSchema),
  getDonorDonationRequest,
);

donorRouter.patch(
  ["/:id/requests/:reqId/accept", "/:id/requests/accept/:reqId"],
  validate(acceptRequestSchema),
  acceptDonationRequest,
);

donorRouter.patch(
  ["/:id/requests/:reqId/reject", "/:id/requests/reject/:reqId"],
  validate(rejectRequestSchema),
  rejectDonationRequest,
);

// Donation Claim Routes (Donor Perspective)
donorRouter.get(
  "/:id/claims",
  validate(getAllDonationClaimsSchema),
  getAllDonationClaims,
);

donorRouter.get(
  "/:id/claims/:claimId",
  validate(getSingleDonationClaimSchema),
  getSingleDonationClaim,
);

// Pickup Routes (Donor Perspective)


export default donorRouter;
