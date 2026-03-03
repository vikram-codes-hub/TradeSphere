import { createClient } from "redis"

let redisClient

export const initRedis = async () => {
    redisClient = createClient({
        url: process.env.REDIS_URL
    })

    redisClient.on("error", (err) => {
        console.error("Redis Client Error:", err)
    })

    await redisClient.connect()
    console.log("Redis Connected 🚀")
}

export const getRedisClient = () => redisClient