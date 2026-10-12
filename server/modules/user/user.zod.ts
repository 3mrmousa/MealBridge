import { z } from "zod";
import {
  DonorOrganizationType,
  RecipientOrganizationType,
  VolunteerType,
  TransportType,
} from "@prisma/client";

// Donor Profile Schema
export const createDonorProfileSchema = z.object({
  body: z.object({
    organizationName: z.string().min(2),
    organizationType: z.nativeEnum(DonorOrganizationType),
    otherOrganizationType: z.string().min(2).optional(),
    address: z.string().min(5),
  }),
});
export const updateDonorProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    phone: z.string().min(10).optional(),
    organizationName: z.string().min(2).optional(),
    organizationType: z.nativeEnum(DonorOrganizationType).optional(),
    otherOrganizationType: z.string().min(2).optional(),
    address: z.string().min(5).optional(),
  }),
});

// Recipient Profile Schema
export const createRecipientProfileSchema = z.object({
  body: z.object({
    organizationName: z.string().min(2),
    organizationType: z.nativeEnum(RecipientOrganizationType),
    otherOrganizationType: z.string().min(2).optional(),
    address: z.string().min(5),
  }),
});

export const updateRecipientProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    phone: z.string().min(10).optional(),
    organizationName: z.string().min(2).optional(),
    organizationType: z.nativeEnum(RecipientOrganizationType).optional(),
    otherOrganizationType: z.string().min(2).optional(),
    address: z.string().min(5).optional(),
  }),
});

// Volunteer Profile Schema
export const createVolunteerProfileSchema = z.object({
  body: z.object({
    address: z.string().min(5),
    type: z.nativeEnum(VolunteerType),
    transportType: z.nativeEnum(TransportType),
    availabilityStatus: z.boolean().optional(),
  }),
});
export const updateVolunteerProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    phone: z.string().min(10).optional(),
    address: z.string().min(5).optional(),
    type: z.nativeEnum(VolunteerType).optional(),
    transportType: z.nativeEnum(TransportType).optional(),
    availabilityStatus: z.boolean().optional(),
  }),
});

export const deleteImageSchema = z.object({
  body: z.object({
    public_id: z.string(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8),
  }),
});

export const ChangeEmailRequestSchema = z.object({
  body: z.object({
    newEmail: z.email(),
  }),
});

export const otpSchema = z.object({
  body: z.object({
    otp: z.string().length(6, { message: "OTP must be 6 digits" }),
  }),
});

export const changePhoneSchema = z.object({
  body: z.object({
    phone: z.string().min(10),
  }),
});

export type CreateDonorInput = z.infer<typeof createDonorProfileSchema>["body"];
export type UpdateDonorInput = z.infer<typeof updateDonorProfileSchema>["body"];
export type CreateRecipientInput = z.infer<
  typeof createRecipientProfileSchema
>["body"];
export type UpdateRecipientInput = z.infer<
  typeof updateRecipientProfileSchema
>["body"];
export type CreateVolunteerInput = z.infer<
  typeof createVolunteerProfileSchema
>["body"];
export type UpdateVolunteerInput = z.infer<
  typeof updateVolunteerProfileSchema
>["body"];
export type DeleteImageInput = z.infer<typeof deleteImageSchema>["body"];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>["body"];
export type ChangeEmailRequestInput = z.infer<
  typeof ChangeEmailRequestSchema
>["body"];
export type OtpInput = z.infer<typeof otpSchema>["body"];
export type ChangePhoneInput = z.infer<typeof changePhoneSchema>["body"];
