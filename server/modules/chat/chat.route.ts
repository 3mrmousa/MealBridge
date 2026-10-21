import { Router } from "express";
import {
  isProfileVerified,
  protect,
} from "../../middlewares/auth.middleware.js";
import { getMessages, listConversations } from "./chat.controller.js";
import { getMessagesSchema } from "./chat.zod.js";
import { validate } from "../../middlewares/validate.middleware.js";

const chatRouter = Router();

chatRouter.use(protect);
chatRouter.use(isProfileVerified());

chatRouter.get("/conversations", listConversations);
chatRouter.get(
  "/conversations/:id/messages",
  validate(getMessagesSchema),
  getMessages,
);

export default chatRouter;
