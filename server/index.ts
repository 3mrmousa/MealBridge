import "dotenv/config";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import AppError from "./utils/errors/AppError.js";
import prisma from "./database/index.js";
import { z } from "zod";
import authRouter from "./modules/auth/auth.route.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3001",
    credentials: true,
  }),
);
app.use(helmet());
app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRouter);

app.use((req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Route : ${req.originalUrl} not found`, 404));
});

app.use(
  (err: AppError | z.ZodError, req: Request, res: Response, next: NextFunction) => {
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
});

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log("🟢 Connected to PostgreSQL database successfully.");

    app.listen(process.env.PORT, () => {
      console.log(`🚀 Server is running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("🔴 Failed to connect to the database:", error);
    process.exit(1);
  }
};

startServer();
