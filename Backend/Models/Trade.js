import mongoose from "mongoose";

const TradeSchema = new mongoose.Schema(
  {
    // References to the matched orders
    buyOrderId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Order",
      required: true,
    },

    sellOrderId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Order",
      required: true,
    },

    // Buyer and seller user IDs
    buyerId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
      index:    true,
    },

    sellerId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
      index:    true,
    },

    stockSymbol: {
      type:      String,
      required:  true,
      uppercase: true,
      trim:      true,
      index:     true,
    },

    // Price at which the trade was executed (in paise)
    executedPrice: {
      type:     Number,
      required: true,
      min:      [1, "Executed price must be positive"],
    },

    // Number of shares exchanged
    quantity: {
      type:     Number,
      required: true,
      min:      [1, "Quantity must be at least 1"],
    },

    // Total trade value in paise = executedPrice * quantity
    totalValue: {
      type:    Number,
      required: true,
    },

    // Was this a market or limit order match
    tradeType: {
      type:    String,
      enum:    ["market-market", "market-limit", "limit-limit"],
      default: "limit-limit",
    },

    executedAt: {
      type:    Date,
      default: Date.now,
      index:   true,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ───────────────────────────────────────────────────
TradeSchema.index({ stockSymbol: 1, executedAt: -1 });
TradeSchema.index({ buyerId:  1,   executedAt: -1 });
TradeSchema.index({ sellerId: 1,   executedAt: -1 });

// ── Virtual: total value in rupees ────────────────────────────
TradeSchema.virtual("totalValueInRupees").get(function () {
  return this.totalValue / 100;
});

// ── Virtual: executed price in rupees ─────────────────────────
TradeSchema.virtual("executedPriceInRupees").get(function () {
  return this.executedPrice / 100;
});

// ── Static: get recent trades for a stock ────────────────────
TradeSchema.statics.getRecentTrades = function (symbol, limit = 20) {
  return this.find({ stockSymbol: symbol })
    .sort({ executedAt: -1 })
    .limit(limit)
    .populate("buyerId",  "name")
    .populate("sellerId", "name");
};

// ── Static: get user trade history ───────────────────────────
TradeSchema.statics.getUserTrades = function (userId, limit = 50) {
  return this.find({
    $or: [{ buyerId: userId }, { sellerId: userId }],
  })
    .sort({ executedAt: -1 })
    .limit(limit);
};

export default mongoose.model("Trade", TradeSchema);