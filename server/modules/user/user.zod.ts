import { z } from "zod";
import {
  DonorOrganizationType,
  RecipientOrganizationType,
  VolunteerType,
  TransportType,
} from "@prisma/client";

// Donor Profile Schema
export const updateDonorProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
  profilePicture: z.string().url().optional(),
  organizationName: z.string().min(2).optional(),
  organizationType: z.nativeEnum(DonorOrganizationType).optional(),
  address: z.string().min(5).optional(),
  verificationDocument: z.string().url().optional(),
});

// Recipient Profile Schema
export const updateRecipientProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
  profilePicture: z.string().url().optional(),
  organizationName: z.string().min(2).optional(),
  organizationType: z.nativeEnum(RecipientOrganizationType).optional(),
  address: z.string().min(5).optional(),
  verificationDocument: z.string().url().optional(),
});

// Volunteer Profile Schema
export const updateVolunteerProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
  profilePicture: z.string().url().optional(),
  address: z.string().min(5).optional(),
  type: z.nativeEnum(VolunteerType).optional(),
  transportType: z.nativeEnum(TransportType).optional(),
  availabilityStatus: z.boolean().optional(),
  verificationDocument: z.string().url().optional(),
});

export const deleteImageSchema = z.object({
  public_id: z.string(),
});

export type UpdateDonorInput = z.infer<typeof updateDonorProfileSchema>;
export type UpdateRecipientInput = z.infer<typeof updateRecipientProfileSchema>;
export type UpdateVolunteerInput = z.infer<typeof updateVolunteerProfileSchema>;
export type DeleteImageInput = z.infer<typeof deleteImageSchema>;