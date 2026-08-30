import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware.js";
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

//profile routes
userRouter.get("/profile", getUserProfile).patch("/profile", updateProfile);

userRouter
  .put("/profile/profile-picture", uploadSingleFileForPFP, updateProfilePicture)
  .delete(
    "/profile/profile-picture",
    validate(deleteImageSchema),
    deleteProfilePicture,
  );

userRouter
  .patch(
    "/profile/verification-document",
    uploadMultipleFilesForVerificationDocs,
    updateVerificationDocument,
  )
  .delete(
    "/profile/verification-document",
    validate(deleteImageSchema),
    deleteVerificationDocument,
  );

//change field routes
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
