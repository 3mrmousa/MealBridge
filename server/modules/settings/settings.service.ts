import { Prisma } from "@prisma/client";
import prisma from "../../database/index.js";
import {
  uploadSiteSettingsFaviconToCloudinary,
  uploadSiteSettingsLogoToCloudinary,
} from "../../utils/cloudinary/uploadImage.js";
import {
  deleteSiteSettingsFaviconFromCloudinary,
  deleteSiteSettingsLogoFromCloudinary,
} from "../../utils/cloudinary/deleteImage.js";
import AppError from "../../utils/errors/AppError.js";
import { formatPhoneNumber } from "../../utils/phoneNumber/formatPhoneNumber.js";
import type {
  CreateSiteSettingsBody,
  ToggleActiveBody,
  UpdateSiteSettingsBody,
} from "./settings.zod.js";

export const siteSettingsForUsersService = async () => {
  const siteSettings = await prisma.siteSetting.findFirst({
    where: {
      active: true,
    },
    select: {
      id: true,
      title: true,
      description: true,
      logo: true,
      favicon: true,
      contactEmail: true,
      contactPhone: true,
    },
  });
  return siteSettings;
};

export const siteSettingsForAdminService = async () => {
  const siteSettings = await prisma.siteSetting.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      logo: true,
      favicon: true,
      contactEmail: true,
      contactPhone: true,
      active: true,
      updatedAt: true,
      updatedById: true,
    },
  });
  return siteSettings;
};

export const siteSettingsForAdminByIdService = async (id: string) => {
  const siteSetting = await prisma.siteSetting.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      logo: true,
      favicon: true,
      contactEmail: true,
      contactPhone: true,
      active: true,
      updatedAt: true,
      updatedById: true,
      updatedBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  if (!siteSetting) {
    throw new AppError("Site setting not found", 404);
  }

  return siteSetting;
};

export const createSiteSettingsService = async (
  userId: string,
  body: CreateSiteSettingsBody,
  logoFile: Express.Multer.File | undefined,
  faviconFile: Express.Multer.File | undefined,
) => {
  const { description, title, contactEmail, contactPhone } = body;

  if (
    !description ||
    !title ||
    !logoFile ||
    !faviconFile ||
    !contactEmail ||
    !contactPhone
  ) {
    throw new AppError("All fields are required", 400);
  }

  const count = await prisma.siteSetting.count();
  const isFirst = count === 0;

  const result = await uploadSiteSettingsLogoToCloudinary(logoFile.buffer);
  const logo = { public_id: result.public_id, secure_url: result.secure_url };

  const result2 = await uploadSiteSettingsFaviconToCloudinary(
    faviconFile.buffer,
  );
  const favicon = {
    public_id: result2.public_id,
    secure_url: result2.secure_url,
  };

  const formattedPhone = contactPhone
    ? formatPhoneNumber(contactPhone)
    : undefined;

  const siteSetting = await prisma.siteSetting.create({
    data: {
      title,
      description,
      logo,
      favicon,
      contactEmail,
      contactPhone: formattedPhone,
      active: isFirst,
      updatedById: userId,
    },
  });

  return siteSetting;
};

export const updateSiteSettingsService = async (
  id: string,
  userId: string,
  body: UpdateSiteSettingsBody,
  logoFile: Express.Multer.File | undefined,
  faviconFile: Express.Multer.File | undefined,
) => {
  const existing = await prisma.siteSetting.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError("Site setting not found", 404);
  }

  let logo: Prisma.InputJsonValue | undefined = undefined;
  if (logoFile) {
    const result = await uploadSiteSettingsLogoToCloudinary(logoFile.buffer);
    const oldLogo = existing.logo as { public_id?: string } | null;
    if (oldLogo?.public_id) {
      await deleteSiteSettingsLogoFromCloudinary(oldLogo.public_id);
    }
    logo = { public_id: result.public_id, secure_url: result.secure_url };
  }

  let favicon: Prisma.InputJsonValue | undefined = undefined;
  if (faviconFile) {
    const result2 = await uploadSiteSettingsFaviconToCloudinary(
      faviconFile.buffer,
    );
    const oldFavicon = existing.favicon as { public_id?: string } | null;
    if (oldFavicon?.public_id) {
      await deleteSiteSettingsFaviconFromCloudinary(oldFavicon.public_id);
    }
    favicon = {
      public_id: result2.public_id,
      secure_url: result2.secure_url,
    };
  }

  const { title, description, contactEmail, contactPhone } = body;
  const formattedPhone = contactPhone
    ? formatPhoneNumber(contactPhone)
    : undefined;

  const siteSetting = await prisma.siteSetting.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(contactEmail !== undefined && { contactEmail }),
      ...(contactPhone !== undefined && { contactPhone: formattedPhone }),
      ...(logo !== undefined && { logo }),
      ...(favicon !== undefined && { favicon }),
      updatedById: userId,
    },
  });

  return siteSetting;
};

