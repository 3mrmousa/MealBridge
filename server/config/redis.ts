import { Redis } from "ioredis";
import AppError from "../utils/errors/AppError.js";

const isTest = process.env.NODE_ENV === "test";

if (!process.env.REDIS_URL && !isTest) {
  throw new AppError("REDIS_URL not found in environment variables", 500);
}

class MockRedis {
  private store = new Map<string, string>();
  on() {
    return this;
  }
  async connect() {}
  async disconnect() {}
  async quit() {}
  async set(key: string, value: any, ..._args: any[]) {
    this.store.set(key, String(value));
    return "OK";
  }
  async get(key: string) {
    return this.store.get(key) ?? null;
  }
  async del(key: string) {
    return this.store.delete(key) ? 1 : 0;
  }
}

const redis: Redis = isTest
  ? (new MockRedis() as unknown as Redis)
  : new Redis(process.env.REDIS_URL!, {
      lazyConnect: true,
    });

if (!isTest) {
  redis.on("error", (err: Error) => {
    console.error("Redis client error", err.message);
  });
}

export const connectRedis = async () => {
  if (isTest) return;
  await redis.connect();
  console.log("🟢 Redis client connected successfully.");
};

export default redis;
