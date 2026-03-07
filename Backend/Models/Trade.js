import mongoose from "mongoose";

const tradeSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
      index:    true,
    },

    symbol: {
      type:     String,
      required: true,
      uppercase:true,
      trim:     true,
    },

    companyName: {
      type:    String,
      default: "",
    },

    type: {
      type:     String,
      enum:     ["BUY", "SELL"],
      required: true,
    },

    quantity: {
      type:     Number,
      required: true,
      min:      1,
    },

    price: {
      type:     Number,
      required: true,
      min:      0,
    },

    totalAmount: {
      type:     Number,
      required: true,
    },

    // Only populated on SELL trades
    avgBuyPrice: {
      type:    Number,
      default: 0,
    },

    pnl: {
      type:    Number,
      default: 0,
    },

    pnlPct: {
      type:    Number,
      default: 0,
    },

    balanceAfter: {
      type:    Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast user trade history queries
tradeSchema.index({ user: 1, createdAt: -1 });
tradeSchema.index({ user: 1, symbol: 1  });

const Trade = mongoose.model("Trade", tradeSchema);
export default Trade;