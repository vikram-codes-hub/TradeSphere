export const errorMiddleware = (err, req, res, next) => {
    console.error("Error:", err)

    let statusCode = err.statusCode || 500
    let message = err.message || "Internal Server Error"

    // Mongoose Bad ObjectId
    if (err.name === "CastError") {
        statusCode = 400
        message = `Invalid ${err.path}`
    }

    // Mongoose Duplicate Key
    if (err.code === 11000) {
        statusCode = 400
        const field = Object.keys(err.keyValue)[0]
        message = `${field} already exists`
    }

    // Mongoose Validation Error
    if (err.name === "ValidationError") {
        statusCode = 400
        message = Object.values(err.errors)
            .map(val => val.message)
            .join(", ")
    }

    // JWT Error
    if (err.name === "JsonWebTokenError") {
        statusCode = 401
        message = "Invalid token"
    }

    // JWT Expired
    if (err.name === "TokenExpiredError") {
        statusCode = 401
        message = "Token expired"
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack })
    })
}

