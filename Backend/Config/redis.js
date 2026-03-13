import Redis from "ioredis";

let redisClient     = null;
let redisConnection = null;

const sharedOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck:     false,
  keepAlive:            10000,
  connectTimeout:       30000,
  retryStrategy: (times) => {
    if (times > 20) return null;
    return Math.min(times * 500, 5000);
  },
};

export const initRedis = async () => {
  try {
    // Main client
    redisClient = new Redis(process.env.REDIS_URL, sharedOptions);
    redisClient.on("error",   (err) => console.error("❌ Redis Client Error:", err.message));
    redisClient.on("connect", ()    => console.log("✅ Redis connected"));


    redisConnection = new Redis(process.env.REDIS_URL, sharedOptions);
    redisConnection.on("error",   (err) => console.error("❌ BullMQ Redis Error:", err.message));
    redisConnection.on("connect", ()    => console.log("✅ BullMQ Redis connected"));

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