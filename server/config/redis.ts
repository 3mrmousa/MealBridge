import { Redis } from "ioredis";
import AppError from "../utils/errors/AppError.js";

if (!process.env.REDIS_URL) {
  throw new AppError("REDIS_URL not found in environment variables", 500);
}

const redis = new Redis(process.env.REDIS_URL);

redis.on("connect", () => {
  console.log("Redis client connected");
});

redis.on("error", (err) => {
  console.error("Redis client error", err.message);
});

export default redis;
