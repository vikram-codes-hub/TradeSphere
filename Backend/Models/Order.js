import mongoose from "mongoose";
const OrderSchema = new mongoose.Schema(
  {
    userId: {
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

    // Order type
    type: {
      type:     String,
      enum:     ["market", "limit"],
      required: true,
    },

    // Buy or sell
    side: {
      type:     String,
      enum:     ["buy", "sell"],
      required: true,
    },

    // Price in paise
    // For market orders: 0 (match at best price)
    // For limit orders: user's target price
    price: {
      type:    Number,
      default: 0,
      min:     [0, "Price cannot be negative"],
    },

    // Number of shares
    quantity: {
      type:     Number,
      required: true,
      min:      [1, "Quantity must be at least 1"],
    },

    // How many shares have been filled so far
    filledQuantity: {
      type:    Number,
      default: 0,
      min:     0,
    },

    // Remaining = quantity - filledQuantity
    // (virtual, but useful)

    // Average price at which this order was filled (in paise)
    avgFilledPrice: {
      type:    Number,
      default: 0,
    },

    // Order lifecycle status
    status: {
      type:    String,
      enum:    ["pending", "partial", "filled", "cancelled"],
      default: "pending",
      index:   true,
    },

    // Total value locked for this order (in paise)
    // For buy: price * quantity (reserved from balance)
    // For sell: 0 (shares reserved instead)
    lockedAmount: {
      type:    Number,
      default: 0,
    },

    // When the order was fully filled or cancelled
    completedAt: {
      type: Date,
    },

    // Notes / reason for cancellation
    note: {
      type:    String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// ── Compound indexes for matching engine queries ───────────────
OrderSchema.index({ stockSymbol: 1, side: 1, status: 1, price: 1 });
OrderSchema.index({ userId: 1, status: 1 });
OrderSchema.index({ stockSymbol: 1, status: 1, createdAt: -1 });

// ── Virtual: remaining quantity ───────────────────────────────
OrderSchema.virtual("remainingQuantity").get(function () {
  return this.quantity - this.filledQuantity;
});

// ── Virtual: is fully filled ──────────────────────────────────
OrderSchema.virtual("isComplete").get(function () {
  return this.filledQuantity >= this.quantity;
});

// ── Instance method: fill order ───────────────────────────────
OrderSchema.methods.fill = function (qty, price) {
  this.filledQuantity += qty;

  // Update average filled price
  const prevTotal       = this.avgFilledPrice * (this.filledQuantity - qty);
  const newTotal        = prevTotal + price * qty;
  this.avgFilledPrice   = newTotal / this.filledQuantity;

  if (this.filledQuantity >= this.quantity) {
    this.status      = "filled";
    this.completedAt = new Date();
  } else {
    this.status = "partial";
  }
};

export default mongoose.model("Order", OrderSchema);