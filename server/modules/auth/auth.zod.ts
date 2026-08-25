import { z } from "zod";
import { Role } from "./auth.types.js";

// Register Schemas
export const registerRequestSchema = z.object({
  body: z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    phone: z.string().min(10, { message: "Phone number is too short" }),
    role: z.enum(Role, {
      message: "Invalid role selected",
    }),
  }),
});

export const registerValidateSchema = z.object({
  body: z.object({
    email: z.email({ message: "Invalid email address" }),
    otp: z.string().length(4, { message: "OTP must be 4 digits" }),
  }),
});

// Login Schema
export const loginSchema = z.object({
  body: z.object({
    email: z.email({ message: "Invalid email address" }),
    password: z.string().min(1, { message: "Password is required" }),
  }),
});

// Export inferred types
export type RegisterRequestInput = z.infer<typeof registerRequestSchema>["body"];
export type RegisterValidateInput = z.infer<typeof registerValidateSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
