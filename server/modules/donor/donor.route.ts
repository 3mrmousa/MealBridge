import { Router } from "express";
import {
  addPicsToDonation,
  createDonation,
  getDonationById,
  getMyDonations,
  removePicFromDonation,
  updateDonation,
  deleteDonation,
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

donorRouter.get("/", validate(getMyDonationsSchema), getMyDonations);

donorRouter.get(
  "/:id",
  validate(getDonationByIdSchema),
  getDonationById,
);

donorRouter.post(
  "/:id",
  uploadMultipleFilesForDonation,
  validate(createDonationSchema),
  createDonation,
);

donorRouter.patch(
  "/:id",
  validate(updateDonationSchema),
  updateDonation,
);

donorRouter.patch(
  "/:id/add-pics",
  uploadMultipleFilesForDonation,
  validate(onlyIdParamSchema),
  addPicsToDonation,
);
donorRouter.patch(
  "/:id/remove-pics",
  validate(onlyIdParamSchema),
  removePicFromDonation,
);

donorRouter.delete(
  "/:id",
  validate(onlyIdParamSchema),
  deleteDonation,
);

// Donation Request Routes (Donor Perspective)
donorRouter.get(
  "/:id/request",
  validate(getDonationRequestsSchema),
  getDonorDonationRequests,
);

donorRouter.get(
  "/:id/request/:reqId",
  validate(getSingleDonationRequestSchema),
  getDonorDonationRequest,
);

donorRouter.patch(
  "/:id/request/accept/:reqId",
  validate(acceptRequestSchema),
  acceptDonationRequest,
);

donorRouter.patch(
  "/:id/request/reject/:reqId",
  validate(rejectRequestSchema),
  rejectDonationRequest,
);

// Donation Claim Routes (Donor Perspective)
donorRouter.get(
  "/:id/claim",
  validate(getAllDonationClaimsSchema),
  getAllDonationClaims,
);

donorRouter.get(
  "/:id/claim/:claimId",
  validate(getSingleDonationClaimSchema),
  getSingleDonationClaim,
);

export default donorRouter;
