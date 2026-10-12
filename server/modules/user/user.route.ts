import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import { heavyRateLimiter } from "../../middlewares/rateLimit.middleware.js";
import {
  uploadMultipleFilesForVerificationDocs,
  uploadSingleFileForPFP,
} from "../../middlewares/multer.middleware.js";
import {
  changeEmailRequest,
  changePassword,
  changePhone,
  // createProfile,
  currentEmailOtpVerification,
  deleteProfilePicture,
  deleteVerificationDocument,
  getUserProfile,
  newEmailOtpVerificationAndChange,
  updateDonorProfile,
  updateRecipientProfile,
  updateVolunteerProfile,
  updateProfilePicture,
  updateVerificationDocument,
  createDonorProfile,
  createRecipientProfile,
  createVolunteerProfile,
} from "./user.controller.js";
import {
  ChangeEmailRequestSchema,
  changePasswordSchema,
  changePhoneSchema,
  createDonorProfileSchema,
  createRecipientProfileSchema,
  createVolunteerProfileSchema,
  deleteImageSchema,
  otpSchema,
  updateDonorProfileSchema,
  updateRecipientProfileSchema,
  updateVolunteerProfileSchema,
} from "./user.zod.js";
import { validate } from "../../middlewares/validate.middleware.js";

const userRouter = Router();

userRouter.use(protect);

// Profile routes

userRouter.route("/profile").get(getUserProfile);

userRouter.post("/createProfile/donor", validate(createDonorProfileSchema), createDonorProfile);
userRouter.post("/createProfile/recipient", validate(createRecipientProfileSchema), createRecipientProfile);
userRouter.post("/createProfile/volunteer", validate(createVolunteerProfileSchema), createVolunteerProfile);

userRouter.patch(
  "/profile/donor",
  validate(updateDonorProfileSchema),
  updateDonorProfile,
);
userRouter.patch(
  "/profile/recipient",
  validate(updateRecipientProfileSchema),
  updateRecipientProfile,
);
userRouter.patch(
  "/profile/volunteer",
  validate(updateVolunteerProfileSchema),
  updateVolunteerProfile,
);

userRouter
  .route("/profile/profile-picture")
  .put(heavyRateLimiter, uploadSingleFileForPFP, updateProfilePicture)
  .delete(validate(deleteImageSchema), deleteProfilePicture);

userRouter
  .route("/profile/verification-document")
  .patch(
    heavyRateLimiter,
    uploadMultipleFilesForVerificationDocs,
    updateVerificationDocument,
  )
  .delete(validate(deleteImageSchema), deleteVerificationDocument);

// Change field routes
userRouter.patch(
  "/change/password",
  validate(changePasswordSchema),
  changePassword,
);
userRouter.patch(
  "/change/email/request",
  validate(ChangeEmailRequestSchema),
  changeEmailRequest,
);
userRouter.patch(
  "/change/email/current/verify",
  validate(otpSchema),
  currentEmailOtpVerification,
);
userRouter.patch(
  "/change/email/new/verify-and-change",
  validate(otpSchema),
  newEmailOtpVerificationAndChange,
);
userRouter.patch("/change/phone", validate(changePhoneSchema), changePhone);

export default userRouter;
