import { Router } from "express";
import { authorizeRoles, protect } from "../../middlewares/auth.middleware.js";
import {
  createDonation,
  getDonationById,
  getMyDonations,
  updateDonation,
} from "./donor.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  createDonationSchema,
  getDonationByIdSchema,
  getMyDonationsSchema,
  updateDonationSchema,
} from "./donor.zod.js";
import { uploadMultipleFilesForDonation } from "../../middlewares/multer.middleware.js";
import { Role } from "@prisma/client";

const donorRouter = Router();

donorRouter.use(protect);
donorRouter.use(authorizeRoles(Role.DONOR))

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
  uploadMultipleFilesForDonation,
  validate(updateDonationSchema),
  updateDonation,
);

// donorRouter.delete("/donation/:id", deleteDonation);

// // Requests by recipient
// donorRouter.get("/donation/:id/requests", getAllDonationRequests);
// donorRouter.patch("/donation/:id/requests/:reqId", updateDonationRequest);

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
