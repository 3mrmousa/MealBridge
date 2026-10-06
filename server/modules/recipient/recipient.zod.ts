import { DonationRequestStatus, ClaimStatus } from "@prisma/client";
import z from "zod";

export const getMyDonationRequestsSchema = z.object({
  query: z.object({
    limit: z.coerce.number().optional(),
    page: z.coerce.number().optional(),
    status: z.nativeEnum(DonationRequestStatus).optional(),
    sortBy: z.enum(["createdAt", "updatedAt"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
});

export const getMyDonationRequestByIdSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const createDonationRequestSchema = z.object({
  body: z.object({
    donationId: z.uuid(),
    quantityRequested: z.number().min(1, "Quantity requested is required"),
    deliveryAddress: z.string().min(1, "Delivery address is required"),
    message: z.string().min(1, "Message is required"),
  }),
});

export const updateDonationRequestSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    quantityRequested: z
      .number()
      .min(1, "Quantity requested is required")
      .optional(),
    deliveryAddress: z.string().min(1, "Delivery address is required").optional(),
    message: z.string().optional(),
  }),
});

export const cancelDonationRequestSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

// Donations Routes (Recipient Perspective) Schemas

export const getAllDonationsSchema = z.object({
  query: z.object({
    limit: z.coerce.number().optional(),
    page: z.coerce.number().optional(),
    sortBy: z.enum(["createdAt", "updatedAt"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
});

export const getDonationByIdSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

// Donation Claim Routes (Recipient Perspective) Schemas

export const getClaimsSchema = z.object({
  query: z.object({
    limit: z.coerce.number().optional(),
    page: z.coerce.number().optional(),
    status: z.nativeEnum(ClaimStatus).optional(),
    sortBy: z.enum(["createdAt", "updatedAt"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
});

export const getClaimByIdSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const cancelClaimSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});
export const cancleClaimSchema = cancelClaimSchema;

// Delivery Request Routes (Recipient Perspective) Schemas

export const createDeliveryRequestSchema = z.object({
  body: z.object({
    donationClaimId: z.string().uuid("Invalid donation claim ID"),
    volunteerId: z.string().uuid("Invalid volunteer ID"),
    notes: z.string().optional(),
  }),
});

export const getDeliveryRequestsSchema = z.object({
  query: z.object({
    limit: z.coerce.number().optional(),
    page: z.coerce.number().optional(),
    sortBy: z.enum(["createdAt", "updatedAt"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
});

export type GetMyDonationRequestsQuery = z.infer<
  typeof getMyDonationRequestsSchema
>["query"];

export type GetMyDonationRequestByIdParams = z.infer<
  typeof getMyDonationRequestByIdSchema
>["params"];

export type CreateDonationRequestBody = z.infer<
  typeof createDonationRequestSchema
>["body"];

export type UpdateDonationRequestBody = z.infer<
  typeof updateDonationRequestSchema
>["body"];

export type UpdateDonationRequestParams = z.infer<
  typeof updateDonationRequestSchema
>["params"];

export type CancelDonationRequestParams = z.infer<
  typeof cancelDonationRequestSchema
>["params"];

// Donations Routes (Recipient Perspective) Types

export type GetAllDonationsQuery = z.infer<
  typeof getAllDonationsSchema
>["query"];

export type GetDonationByIdParams = z.infer<
  typeof getDonationByIdSchema
>["params"];

// Donation Claim Routes (Recipient Perspective) Types

export const getVolunteersSchema = z.object({
  query: z.object({
    limit: z.coerce.number().optional(),
    page: z.coerce.number().optional(),
    sortBy: z.enum(["createdAt", "updatedAt"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
});

export const getVolunteerByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid volunteer ID"),
  }),
});

export type GetClaimsQuery = z.infer<typeof getClaimsSchema>["query"];

export type GetClaimByIdParams = z.infer<typeof getClaimByIdSchema>["params"];

export type CancelClaimParams = z.infer<typeof cancelClaimSchema>["params"];
export type CancleClaimParams = CancelClaimParams;

// Delivery Request Routes (Recipient Perspective) Types

export type CreateDeliveryRequestBody = z.infer<typeof createDeliveryRequestSchema>["body"];
export type GetDeliveryRequestsQuery = z.infer<typeof getDeliveryRequestsSchema>["query"];

export type GetVolunteersQuery = z.infer<typeof getVolunteersSchema>["query"];
export type GetVolunteerByIdParams = z.infer<typeof getVolunteerByIdSchema>["params"];
