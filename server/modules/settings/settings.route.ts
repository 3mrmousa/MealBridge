import { Router } from "express";
import { authorizeRoles, protect } from "../../middlewares/auth.middleware.js";
import { Role } from "@prisma/client";
import {
  siteSettingsForAdmin,
  siteSettingsForAdminById,
  siteSettingsForUsers,
  deleteSiteSettings,
  createSiteSettings,
  updateSiteSettings,
  deleteSiteSettingsLogo,
  deleteSiteSettingsFavicon,
  toggleActiveSiteSettings,
} from "./settings.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  createSiteSettingsSchema,
  singleSiteSettingIdSchema,
  toggleActiveSchema,
  updateSiteSettingsSchema,
} from "./settings.zod.js";
import { uploadMultiplePicsForSiteSettings } from "../../middlewares/multer.middleware.js";

const settingsRouter = Router();

settingsRouter.get("/", siteSettingsForUsers);

settingsRouter.use(protect, authorizeRoles(Role.ADMIN, Role.MANAGER));
settingsRouter.get("/admin", siteSettingsForAdmin);
settingsRouter.get(
  "/admin/:id",
  validate(singleSiteSettingIdSchema),
  siteSettingsForAdminById,
);
settingsRouter.post(
  "/admin",
  uploadMultiplePicsForSiteSettings,
  validate(createSiteSettingsSchema),
  createSiteSettings,
);
settingsRouter.patch(
  "/admin/:id",
  uploadMultiplePicsForSiteSettings,
  validate(updateSiteSettingsSchema),
  updateSiteSettings,
);
settingsRouter.patch(
  "/admin/:id/active",
  validate(toggleActiveSchema),
  toggleActiveSiteSettings,
);
settingsRouter.delete(
  "/admin/:id",
  validate(singleSiteSettingIdSchema),
  deleteSiteSettings,
);
settingsRouter.delete(
  "/admin/:id/logo",
  validate(singleSiteSettingIdSchema),
  deleteSiteSettingsLogo,
);
settingsRouter.delete(
  "/admin/:id/favicon",
  validate(singleSiteSettingIdSchema),
  deleteSiteSettingsFavicon,
);

export default settingsRouter;
