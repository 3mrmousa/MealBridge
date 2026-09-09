import { Router } from "express";
import { authorizeRoles, protect } from "../../middlewares/auth.middleware.js";
import {
  addPicsToDonation,
  createDonation,
  getDonationById,
  getMyDonations,
  removePicFromDonation,
  updateDonation,
  deleteDonation,
  getAllDonationRequests,
  getSingleDonationRequest,
  acceptDonationRequest,
  rejectDonationRequest,
} from "./donor.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  acceptRequestSchema,
  createDonationSchema,
  getDonationByIdSchema,
  getMyDonationsSchema,
  idWithPangitinationRequestsSchema,
  idWithPangitinationSingleRequestSchema,
  onlyIdParamSchema,
  rejectRequestSchema,
  updateDonationSchema,
} from "./donor.zod.js";
import { uploadMultipleFilesForDonation } from "../../middlewares/multer.middleware.js";
import { Role } from "@prisma/client";

const donorRouter = Router();

donorRouter.use(protect);
donorRouter.use(authorizeRoles(Role.DONOR));

donorRouter.get("/donation", validate(getMyDonationsSchema), getMyDonations);

donorRouter.get(
  "/donation/:id",
  validate(getDonationByIdSchema),
  getDonationById,
);

donorRouter.post(
  "/donation/:id",
  uploadMultipleFilesForDonation,
  validate(createDonationSchema),
  createDonation,
);

donorRouter.patch(
  "/donation/:id",
  validate(updateDonationSchema),
  updateDonation,
);

donorRouter.patch(
  "/donation/:id/add-pics",
  uploadMultipleFilesForDonation,
  validate(onlyIdParamSchema),
  addPicsToDonation,
);
donorRouter.patch(
  "/donation/:id/remove-pics",
  validate(onlyIdParamSchema),
  removePicFromDonation,
);

donorRouter.delete(
  "/donation/:id",
  validate(onlyIdParamSchema),
  deleteDonation,
);

// Requests by recipient
donorRouter.get(
  "/donation/:id/requests",
  validate(idWithPangitinationRequestsSchema),
  getAllDonationRequests,
);
donorRouter.get(
  "/donation/:id/requests/:reqId",
  validate(idWithPangitinationSingleRequestSchema),
  getSingleDonationRequest,
);
donorRouter.patch(
  "/donation/:id/accept/:reqId",
  validate(acceptRequestSchema),
  acceptDonationRequest,
);
donorRouter.patch(
  "/donation/:id/reject/:reqId",
  validate(rejectRequestSchema),
  rejectDonationRequest,
);

// // Donation claims
// donorRouter.get("/donation/:id/claims", getAllDonationClaims);
// donorRouter.patch("/donation/:id/claims/:claimId", updateDonationClaim);

// // Pickup requests
// donorRouter.get("/donation/:id/pickup-requests", getAllPickupRequests);
// donorRouter.patch("/donation/:id/pickup-requests/:pickupRequestId", updatePickupRequest);

// // Conversation
// donorRouter.get("/donation/:id/conversations", getAllConversations);
// donorRouter.get("/donation/:id/conversations/:conversationId", getConversationById);

// // Message
// donorRouter.get("/donation/:id/conversations/:conversationId/messages", getAllMessages);
// donorRouter.post("/donation/:id/conversations/:conversationId/messages/:messageId", sendMessage);

export default donorRouter;
