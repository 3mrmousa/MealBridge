import { DeliveryStatus, DeliveryRequestStatus, Role } from "@prisma/client";
import z from "zod";

// Delivery Routes (Volunteer Perspective)

export const getAllDeliveriesSchema = z.object({
  query: z.object({
    sortBy: z.enum(["createdAt", "updatedAt"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    status: z.nativeEnum(DeliveryStatus).optional(),
    limit: z.coerce.number().int().positive().optional(),
    page: z.coerce.number().int().positive().optional(),
  }),
});

export const getDeliveryRequestsSchema = z.object({
  query: z.object({
    sortBy: z.enum(["createdAt", "updatedAt"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    status: z.nativeEnum(DeliveryRequestStatus).optional(),
    limit: z.coerce.number().int().positive().optional(),
    page: z.coerce.number().int().positive().optional(),
  }),
});

export const singleIdRequestSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});



export const cancelDeliverySchema = z.object({
  body: z.object({
    reason: z
      .string()
      .min(1, "Reason is required")
      .max(500, "Reason must be at most 500 characters"),
  }),
  params: z.object({
    id: z.string(),
  }),
});

export type GetAllDeliveriesQuery = z.infer<
  typeof getAllDeliveriesSchema
>["query"];
export type GetDeliveryRequestsQuery = z.infer<
  typeof getDeliveryRequestsSchema
>["query"];
export type SingleIdRequestParams = z.infer<
  typeof singleIdRequestSchema
>["params"];
export type CancelDeliveryBody = z.infer<typeof cancelDeliverySchema>["body"];
export type CancelDeliveryIdParams = z.infer<
  typeof cancelDeliverySchema
>["params"];
