import { Server as SocketIoServer } from "socket.io";
import type { Server as HttpServer } from "http";
import { parseCookie } from "cookie";
import jwt from "jsonwebtoken";
import prisma from "../../database/index.js";
import { Role } from "@prisma/client";

let io: SocketIoServer | undefined;

const userRoom = (userId: string) => `user:${userId}`;
const roleRoom = (role: Role) => `role:${role}`;

export const initSocketServer = (httpServer: HttpServer): SocketIoServer => {
  const socketServer = new SocketIoServer(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  io = socketServer;

  socketServer.use(async (socket, next) => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error("JWT_SECRET is not configured.");
      return next(new Error("Socket authentication unavailable"));
    }

    let token: string | undefined;

    try {
      const cookies = parseCookie(socket.handshake.headers.cookie || "");
      token = cookies.access_token;
    } catch {
      console.error("Failed to parse cookies.");
      return next(new Error("Unauthorized"));
    }

    if (!token) {
      console.error("No token found in cookies.");
      return next(new Error("Unauthorized"));
    }

    let userId: string;
    let tokenVersion: number;

    try {
      const decodedToken = jwt.verify(token, secret);

      if (
        typeof decodedToken !== "object" ||
        decodedToken === null ||
        typeof decodedToken.userId !== "string" ||
        typeof decodedToken.tokenVersion !== "number"
      ) {
        console.error("Invalid token.");
        return next(new Error("Unauthorized"));
      }

      userId = decodedToken.userId;
      tokenVersion = decodedToken.tokenVersion;
    } catch {
      console.error("Invalid token.");
      return next(new Error("Unauthorized"));
    }

    try {
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          tokenVersion: true,
          role: true,
          isBlocked: true,
        },
      });

      if (!user) {
        console.error("User not found.");
        return next(new Error("Unauthorized"));
      }

      if (user.tokenVersion !== tokenVersion) {
        console.error("Token version mismatch.");
        return next(new Error("Session expired. Please login again."));
      }

      if (user.isBlocked) {
        console.error("User is blocked.");
        return next(
          new Error(
            "Your account has been blocked. Please contact support for more information.",
          ),
        );
      }

      socket.data.userId = userId;
      socket.data.role = user.role;

      return next();
    } catch {
      console.error("Failed to fetch user.");
      return next(new Error("Unauthorized"));
    }
  });

  socketServer.on("connection", async (socket) => {
    const userId = socket.data.userId as string;
    const role = socket.data.role as Role;

    try {
      await socket.join(userRoom(userId));
      await socket.join(roleRoom(role));
    } catch (err) {
      console.error("Failed to join rooms: ", err);
      socket.disconnect();
      return;
    }

    console.log("User connected: ", userId);

    socket.on("disconnect", (reason) => {
      console.log(`User disconnected: ${userId} because ${reason}`);
    });

    socket.on("error", (err: any) => {
      console.error(`Socket error for user ${userId}:`, err);
      socket.disconnect();
    });
  });

  return socketServer;
};

export const getIO = () => {
  if (!io) {
    if (process.env.NODE_ENV === "test") {
      return {
        to: () => ({ emit: () => true }),
        emit: () => true,
      } as any;
    }
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
  getIO().to(userRoom(userId)).emit(eventName, data);
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
  getIO()
    .to(roleRoom(Role.ADMIN))
    .to(roleRoom(Role.MANAGER))
    .emit(eventName, data);
};
