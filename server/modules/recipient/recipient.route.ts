import { Router } from "express";
import { authorizeRoles, protect } from "../../middlewares/auth.middleware.js";
import { Role } from "@prisma/client";

const recipientRouter = Router();

recipientRouter.use(protect);
recipientRouter.use(authorizeRoles(Role.RECIPIENT));

export default recipientRouter;
