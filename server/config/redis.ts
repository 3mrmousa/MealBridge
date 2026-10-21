import { Redis } from "ioredis";
import AppError from "../utils/errors/AppError.js";

const isTest = process.env.NODE_ENV === "test";

if (!process.env.REDIS_URL && !isTest) {
  throw new AppError("REDIS_URL not found in environment variables", 500);
}

if (!process.env.REDIS_URL) {
  throw new AppError("Redis URL is not defined", 500);
}

export const redis = new Redis(process.env.REDIS_URL, {
  lazyConnect: true,
});

redis.on("error", (err) => {
  console.error("Redis client error", err.message);
});

export const connectRedis = async () => {
  await redis.connect();
  console.log("🟢 Redis client connected successfully.");
};

export default redis;
