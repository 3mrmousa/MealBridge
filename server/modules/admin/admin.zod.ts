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
});

export type GetSingleUserByIdInput = z.infer<
  typeof getSingleUserByIdSchema
>["params"];

export type toggleUserVerificationStatusInput = z.infer<
  typeof toggleUserVerificationStatusSchema
>["params"] &
  z.infer<typeof toggleUserVerificationStatusSchema>["body"];

export type toggleUserBlockStatusInput = z.infer<
  typeof toggleUserBlockStatusSchema
>["params"];
