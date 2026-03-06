/* ============================================================
   ERROR MIDDLEWARE
   Global error handler — catches all errors passed via next(err)
   Must be registered LAST in server.js after all routes.
   ============================================================ */

/* ── 404 handler — route not found ──────────────────────── */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/* ── Global error handler ────────────────────────────────── */
const errorHandler = (err, req, res, next) => {
  // Sometimes Express sets status 200 even on errors — fix that
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message    = err.message || "Internal Server Error";

  // ── Mongoose: bad ObjectId ────────────────────────────
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 400;
    message    = "Invalid ID format.";
  }

  // ── Mongoose: duplicate key (e.g. email already exists) ─
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message    = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
  }

  // ── Mongoose: validation error ───────────────────────
  if (err.name === "ValidationError") {
    statusCode = 400;
    message    = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // ── JWT errors ────────────────────────────────────────
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message    = "Invalid token.";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message    = "Token expired. Please log in again.";
  }

  // ── Log error in development ──────────────────────────
  if (process.env.NODE_ENV !== "production") {
    console.error(`\n❌ [${req.method}] ${req.originalUrl}`);
    console.error(`   Status : ${statusCode}`);
    console.error(`   Message: ${message}`);
    if (err.stack) console.error(`   Stack  : ${err.stack}\n`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

export { notFound, errorHandler };