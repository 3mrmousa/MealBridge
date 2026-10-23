import type { Request, Response } from "express";
import asyncHandler from "../../utils/errors/asyncHandler.js";
import type { AuthRequest } from "../../utils/types/AuthRequest.js";
import {
  siteSettingsForUsersService,
  siteSettingsForAdminService,
  siteSettingsForAdminByIdService,
  deleteSiteSettingsService,
  createSiteSettingsService,
  updateSiteSettingsService,
  deleteSiteSettingsLogoService,
  deleteSiteSettingsFaviconService,
  toggleActiveSiteSettingsService,
} from "./settings.service.js";
import type {
  CreateSiteSettingsBody,
  SingleSiteSettingIdParams,
  ToggleActiveBody,
  ToggleActiveParams,
  UpdateSiteSettingsBody,
} from "./settings.zod.js";

export const siteSettingsForUsers = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await siteSettingsForUsersService();
    return res.status(200).json({
      success: true,
      data: result,
    });
  },
);

export const siteSettingsForAdmin = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await siteSettingsForAdminService();
    return res.status(200).json({
      success: true,
      data: result,
    });
  },
);

export const siteSettingsForAdminById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params as SingleSiteSettingIdParams;
    const result = await siteSettingsForAdminByIdService(id);
    return res.status(200).json({
      success: true,
      data: result,
    });
  },
);

export const createSiteSettings = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const body = req.body as CreateSiteSettingsBody;
    const files = req.files as
      { [fieldname: string]: Express.Multer.File[] } | undefined;
    const logoFile = files?.logo?.[0];
    const faviconFile = files?.favicon?.[0];
    const result = await createSiteSettingsService(
      userId,
      body,
      logoFile,
      faviconFile,
    );
    return res.status(201).json({
      success: true,
      data: result,
    });
  },
);

export const deleteSiteSettings = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params as SingleSiteSettingIdParams;
    await deleteSiteSettingsService(id);
    return res.status(200).json({
      success: true,
      message: "Site setting deleted successfully",
    });
  },
);

export const updateSiteSettings = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params as SingleSiteSettingIdParams;
    const userId = req.user!.id;
    const body = req.body as UpdateSiteSettingsBody;
    const files = req.files as
      { [fieldname: string]: Express.Multer.File[] } | undefined;
    const logoFile = files?.logo?.[0];
    const faviconFile = files?.favicon?.[0];
    const result = await updateSiteSettingsService(
      id,
      userId,
      body,
      logoFile,
      faviconFile,
    );
    return res.status(200).json({
      success: true,
      data: result,
    });
  },
);

export const deleteSiteSettingsLogo = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params as SingleSiteSettingIdParams;
    const userId = req.user!.id;
    const result = await deleteSiteSettingsLogoService(id, userId);
    return res.status(200).json({
      success: true,
      data: result,
    });
  },
);

export const deleteSiteSettingsFavicon = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params as SingleSiteSettingIdParams;
    const userId = req.user!.id;
    const result = await deleteSiteSettingsFaviconService(id, userId);
    return res.status(200).json({
      success: true,
      data: result,
    });
  },
);

export const toggleActiveSiteSettings = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params as ToggleActiveParams;
    const userId = req.user!.id;
    const body = req.body as ToggleActiveBody;
    const result = await toggleActiveSiteSettingsService(id, userId, body);
    return res.status(200).json({
      success: true,
      message: "Site setting activated successfully",
      data: result,
    });
  },
);


