import mongoose from "mongoose";

const PricePointSchema = new mongoose.Schema(
  {
    price:     { type: Number, required: true },
    volume:    { type: Number, default: 0     },
    timestamp: { type: Date,   default: Date.now },
  },
  { _id: false }
);

const StockSchema = new mongoose.Schema(
  {
    symbol: {
      type: String, required: true, unique: true, uppercase: true, trim: true,
    },
    companyName: { type: String, required: true, trim: true },
    exchange: {
      type: String, enum: ["NSE", "BSE", "NASDAQ", "NYSE", "OTHER"], default: "NSE",
    },
    sector:  { type: String, default: "Unknown" },
    logoUrl: { type: String, default: ""        },

    currentPrice:  { type: Number, default: 0 },
    previousClose: { type: Number, default: 0 },
    openPrice:     { type: Number, default: 0 },
    dayHigh:       { type: Number, default: 0 },
    dayLow:        { type: Number, default: 0 },
    volume:        { type: Number, default: 0 },
    marketCap:     { type: Number, default: 0 },
    weekHigh52:    { type: Number, default: 0 },
    weekLow52:     { type: Number, default: 0 },

    // ✅ Stored directly — NOT virtuals
    // Yahoo's regularMarketChange/regularMarketChangePercent are always
    // correct even outside market hours, unlike currentPrice-previousClose
    priceChange:    { type: Number, default: 0 },
    priceChangePct: { type: Number, default: 0 },

    priceHistory: { type: [PricePointSchema], default: [] },

    isHalted:    { type: Boolean, default: false, index: true },
    haltedAt:    { type: Date,    default: null  },
    haltedUntil: { type: Date,    default: null  },
    haltReason:  { type: String,  default: null  },

    isActive:         { type: Boolean, default: true, index: true },
    volatilityFactor: { type: Number,  default: 1.0,  min: 0.1, max: 2.0 },

    lastSyncedAt: { type: Date,   default: null },
    syncError:    { type: String, default: null },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ✅ Only non-price virtuals remain
StockSchema.virtual("isTradeable").get(function () {
  return this.isActive && !this.isHalted;
});

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

StockSchema.statics.getActive = function () {
  return this.find({ isActive: true }).select(
    "symbol companyName exchange currentPrice previousClose priceChange priceChangePct volume marketCap isHalted sector"
  );
};

StockSchema.statics.getBySymbol = function (symbol) {
  return this.findOne({ symbol: symbol.toUpperCase() });
};

StockSchema.index({ symbol: 1 });
StockSchema.index({ isActive: 1, isHalted: 1 });
StockSchema.index({ exchange: 1 });
StockSchema.index({ marketCap: -1 });

const Stock = mongoose.model("Stock", StockSchema);
export default Stock;