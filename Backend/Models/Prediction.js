import mongoose from "mongoose";

/* ============================================================
   PREDICTION MODEL
   Stores every ML prediction request + result.
   Created when a Premium user requests a prediction.
   Updated when the Flask ML service returns the result.
   ============================================================ */

const PredictionSchema = new mongoose.Schema(
  {
    /* ── Who requested it ────────────────────────────────── */
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
      index:    true,
    },

    /* ── Which stock ─────────────────────────────────────── */
    symbol: {
      type:      String,
      required:  true,
      uppercase: true,
      trim:      true,
    },
    companyName: {
      type:    String,
      default: "",
    },

    /* ── Request state ───────────────────────────────────── */
    status: {
      type:    String,
      enum:    ["PENDING", "PROCESSING", "COMPLETED", "FAILED"],
      default: "PENDING",
      index:   true,
    },

    /* ── Input snapshot ──────────────────────────────────── */
    inputDataPoints: {
      // how many price history points were sent to the ML service
      type:    Number,
      default: 0,
    },
    currentPrice: {
      // price at time of request
      type:    Number,
      default: null,
    },

    /* ── ML Result ───────────────────────────────────────── */
    result: {
      predictedPrice: { type: Number,  default: null },
      trend: {
        type:    String,
        enum:    ["bullish", "bearish", "neutral", null],
        default: null,
      },
      pctChange: {
        // predicted % change from current price
        type:    Number,
        default: null,
      },
      confidence: {
        // 40–95 confidence score from ML service
        type: Number,
        min:  0,
        max:  100,
        default: null,
      },
      modelUsed: {
        // "RandomForest" or "LinearRegression"
        type:    String,
        default: null,
      },
      rmse: {
        type:    Number,
        default: null,
      },
      r2: {
        type:    Number,
        default: null,
      },
    },

    /* ── Price history snapshot ──────────────────────────── */
    // Storing last 30 days for the Actual vs Predicted chart
    priceHistory: [
      {
        date:          { type: Date,   required: true },
        actualPrice:   { type: Number, required: true },
        predictedPrice:{ type: Number, default: null  }, // filled after ML runs
        _id: false,
      },
    ],

    /* ── Error info (if FAILED) ──────────────────────────── */
    errorMessage: {
      type:    String,
      default: null,
    },

    /* ── Timestamps ──────────────────────────────────────── */
    requestedAt: {
      type:    Date,
      default: Date.now,
    },
    completedAt: {
      type:    Date,
      default: null,
    },

    /* ── BullMQ job ID ───────────────────────────────────── */
    jobId: {
      type:    String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

/* ============================================================
   VIRTUALS
   ============================================================ */

/* Processing time in milliseconds */
PredictionSchema.virtual("processingTimeMs").get(function () {
  if (!this.completedAt || !this.requestedAt) return null;
  return this.completedAt - this.requestedAt;
});

/* Human readable trend label */
PredictionSchema.virtual("trendLabel").get(function () {
  const map = {
    bullish: "📈 Bullish",
    bearish: "📉 Bearish",
    neutral: "➡️ Neutral",
  };
  return this.result?.trend ? map[this.result.trend] : "—";
});

/* ============================================================
   INSTANCE METHODS
   ============================================================ */

/* Mark prediction as complete with ML result */
PredictionSchema.methods.complete = function (mlResult) {
  this.status       = "COMPLETED";
  this.completedAt  = new Date();
  this.result       = {
    predictedPrice: mlResult.predictedPrice,
    trend:          mlResult.trend,
    pctChange:      mlResult.pctChange,
    confidence:     mlResult.confidence,
    modelUsed:      mlResult.modelUsed,
    rmse:           mlResult.rmse,
    r2:             mlResult.r2,
  };
};

/* Mark prediction as failed */
PredictionSchema.methods.fail = function (errorMessage) {
  this.status       = "FAILED";
  this.completedAt  = new Date();
  this.errorMessage = errorMessage;
};

/* ============================================================
   STATIC METHODS
   ============================================================ */

/* Get latest prediction for a user + symbol */
PredictionSchema.statics.getLatest = function (userId, symbol) {
  return this.findOne({
    user:   userId,
    symbol: symbol.toUpperCase(),
    status: "COMPLETED",
  }).sort({ completedAt: -1 });
};

/* Get all predictions for a user, newest first */
PredictionSchema.statics.getHistory = function (userId, limit = 20) {
  return this.find({ user: userId })
    .sort({ requestedAt: -1 })
    .limit(limit)
    .select("-priceHistory"); // exclude heavy field from list view
};

/* Get top predicted stocks (for Predictions page leaderboard) */
PredictionSchema.statics.getTopBullish = function (limit = 10) {
  return this.find({
    status:        "COMPLETED",
    "result.trend": "bullish",
  })
    .sort({ "result.pctChange": -1 })
    .limit(limit)
    .populate("user", "name");
};

/* ============================================================
   INDEXES
   ============================================================ */
PredictionSchema.index({ user: 1, symbol: 1 });
PredictionSchema.index({ user: 1, requestedAt: -1 });
PredictionSchema.index({ status: 1 });
PredictionSchema.index({ "result.trend": 1, "result.pctChange": -1 });
PredictionSchema.index({ symbol: 1, completedAt: -1 });

const Prediction = mongoose.model("Prediction", PredictionSchema);
export default Prediction;