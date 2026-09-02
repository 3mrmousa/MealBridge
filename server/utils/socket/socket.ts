import { Server as SocketIoServer } from "socket.io";
import { Server as HttpServer } from "http";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import AppError from "../errors/AppError.js";

let io: SocketIoServer;

// Map<userId, socketId>
const connectedUsers: Map<string, string> = new Map();

export const initSocketServer = (httpServer: HttpServer) => {
  io = new SocketIoServer(httpServer, {
    cors: {
      origin: "http://localhost:3001",
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers.cookie || "");
      const token = cookies.token;
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

  io.on("connection", (socket) => {
    const userId = socket.data.userId;

    connectedUsers.set(userId, socket.id);
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
  const socketId = connectedUsers.get(userId);
  if (socketId) {
    io.to(socketId).emit(eventName, data);
  }
};
