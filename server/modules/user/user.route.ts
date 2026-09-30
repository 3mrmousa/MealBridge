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
  currentEmailOtpVerification,
  deleteProfilePicture,
  deleteVerificationDocument,
  getUserProfile,
  newEmailOtpVerificationAndChange,
  updateProfile,
  updateProfilePicture,
  updateVerificationDocument,
} from "./user.controller.js";
import {
  ChangeEmailRequestSchema,
  changePasswordSchema,
  changePhoneSchema,
  deleteImageSchema,
  otpSchema,
} from "./user.zod.js";
import { validate } from "../../middlewares/validate.middleware.js";

const userRouter = Router();

userRouter.use(protect);

// Profile routes

// patch route it for create or update
userRouter
  .route("/profile")
  .get(getUserProfile)
  .patch(updateProfile);

userRouter
  .route("/profile/profile-picture")
  .put(
    heavyRateLimiter,
    uploadSingleFileForPFP,
    updateProfilePicture,
  )
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
