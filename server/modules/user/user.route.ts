import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import {
  uploadMultipleFilesForVerificationDocs,
  uploadSingleFileForPFP,
} from "../../middlewares/multer.middleware.js";
import {
  deleteProfilePicture,
  deleteVerificationDocument,
  getUserProfile,
  updateProfile,
  updateProfilePicture,
  updateVerificationDocument,
} from "./user.controller.js";
import { deleteImageSchema } from "./user.zod.js";
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
userRouter.patch("/change-password", changePassword);
userRouter.patch("/change-email", changeEmail);
userRouter.patch("/change-phone", changePhone);

//delete account
userRouter.delete("/delete-account", deleteAccount);

export default userRouter;
