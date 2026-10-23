import { z } from "zod";
import { egyptianPhoneSchema } from "../../utils/phoneNumber/formatPhoneNumber.js";

export const singleSiteSettingIdSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: "Invalid site setting ID" }),
  }),
});

export const createSiteSettingsSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title must be at least 3 characters long"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters long"),
    contactEmail: z
      .string()
      .email({ message: "Invalid email address" })
      .optional(),
    contactPhone: egyptianPhoneSchema.optional(),
  }),
});

export const toggleActiveSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: "Invalid site setting ID" }),
  }),
  body: z
    .object({
      active: z.boolean().default(true),
    })
    .default({ active: true }),
});

export const updateSiteSettingsSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: "Invalid site setting ID" }),
  }),
  body: z.object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters long")
      .optional(),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters long")
      .optional(),
    contactEmail: z
      .string()
      .email({ message: "Invalid email address" })
      .optional(),
    contactPhone: egyptianPhoneSchema.optional(),
  }),
});

export type SingleSiteSettingIdParams = z.infer<
  typeof singleSiteSettingIdSchema
>["params"];

export type CreateSiteSettingsBody = z.infer<typeof createSiteSettingsSchema>["body"];

export type UpdateSiteSettingsBody = z.infer<
  typeof updateSiteSettingsSchema
>["body"];
export type UpdateSiteSettingsParams = z.infer<
  typeof updateSiteSettingsSchema
>["params"];

export type ToggleActiveParams = z.infer<typeof toggleActiveSchema>["params"];
export type ToggleActiveBody = z.infer<typeof toggleActiveSchema>["body"];

