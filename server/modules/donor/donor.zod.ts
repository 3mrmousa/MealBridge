import z from "zod";

export const getMyDonationsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().optional(),
    limit: z.coerce.number().int().optional(),
  }),
});

export const getDonationByIdSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const createDonationSchema = z.object({
  body: z.object({
    title: z.string().min(5, "Title is required"),
    description: z.string().min(10, "Description is required"),
    foodType: z.string().min(1, "Food Type is required"),
    quantity: z.number().min(1, "Quantity is required"),
    unit: z.string().min(1, "Unit is required"),
    address: z.string().min(1, "Address is required"),
    availableFrom: z.coerce.date({ error: "availableFrom Date is required" }),
    availableUntil: z.coerce.date({ error: "availableTo Date is required" }),
    expirationDate: z.coerce.date({ error: "expirationDate Date is required" }),
  }),
});

export const updateDonationSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    title: z
      .string()
      .min(5, "Title must be at least 5 characters long")
      .optional(),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters long")
      .optional(),
    foodType: z.string().min(1, "Food Type is required").optional(),
    quantity: z.number().min(1, "Quantity is required").optional(),
    unit: z.string().min(1, "Unit is required").optional(),
    address: z.string().min(1, "Address is required").optional(),
    availableFrom: z.coerce
      .date({ error: "availableFrom Date is required" })
      .optional(),
    availableUntil: z.coerce
      .date({ error: "availableTo Date is required" })
      .optional(),
    expirationDate: z.coerce
      .date({ error: "expirationDate Date is required" })
      .optional(),
  }),
});

export const onlyIdParamSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const idWithPangitinationRequestsSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  query: z.object({
    page: z.coerce.number().int().optional(),
    limit: z.coerce.number().int().optional(),
  }),
});
export const idWithPangitinationSingleRequestSchema = z.object({
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

export type GetMyDonationsQuery = z.infer<typeof getMyDonationsSchema>["query"];
export type GetDonationByIdParams = z.infer<
  typeof getDonationByIdSchema
>["params"];
export type CreateDonationBody = z.infer<typeof createDonationSchema>["body"];
export type UpdateDonationParams = z.infer<
  typeof updateDonationSchema
>["params"];
export type UpdateDonationBody = z.infer<typeof updateDonationSchema>["body"];
export type OnlyIdParamParams = z.infer<typeof onlyIdParamSchema>["params"];

export type IdWithPangitinationRequestsParams = z.infer<
  typeof idWithPangitinationRequestsSchema
>["params"];
export type IdWithPangitinationRequestsQuery = z.infer<
  typeof idWithPangitinationRequestsSchema
>["query"];

export type IdWithPangitinationSingleRequestParams = z.infer<
  typeof idWithPangitinationSingleRequestSchema
>["params"];
export type AcceptRequestParams = z.infer<typeof acceptRequestSchema>["params"];
export type RejectRequestParams = z.infer<typeof rejectRequestSchema>["params"];
