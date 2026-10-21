import type { Request, Response } from "express";
import {
  getUserConversations,
  getConversationMessages,
} from "./chat.service.js";
import type {
  GetMessagesBody,
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
    const query = req.query as GetMessagesQuery;
    const body = req.body as GetMessagesBody;
    const userId = req.user?.id;
    const messages = await getConversationMessages(
      params.id,
      userId!,
      query.cursor,
      body.limit,
    );
    res.status(200).json({
      success: true,
      data: messages,
    });
  },
);
