import { Server as SocketIoServer } from "socket.io";
import { Server as HttpServer } from "http";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import AppError from "../errors/AppError.js";
import prisma from "../../database/index.js";
import { Role } from "@prisma/client";

let io: SocketIoServer;

// Map<userId, socketId>
const connectedUsers: Map<string, { socketId: string; role: Role }> = new Map();

export const initSocketServer = (httpServer: HttpServer) => {
  io = new SocketIoServer(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers.cookie || "");
      const token = cookies.access_token;
      if (!token) {
        throw new AppError("Unauthorized - No token provided", 401);
      }
      const secret = process.env.JWT_SECRET as string;
      if (!secret) {
        throw new AppError("JWT Secret not configured", 500);
      }
      const decodedToken = jwt.verify(token, secret) as { userId: string };
      socket.data.userId = decodedToken.userId;
      next();
    } catch (error) {
      next(new AppError("Unauthorized", 401));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.data.userId;
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        role: true,
      },
    });
    if (!user) {
      socket.disconnect();
      return;
    }
    connectedUsers.set(userId, {
      socketId: socket.id,
      role: user.role,
    });
    console.log(`🟢 User connected: ${userId}`);

    socket.on("disconnect", () => {
      connectedUsers.delete(userId);
      console.log(`🔴 User disconnected: ${userId}`);
    });
  });
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io is not initialized!");
  }
  return io;
};

export type NotificationType = {
  userId: string;
  sourceReportId?: string | null;
  title: string;
  message: string;
  isRead: boolean;
};

export const sendNotificationToUser = (
  userId: string,
  eventName: string,
  data: NotificationType,
) => {
  const socketId = connectedUsers.get(userId)?.socketId;
  if (socketId) {
    io.to(socketId).emit(eventName, data);
  }
};

export type ReportType = {
  reportedUserId?: string;
  title: string;
  description: string;
};

export const sendReportToSupportTeam = async (
  eventName: string,
  data: ReportType,
) => {
    for (const [, user] of connectedUsers) {
      if (user.role === Role.ADMIN || user.role === Role.MANAGER) {
        io.to(user.socketId).emit(eventName, data);
      }
    }
};
