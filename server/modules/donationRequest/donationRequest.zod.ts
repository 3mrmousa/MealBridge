import z from "zod";

export const getDonationRequestsSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  query: z.object({
    page: z.coerce.number().int().optional(),
    limit: z.coerce.number().int().optional(),
  }),
});

export const getSingleDonationRequestSchema = z.object({
  params: z.object({
    id: z.string(),
    reqId: z.string(),
  }),
});

export const acceptRequestSchema = z.object({
  params: z.object({
    id: z.string(),
    reqId: z.string(),
  }),
});

export const rejectRequestSchema = z.object({
  params: z.object({
    id: z.string(),
    reqId: z.string(),
  }),
});

export type GetDonationRequestsParams = z.infer<
  typeof getDonationRequestsSchema
>["params"];
export type GetDonationRequestsQuery = z.infer<
  typeof getDonationRequestsSchema
>["query"];

export type GetSingleDonationRequestParams = z.infer<
  typeof getSingleDonationRequestSchema
>["params"];
export type AcceptRequestParams = z.infer<typeof acceptRequestSchema>["params"];
export type RejectRequestParams = z.infer<typeof rejectRequestSchema>["params"];
