import z from "zod";

export const markAsReadSchema = z.object({
  params: z.object({
    notificationId: z.string().trim().uuid({
      message: "Invalid notification ID",
    }),
  }),
});

export type MarkAsReadInput = z.infer<typeof markAsReadSchema>["params"];
