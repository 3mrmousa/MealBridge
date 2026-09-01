import { z } from "zod";
import { Role } from "../auth/auth.types.js";

export const getSingleUserByIdSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const toggleUserVerificationStatusSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    role: z.nativeEnum(Role),
  }),
});

export const toggleUserBlockStatusSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    reason: z.string().min(1, "Reason is required"),
    message: z.string().min(1, "Message is required"),
  }),
});

export const toggleUserUnBlockStatusSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    message: z.string().min(1, "Message is required"),
  }),
});

export const createManagerSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(1, "Phone is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  }),
});

export const updateManagerSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    name: z.string().min(1, "Name is required").optional(),
    email: z.string().email("Invalid email").optional(),
    phone: z.string().min(1, "Phone is required").optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .optional(),
  }),
});

export const deleteManagerSchema = z.object({
  params: z.object({
    id: z.string()
  })
})

export type createManagerInput = z.infer<typeof createManagerSchema>["body"];
export type updateManagerInput = z.infer<typeof updateManagerSchema>["params"] &
  z.infer<typeof updateManagerSchema>["body"];
export type deleteManagerInput = z.infer<typeof deleteManagerSchema>["params"];

export type GetSingleUserByIdInput = z.infer<
  typeof getSingleUserByIdSchema
>["params"];

export type toggleUserVerificationStatusInput = z.infer<
  typeof toggleUserVerificationStatusSchema
>["params"] &
  z.infer<typeof toggleUserVerificationStatusSchema>["body"];

export type toggleUserBlockStatusInput = z.infer<
  typeof toggleUserBlockStatusSchema
>["params"] &
  z.infer<typeof toggleUserBlockStatusSchema>["body"];

export type toggleUserUnBlockStatusInput = z.infer<
  typeof toggleUserUnBlockStatusSchema
>["params"] &
  z.infer<typeof toggleUserUnBlockStatusSchema>["body"];
