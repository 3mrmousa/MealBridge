import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/auth.middleware.js";
import { Role } from "../auth/auth.types.js";

const reportRouter = Router();

reportRouter.use(protect);

// reportRouter.post("/", createReport);
// reportRouter.get("/", 
//   authorizeRoles(Role.Admin, Role.Manager), 
//   getAllReports
// );
// reportRouter.get(
//   "/:id",
//   authorizeRoles(Role.Admin, Role.Manager),
//   getSingleReport,
// );
// reportRouter.delete(
//   "/:id",
//   authorizeRoles(Role.Admin, Role.Manager),
//   deleteReport,
// );

// To make admin and managers can review and take final decision like
// reject or accept a report
// reportRouter.use(
//   "/handle",
//   authorizeRoles(Role.Admin, Role.Manager),
//   handleReport,
// );

export default reportRouter;
