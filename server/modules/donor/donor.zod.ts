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
    availableTo: z.coerce.date({ error: "availableTo Date is required" }),
    expirationDate: z.coerce.date({ error: "expirationDate Date is required" }),
  }),
});

export const updateDonationSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    title: z.string().min(5, "Title must be at least 5 characters long"),
    description: z.string().min(10, "Description must be at least 10 characters long"),
    foodType: z.string().min(1, "Food Type is required"),
    quantity: z.number().min(1, "Quantity is required"),
    unit: z.string().min(1, "Unit is required"),
    address: z.string().min(1, "Address is required"),
    availableFrom: z.coerce.date({ error: "availableFrom Date is required" }),
    availableTo: z.coerce.date({ error: "availableTo Date is required" }),
    expirationDate: z.coerce.date({ error: "expirationDate Date is required" }),
  }),
});

export type GetMyDonationsInput = z.infer<typeof getMyDonationsSchema>["query"];
export type GetDonationByIdInput = z.infer<
  typeof getDonationByIdSchema
>["params"];
export type CreateDonationInput = z.infer<typeof createDonationSchema>["body"];
export type UpdateDonationParams = z.infer<typeof updateDonationSchema>["params"];
export type UpdateDonationBody = z.infer<typeof updateDonationSchema>["body"];
