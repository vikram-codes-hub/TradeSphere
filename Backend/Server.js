import dotenv from "dotenv"
import { seedStocks } from "./Services/Stockservice.js"
import { initMarketSyncQueue, initMarketSyncWorker, triggerImmediateSync } from "./workers/marketSyncWorker.js";
dotenv.config()

import http from "http"
import { Server } from "socket.io"

import { app } from "./app.js"
import {connectDB} from "./Config/ConnectDB.js"
import { initRedis } from './Config/redis.js'

const PORT = process.env.PORT || 5000

// Create HTTP server
const server = http.createServer(app)

// Attach Socket.IO
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
})

// Make io globally accessible
global.io = io

io.on("connection", (socket) => {
    console.log("User connected:", socket.id)

    socket.on("joinStockRoom", (stockSymbol) => {
        socket.join(stockSymbol)
    })

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id)
    })
})


await seedStocks();
await initMarketSyncQueue(redisConnection);
initMarketSyncWorker(redisConnection, redisClient, io);
await triggerImmediateSync();
// Start server


const startServer = async () => {
    try {
        await connectDB()
        await initRedis()

        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT} 🚀`)
        })
    } catch (error) {
        console.error("Server startup error:", error)
        process.exit(1)
    }
}

startServer()