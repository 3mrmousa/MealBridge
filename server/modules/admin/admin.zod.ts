import { z } from "zod";
import { Role } from "@prisma/client";

export const getSingleUserByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: "Invalid ID format" }),
  }),
});

export const userAcceptVerificationStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: "Invalid ID format" }),
  }),
  body: z.object({
    role: z.nativeEnum(Role),
  }),
});

export const userRejectVerificationStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: "Invalid ID format" }),
  }),
  body: z.object({
    role: z.nativeEnum(Role),
    rejectReason: z.string().optional(),
  }),
});

export const toggleUserBlockStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: "Invalid ID format" }),
  }),
  body: z.object({
    reason: z.string().min(1, "Reason is required"),
    message: z.string().min(1, "Message is required"),
  }),
});

export const toggleUserUnBlockStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: "Invalid ID format" }),
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
    id: z.string().uuid({ message: "Invalid ID format" }),
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
    id: z.string().uuid({ message: "Invalid ID format" }),
  }),
});

export type createManagerInput = z.infer<typeof createManagerSchema>["body"];
export type updateManagerParams = z.infer<typeof updateManagerSchema>["params"];
export type updateManagerBody = z.infer<typeof updateManagerSchema>["body"];
export type updateManagerInput = updateManagerParams & updateManagerBody;
export type deleteManagerInput = z.infer<typeof deleteManagerSchema>["params"];

export type getSingleUserByIdInput = z.infer<
  typeof getSingleUserByIdSchema
>["params"];

export type userAcceptVerificationStatusParams = z.infer<typeof userAcceptVerificationStatusSchema>["params"];
export type userAcceptVerificationStatusBody = z.infer<typeof userAcceptVerificationStatusSchema>["body"];
// export type userAcceptVerificationStatusInput = userAcceptVerificationStatusParams & userAcceptVerificationStatusBody;

export type userRejectVerificationStatusParams = z.infer<typeof userRejectVerificationStatusSchema>["params"];
export type userRejectVerificationStatusBody = z.infer<typeof userRejectVerificationStatusSchema>["body"];
// export type userRejectVerificationStatusInput = userRejectVerificationStatusParams & userRejectVerificationStatusBody;

export type toggleUserBlockStatusParams = z.infer<typeof toggleUserBlockStatusSchema>["params"];
export type toggleUserBlockStatusBody = z.infer<typeof toggleUserBlockStatusSchema>["body"];
// export type toggleUserBlockStatusInput = toggleUserBlockStatusParams & toggleUserBlockStatusBody;

export type toggleUserUnBlockStatusParams = z.infer<typeof toggleUserUnBlockStatusSchema>["params"];
export type toggleUserUnBlockStatusBody = z.infer<typeof toggleUserUnBlockStatusSchema>["body"];
// export type toggleUserUnBlockStatusInput = toggleUserUnBlockStatusParams & toggleUserUnBlockStatusBody;
