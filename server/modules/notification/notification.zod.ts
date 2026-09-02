import z from "zod";

export const markAsReadSchema = z.object({
  params: z.object({
    notificationId: z
      .uuid({
        message: "Invalid notification ID",
      })
      .trim(),
  }),
});

export type MarkAsReadInput = z.infer<typeof markAsReadSchema>["params"];