export const toggleActiveSiteSettingsService = async (
  id: string,
  userId: string,
  body?: ToggleActiveBody,
) => {
  const siteSetting = await prisma.siteSetting.findUnique({
    where: { id },
  });

  if (!siteSetting) {
    throw new AppError("Site setting not found", 404);
  }

  if (siteSetting.active) {
    throw new AppError("This site setting is already active", 400);
  }

  if (body?.active === false) {
    throw new AppError(
      "Cannot deactivate a site setting directly. Activate another site setting instead.",
      400,
    );
  }

  const updatedSiteSetting = await prisma.$transaction(async (tx) => {
    await tx.siteSetting.updateMany({
      where: { active: true },
      data: { active: false },
    });

    return tx.siteSetting.update({
      where: { id },
      data: {
        active: true,
        updatedById: userId,
      },
    });
  });

  return updatedSiteSetting;
};

export const deleteSiteSettingsService = async (id: string) => {
  const siteSetting = await prisma.siteSetting.findUnique({
    where: { id },
  });

  if (!siteSetting) {
    throw new AppError("Site setting not found", 404);
  }

  const totalCount = await prisma.siteSetting.count();
  if (totalCount <= 1) {
    throw new AppError("Cannot delete the only site setting", 400);
  }

  if (siteSetting.active) {
    throw new AppError(
      "Cannot delete an active site setting. Please activate another site setting before deleting this one.",
      400,
    );
  }

  const oldLogo = siteSetting.logo as { public_id?: string } | null;
  if (oldLogo?.public_id) {
    await deleteSiteSettingsLogoFromCloudinary(oldLogo.public_id);
  }

  const oldFavicon = siteSetting.favicon as { public_id?: string } | null;
  if (oldFavicon?.public_id) {
    await deleteSiteSettingsFaviconFromCloudinary(oldFavicon.public_id);
  }

  await prisma.siteSetting.delete({
    where: { id },
  });

  return { id, deleted: true };
};

export const deleteSiteSettingsLogoService = async (
  id: string,
  userId: string,
) => {
  const siteSetting = await prisma.siteSetting.findUnique({
    where: { id },
  });

  if (!siteSetting) {
    throw new AppError("Site setting not found", 404);
  }

  const oldLogo = siteSetting.logo as { public_id?: string } | null;
  if (oldLogo?.public_id) {
    await deleteSiteSettingsLogoFromCloudinary(oldLogo.public_id);
  }

  const updated = await prisma.siteSetting.update({
    where: { id },
    data: {
      logo: Prisma.DbNull,
      updatedById: userId,
    },
  });

  return updated;
};

export const deleteSiteSettingsFaviconService = async (
  id: string,
  userId: string,
) => {
  const siteSetting = await prisma.siteSetting.findUnique({
    where: { id },
  });

  if (!siteSetting) {
    throw new AppError("Site setting not found", 404);
  }

  const oldFavicon = siteSetting.favicon as { public_id?: string } | null;
  if (oldFavicon?.public_id) {
    await deleteSiteSettingsFaviconFromCloudinary(oldFavicon.public_id);
  }

  const updated = await prisma.siteSetting.update({
    where: { id },
    data: {
      favicon: Prisma.DbNull,
      updatedById: userId,
    },
  });

  return updated;
};

