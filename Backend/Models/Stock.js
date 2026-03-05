import mongoose from "mongoose";

/* ============================================================
   STOCK MODEL
   Slim model — Yahoo Finance handles raw data.
   This stores your app's stock list + cached live state.
   ============================================================ */

/* ── Price point sub-schema (for chart) ─────────────────── */
const PricePointSchema = new mongoose.Schema(
  {
    price:     { type: Number, required: true },
    volume:    { type: Number, default: 0     },
    timestamp: { type: Date,   default: Date.now },
  },
  { _id: false }
);

/* ── Main Stock schema ───────────────────────────────────── */
const StockSchema = new mongoose.Schema(
  {
    /* ── Identity ─────────────────────────────────────────── */
    symbol: {
      type:      String,
      required:  true,
      unique:    true,
      uppercase: true,
      trim:      true,
      index:     true,
    },
    companyName: {
      type:     String,
      required: true,
      trim:     true,
    },
    exchange: {
      type:    String,
      enum:    ["NSE", "BSE", "NASDAQ", "NYSE", "OTHER"],
      default: "NSE",
    },
    sector: {
      type:    String,
      default: "Unknown",
    },
    logoUrl: {
      type:    String,
      default: "",
    },

    /* ── Live Price (cached from Yahoo Finance) ───────────── */
    currentPrice:  { type: Number, default: 0 },
    previousClose: { type: Number, default: 0 },
    openPrice:     { type: Number, default: 0 },
    dayHigh:       { type: Number, default: 0 },
    dayLow:        { type: Number, default: 0 },
    volume:        { type: Number, default: 0 },
    marketCap:     { type: Number, default: 0 },
    weekHigh52:    { type: Number, default: 0 },
    weekLow52:     { type: Number, default: 0 },

    /* ── Price History (last 90 points for chart) ─────────── */
    priceHistory: {
      type:    [PricePointSchema],
      default: [],
    },

    /* ── Circuit Breaker ──────────────────────────────────── */
    isHalted:    { type: Boolean, default: false, index: true },
    haltedAt:    { type: Date,    default: null  },
    haltedUntil: { type: Date,    default: null  },
    haltReason:  { type: String,  default: null  },

    /* ── App Config ───────────────────────────────────────── */
    isActive: {
      type:    Boolean,
      default: true,
      index:   true,
    },
    volatilityFactor: {
      type:    Number,
      default: 1.0,
      min:     0.1,
      max:     2.0,
    },

    /* ── Sync Tracking ────────────────────────────────────── */
    lastSyncedAt: { type: Date,   default: null },
    syncError:    { type: String, default: null },
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

StockSchema.virtual("priceChange").get(function () {
  if (!this.previousClose || this.previousClose === 0) return 0;
  return parseFloat((this.currentPrice - this.previousClose).toFixed(2));
});

StockSchema.virtual("priceChangePct").get(function () {
  if (!this.previousClose || this.previousClose === 0) return 0;
  return parseFloat(
    (((this.currentPrice - this.previousClose) / this.previousClose) * 100).toFixed(2)
  );
});

StockSchema.virtual("isTradeable").get(function () {
  return this.isActive && !this.isHalted;
});

/* ============================================================
   INSTANCE METHODS
   ============================================================ */

StockSchema.methods.pushPricePoint = function (price, volume = 0) {
  this.priceHistory.push({ price, volume, timestamp: new Date() });
  if (this.priceHistory.length > 90) {
    this.priceHistory = this.priceHistory.slice(-90);
  }
};

StockSchema.methods.halt = function (reason, durationMs = 120000) {
  this.isHalted    = true;
  this.haltedAt    = new Date();
  this.haltedUntil = new Date(Date.now() + durationMs);
  this.haltReason  = reason;
};

StockSchema.methods.resume = function () {
  this.isHalted    = false;
  this.haltedAt    = null;
  this.haltedUntil = null;
  this.haltReason  = null;
};

StockSchema.methods.checkAndResume = function () {
  if (this.isHalted && this.haltedUntil && new Date() > this.haltedUntil) {
    this.resume();
    return true;
  }
  return false;
};

/* ============================================================
   STATIC METHODS
   ============================================================ */

StockSchema.statics.getActive = function () {
  return this.find({ isActive: true }).select(
    "symbol companyName exchange currentPrice previousClose volume marketCap isHalted sector"
  );
};

StockSchema.statics.getBySymbol = function (symbol) {
  return this.findOne({ symbol: symbol.toUpperCase() });
};

/* ============================================================
   INDEXES
   ============================================================ */
StockSchema.index({ symbol: 1 });
StockSchema.index({ isActive: 1, isHalted: 1 });
StockSchema.index({ exchange: 1 });
StockSchema.index({ marketCap: -1 });

const Stock = mongoose.model("Stock", StockSchema);
export default Stock;