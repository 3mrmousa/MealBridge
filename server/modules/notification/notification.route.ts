import { Router } from "express";
import { markAsRead } from "./notification.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { markAsReadSchema } from "./notification.zod.js";
import { getUserNotifications } from "./notification.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";

const notificationRouter = Router();

notificationRouter.use(protect);
notificationRouter.get("/", getUserNotifications);
notificationRouter.patch(
  "/:notificationId/mark-as-read",
  validate(markAsReadSchema),
  markAsRead,
);

export default notificationRouter;