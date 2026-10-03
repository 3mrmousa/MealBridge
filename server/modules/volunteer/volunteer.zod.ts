import { PickupRequestStatus } from "@prisma/client";
import z from "zod";

// Pickup Routes (Volunteer Perspective)

export const getAllPickupRequestsSchema = z.object({
  query: z.object({
    sortBy: z.enum(["createdAt", "updatedAt"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    status: z.nativeEnum(PickupRequestStatus).optional(),
    limit: z.coerce.number().int().positive().optional(),
    page: z.coerce.number().int().positive().optional(),
  }),
});

export const singleIdRequestSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export type GetAllPickupRequestsQuery = z.infer<
  typeof getAllPickupRequestsSchema
>["query"];
export type SingleIdRequestParams = z.infer<
  typeof singleIdRequestSchema
>["params"];
