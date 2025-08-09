import Redis from "ioredis";
import { NextRequest } from "next/server";

const redis = new Redis(process.env.REDIS_URL || "");

const RATE_LIMIT_LIMIT = 5;
const RATE_LIMIT_DURATION = 24 * 60 * 60; // 24 hours in seconds

export async function checkRateLimit(req: NextRequest) {
  if (!process.env.REDIS_URL) {
    // If Redis is not configured, we'll bypass the rate limit.
    // This is useful for local development without Redis.
    console.warn("REDIS_URL not found, rate limiting is disabled.");
    return { limited: false, count: 0 };
  }

  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const key = `rate_limit:${ip}`;

  const count = await redis.incr(key);

  if (count === 1) {
    // If it's the first request, set the expiration.
    await redis.expire(key, RATE_LIMIT_DURATION);
  }

  return {
    limited: count > RATE_LIMIT_LIMIT,
    count,
  };
}
