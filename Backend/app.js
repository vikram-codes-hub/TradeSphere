import express from "express"
import cors from "cors"
import morgan from "morgan"
import cookieParser from "cookie-parser"


import { errorMiddleware } from "./Middleware/error.middleware.js"

export const app = express()

// Middlewares
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(morgan("dev"))

// Health check route
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is running 🚀"
    })
})

// Routes


// Global Error Handler
app.use(errorMiddleware)

