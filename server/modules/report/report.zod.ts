import { ReportStatus } from "@prisma/client";
import z from "zod";

export const createReportSchema = z.object({
  body: z.object({
    reportedUserId: z
      .string()
      .trim()
      .uuid({
        message: "Invalid reported user ID",
      })
      .optional(),

    title: z.string().min(5, "Title minimum chars are 5"),

    description: z.string().min(10, "Description minimum chars are 10"),
  }),
});

export const singleReportIdSchema = z.object({
  params: z.object({
    id: z.string().trim().uuid({
      message: "Invalid report ID",
    }),
  }),
});

export const handleReportSchema = z.object({
  params: z.object({
    id: z.string().trim().uuid({
      message: "Invalid report ID",
    }),
  }),
  body: z.object({
    status: z.nativeEnum(ReportStatus),
    message: z.string().optional(),
  }),
});

export type CreateReportInput = z.infer<typeof createReportSchema>["body"];
export type SingleReportIdInput = z.infer<typeof singleReportIdSchema>["params"];
export type HandleReportParams = z.infer<typeof handleReportSchema>["params"];
export type HandleReportBody = z.infer<typeof handleReportSchema>["body"];
export type HandleReportInput = HandleReportParams & HandleReportBody;
