import { Router } from "express";
import {
  addPicsToDonation,
  createDonation,
  getDonationById,
  getMyDonations,
  removePicFromDonation,
  updateDonation,
  deleteDonation,
} from "./donation.controller.js";
import { authorizeRoles, protect } from "../../middlewares/auth.middleware.js";
import { Role } from "@prisma/client";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  createDonationSchema,
  getDonationByIdSchema,
  getMyDonationsSchema,
  onlyIdParamSchema,
  updateDonationSchema,
} from "./donation.zod.js";
import { uploadMultipleFilesForDonation } from "../../middlewares/multer.middleware.js";

const donationRouter = Router();

donationRouter.use(protect);
donationRouter.use(authorizeRoles(Role.DONOR));

donationRouter.get("/", validate(getMyDonationsSchema), getMyDonations);

donationRouter.get(
  "/:id",
  validate(getDonationByIdSchema),
  getDonationById,
);

donationRouter.post(
  "/:id",
  uploadMultipleFilesForDonation,
  validate(createDonationSchema),
  createDonation,
);

donationRouter.patch(
  "/:id",
  validate(updateDonationSchema),
  updateDonation,
);

donationRouter.patch(
  "/:id/add-pics",
  uploadMultipleFilesForDonation,
  validate(onlyIdParamSchema),
  addPicsToDonation,
);
donationRouter.patch(
  "/:id/remove-pics",
  validate(onlyIdParamSchema),
  removePicFromDonation,
);

donationRouter.delete(
  "/:id",
  validate(onlyIdParamSchema),
  deleteDonation,
);

export default donationRouter;
