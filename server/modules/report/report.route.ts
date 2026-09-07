import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/auth.middleware.js";
import { Role } from "@prisma/client";
import {
  createReport,
  getAllReports,
  getSingleReport,
  handleReport,
} from "./report.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  createReportSchema,
  handleReportSchema,
  singleReportIdSchema,
} from "./report.zod.js";

const reportRouter = Router();

reportRouter.use(protect);

reportRouter.post("/", validate(createReportSchema), createReport);

reportRouter.get("/", authorizeRoles(Role.ADMIN, Role.MANAGER), getAllReports);

reportRouter.get(
  "/:id",
  authorizeRoles(Role.ADMIN, Role.MANAGER),
  validate(singleReportIdSchema),
  getSingleReport,
);

// To make admin and managers can review and take final decision like
// reject or accept a report
reportRouter.use(
  "/handle",
  authorizeRoles(Role.ADMIN, Role.MANAGER),
  validate(handleReportSchema),
  handleReport,
);

export default reportRouter;
