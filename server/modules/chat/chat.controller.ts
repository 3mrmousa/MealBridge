import type { Request, Response } from "express";
import {
  getUserConversations,
  getConversationMessages,
} from "./chat.service.js";
import type {
  GetMessagesParams,
  GetMessagesQuery,
} from "./chat.zod.js";
import asyncHandler from "../../utils/errors/asyncHandler.js";
import type { AuthRequest } from "../../utils/types/AuthRequest.js";

export const listConversations = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const conversations = await getUserConversations(userId!);
    res.status(200).json({
      success: true,
      data: conversations,
    });
  },
);

export const getMessages = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const params = req.params as GetMessagesParams;
    const query = req.query as unknown as GetMessagesQuery;
    const userId = req.user?.id;
    const messages = await getConversationMessages(
      params.id,
      userId!,
      query.cursor,
      query.limit,
    );
    res.status(200).json({
      success: true,
      data: messages,
    });
  },
);
