import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import { getUserProfile, updateProfile } from "./user.controller.js";

const userRouter = Router();

userRouter.use(protect);

//profile routes
userRouter.get("/profile", getUserProfile).patch("/profile", updateProfile);

//change field routes
userRouter.patch("/change-password", changePassword);
userRouter.patch("/change-email", changeEmail);
userRouter.patch("/change-phone", changePhone);

//delete account
userRouter.delete("/delete-account", deleteAccount);


export default userRouter;
