import "dotenv/config";
import express from "express";
import type { NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import AppError from "./utils/errors/AppError.js";
import prisma from "./database/index.js";
import { connectRedis } from "./config/redis.js";
import { z } from "zod";
import authRouter from "./modules/auth/auth.route.js";
import userRouter from "./modules/user/user.route.js";
import adminRouter from "./modules/admin/admin.route.js";
import { createServer } from "http";
import { initSocketServer } from "./utils/socket/socket.js";
import notificationRouter from "./modules/notification/notification.route.js";
import reportRouter from "./modules/report/report.route.js";
import donorRouter from "./modules/donor/donor.route.js";
import recipientRouter from "./modules/recipient/recipient.route.js";
import volunteerRouter from "./modules/volunteer/volunteer.route.js";
import chatRouter from "./modules/chat/chat.route.js";

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.ADMIN_CLIENT_URL,
  "http://localhost:3001",
  "http://localhost:3002",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(helmet());
app.use(cookieParser());
app.use(express.json({ limit: "5mb" }));

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/reports", reportRouter);
app.use("/api/donors", donorRouter);
app.use("/api/recipients", recipientRouter);
app.use("/api/volunteers", volunteerRouter);
app.use("/api/chats", chatRouter);

app.use((req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Route : ${req.originalUrl} not found`, 404));
});

app.use(
  (
    err: AppError | z.ZodError,
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        status: "fail",
        statusCode: 400,
        message: "Validation Failed",
        errors: err.issues,
      });
    }

    console.error("unhandled error: ", err);

    const statusCode = err.statusCode || 500;
    const status = err.status || "error";
    const message = err.message || "Internal server error";
    const errors = err.errors || [];

    res.status(statusCode).json({
      status,
      statusCode,
      message,
      errors,
    });
  },
);

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log("🟢 Connected to PostgreSQL database successfully.");

    await connectRedis();

    const httpServer = createServer(app);
    initSocketServer(httpServer);

    httpServer.listen(process.env.PORT, () => {
      console.log(`🚀 Server is running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("🔴 Failed to connect to the database:", error);
    process.exit(1);
  }
};

export { app };

if (process.env.NODE_ENV !== "test") {
  startServer();
}
