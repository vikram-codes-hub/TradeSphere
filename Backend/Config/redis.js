import Redis from "ioredis";

let redisClient     = null;
let bullmqConfig    = null;

/* ── Parse redis URL into host/port/password for BullMQ ─── */
const parseRedisUrl = (url) => {
  try {
    // redis://username:password@host:port
    const u        = new URL(url);
    return {
      host:                 u.hostname,
      port:                 parseInt(u.port) || 6379,
      password:             u.password || undefined,
      username:             u.username || "default",
      maxRetriesPerRequest: null,
      enableReadyCheck:     false,
      keepAlive:            10000,
      connectTimeout:       30000,
      retryStrategy: (times) => {
        if (times > 20) return null;
        return Math.min(times * 500, 5000);
      },
    };
  } catch {
    // fallback to env vars if URL parse fails
    return {
      host:                 process.env.REDIS_HOST     || "localhost",
      port:                 parseInt(process.env.REDIS_PORT) || 6379,
      password:             process.env.REDIS_PASSWORD || undefined,
      username:             process.env.REDIS_USERNAME || "default",
      maxRetriesPerRequest: null,
      enableReadyCheck:     false,
      keepAlive:            10000,
      connectTimeout:       30000,
      retryStrategy: (times) => Math.min(times * 500, 5000),
    };
  }
};

export const initRedis = async () => {
  try {
    const redisUrl = process.env.REDIS_URL;

    // Main client via URL
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck:     false,
      keepAlive:            10000,
      connectTimeout:       30000,
      retryStrategy: (times) => Math.min(times * 500, 5000),
    });

    redisClient.on("error",   (err) => console.error("❌ Redis Client Error:", err.message));
    redisClient.on("connect", ()    => console.log("✅ Redis connected"));

    await redisClient.ping();
    console.log("✅ Redis ping successful");

    // BullMQ config — parsed from URL so port is never NaN
    bullmqConfig = parseRedisUrl(redisUrl);

    return { redisClient, redisConnection: bullmqConfig };

  } catch (err) {
    console.error("❌ Redis connection failed:", err.message);
    throw err;
  }
};

export const getRedisClient     = () => redisClient;
export const getRedisConnection = () => bullmqConfig;