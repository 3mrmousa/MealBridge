import { z } from "zod";

export const getMessagesSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  query: z.object({
    cursor: z.string().uuid().optional(),
    limit: z.coerce.number().int().positive().default(30),
  }),
});

export type GetMessagesParams = z.infer<typeof getMessagesSchema>["params"];
export type GetMessagesQuery = z.infer<typeof getMessagesSchema>["query"];
