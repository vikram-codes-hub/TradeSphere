import Redis from "ioredis";

let redisClient     = null;
let redisConnection = null;

export const initRedis = async () => {
  try {
    // ── ioredis via URL — Redis Cloud handles TLS in the URL itself
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck:     false,
      // NO tls:{} here — the URL already contains auth info
      // adding tls:{} causes "wrong version number" SSL conflict
    });

    redisClient.on("error",   (err) => console.error("❌ Redis Client Error", err.message));
    redisClient.on("connect", ()    => console.log("✅ Redis connected"));

    // ── BullMQ connection — host/port/password separately, no TLS
    redisConnection = {
      host:     process.env.REDIS_HOST,
      port:     parseInt(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
      username: process.env.REDIS_USERNAME || "default",
      // NO tls:{} here either
    };

    await redisClient.ping();
    console.log("✅ Redis ping successful");

    return { redisClient, redisConnection };

  } catch (err) {
    console.error("❌ Redis connection failed:", err.message);
    throw err;
  }
};

export const getRedisClient     = () => redisClient;
export const getRedisConnection = () => redisConnection;