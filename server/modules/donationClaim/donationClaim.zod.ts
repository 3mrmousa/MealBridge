import z from "zod";

export const getAllDonationClaimsSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  query: z.object({
    page: z.coerce.number().int().optional(),
    limit: z.coerce.number().int().optional(),
  }),
});

export const getSingleDonationClaimSchema = z.object({
  params: z.object({
    id: z.string(),
    claimId: z.string(),
  }),
});

export type GetAllDonationClaimsParams = z.infer<typeof getAllDonationClaimsSchema>["params"];
export type GetAllDonationClaimsQuery = z.infer<typeof getAllDonationClaimsSchema>["query"];
export type GetSingleDonationClaimParams = z.infer<typeof getSingleDonationClaimSchema>["params"];
