import { Router } from "express";
import { authorizeRoles, protect } from "../../middlewares/auth.middleware.js";
import { Role } from "@prisma/client";

const recipientRouter = Router();

recipientRouter.use(protect);
recipientRouter.use(authorizeRoles(Role.RECIPIENT));

recipientRouter.get("/request", getMyDonationRequests);
recipientRouter.get("/request/:id", getMyDoantionRequestById);
recipientRouter.post("/request/:id", createDonationRequest);
recipientRouter.patch("/request/:id", updateDonationRequest);
recipientRouter.delete("/request/:id", deleteDonationRequest);

// Donations Routes (Recipient Perspective)
recipientRouter.get("/donation", getAllDonations);
recipientRouter.get("/donation/:id", getDonationById);

// Donation Request Routes (Recipient Perspective)
recipientRouter.get("/request", getMyDonationRequests);
recipientRouter.get("/request/:id", getMyDoantionRequestById);
recipientRouter.post("/request/:id", createDonationRequest);
recipientRouter.patch("/request/:id", updateDonationRequest);
recipientRouter.delete("/request/:id", deleteDonationRequest);

// Donation Claim Routes (Recipient Perspective)
recipientRouter.get("/claim", getClaims);
recipientRouter.get("/claim/:id", getClaimById);
recipientRouter.delete("/claim/:id", deleteClaimById);

export default recipientRouter;
