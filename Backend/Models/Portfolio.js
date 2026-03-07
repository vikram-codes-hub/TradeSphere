import mongoose from "mongoose";

const portfolioSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
      index:    true,
    },

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

    exchange: {
      type:    String,
      default: "NSE",
    },

    sector: {
      type:    String,
      default: "Unknown",
    },

    quantity: {
      type:    Number,
      required:true,
      min:     0,
    },

    avgBuyPrice: {
      type:    Number,
      required:true,
      min:     0,
    },

    currentPrice: {
      type:    Number,
      default: 0,
    },

    lastUpdated: {
      type:    Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// Unique holding per user per symbol
portfolioSchema.index({ user: 1, symbol: 1 }, { unique: true });

/* ── Virtuals ────────────────────────────────────────────── */
portfolioSchema.virtual("currentValue").get(function () {
  return parseFloat((this.currentPrice * this.quantity).toFixed(2));
});

portfolioSchema.virtual("investedValue").get(function () {
  return parseFloat((this.avgBuyPrice * this.quantity).toFixed(2));
});

portfolioSchema.virtual("unrealisedPnl").get(function () {
  return parseFloat(((this.currentPrice - this.avgBuyPrice) * this.quantity).toFixed(2));
});

portfolioSchema.virtual("unrealisedPnlPct").get(function () {
  if (this.avgBuyPrice === 0) return 0;
  return parseFloat((((this.currentPrice - this.avgBuyPrice) / this.avgBuyPrice) * 100).toFixed(2));
});

const Portfolio = mongoose.model("Portfolio", portfolioSchema);
export default Portfolio;