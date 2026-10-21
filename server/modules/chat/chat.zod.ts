import { z } from "zod";

export const getMessagesSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  query: z.object({
    cursor: z.string().uuid().optional(),
  }),
  body: z.object({
    limit: z.number().optional(),
  })
});

export type GetMessagesParams = z.infer<typeof getMessagesSchema>["params"];
export type GetMessagesQuery = z.infer<typeof getMessagesSchema>["query"];
export type GetMessagesBody = z.infer<typeof getMessagesSchema>["body"];
