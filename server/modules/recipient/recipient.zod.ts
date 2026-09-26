import { DonationRequestStatus } from "@prisma/client";
import z from "zod";

export const getMyDonationRequestsSchema = z.object({
  query: z.object({
    limit: z.coerce.number().optional(),
    page: z.coerce.number().optional(),
    status: z.nativeEnum(DonationRequestStatus).optional(),
    sortBy: z.enum(["createdAt"]).optional(),
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
    message: z.string().optional(),
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
    message: z.string().optional(),
  }),
});

export const deleteDonationRequestSchema = z.object({
  params: z.object({
    id: z.string(),
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

export type DeleteDonationRequestParams = z.infer<
  typeof deleteDonationRequestSchema
>["params"];
