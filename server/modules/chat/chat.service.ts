import prisma from "../../database/index.js";
import { getIO } from "../../utils/socket/socket.js";
import { ConversationType } from "@prisma/client";
import AppError from "../../utils/errors/AppError.js";
import { createNotificationService } from "../notification/notification.service.js";

export const conversationRoom = (conversationId: string) => {
  return `conversation:${conversationId}`;
};

type ProfileTable = "donorProfile" | "recipientProfile" | "volunteerProfile";

export const resolveUserId = async (
  profileTable: ProfileTable,
  profileId: string,
): Promise<string> => {
  const profile = await (prisma[profileTable] as any).findUnique({
    where: { id: profileId },
    select: { userId: true },
  });

  if (!profile?.userId) throw new AppError("Profile not found", 404);

  return profile.userId;
};

export const createConversationAndNotify = async (
  donationClaimId: string,
  conversationType: ConversationType,
  participantIds: string[],
) => {
  const conversation = await prisma.conversation.upsert({
    where: {
      donationClaimId_conversationType: { donationClaimId, conversationType },
    },
    update: {},
    create: {
      donationClaimId,
      conversationType,
    },
  });

  await prisma.conversationParticipant.createMany({
    data: participantIds.map((id) => ({
      conversationId: conversation.id,
      userId: id,
    })),
    skipDuplicates: true,
  });

  for (const userId of participantIds) {
    getIO().in(`user:${userId}`).socketsJoin(conversationRoom(conversation.id));
  }

  getIO()
    .to(conversationRoom(conversation.id))
    .emit("conversationCreated", conversation);

  await createNotificationService(
    participantIds[0]!,
    "info",
    "New conversation has been created for the donation claim",
  );
  await createNotificationService(
    participantIds[1]!,
    "info",
    "New conversation has been created for the donation claim",
  );

  return conversation;
};

export const lockConversationsForClaim = async (donationClaimId: string) => {
  const conversations = await prisma.conversation.findMany({
    where: { donationClaimId },
  });
  if (conversations.length === 0) return;

  await prisma.conversation.updateMany({
    where: { donationClaimId },
    data: { isLocked: true },
  });

  for (const conversation of conversations) {
    getIO()
      .to(conversationRoom(conversation.id))
      .emit("conversationLocked", { conversationId: conversation.id });
  }
};

export const lockConversationByType = async (
  donationClaimId: string,
  conversationType: ConversationType,
) => {
  const conversation = await prisma.conversation.findUnique({
    where: {
      donationClaimId_conversationType: { donationClaimId, conversationType },
    },
  });
  if (!conversation) return;

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { isLocked: true },
  });

  getIO()
    .to(conversationRoom(conversation.id))
    .emit("conversationLocked", { conversationId: conversation.id });
};

export const markConversationRead = async (
  conversationId: string,
  userId: string,
) => {
  await prisma.conversationParticipant.update({
    where: { conversationId_userId: { conversationId, userId } },
    data: { lastReadAt: new Date() },
  });
};

export const getUserConversations = async (userId: string) => {
  return prisma.conversation.findMany({
    where: { participants: { some: { userId } } },
    include: {
      participants: true,
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });
};

export const getConversationMessages = async (
  conversationId: string,
  userId: string,
  cursor?: string,
  limit = 30,
) => {
  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });

  if (!participant) {
    throw new AppError("You are not part of this conversation", 403);
  }

  return prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "desc" },
    take: limit,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
  });
};
