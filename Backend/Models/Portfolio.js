import mongoose from "mongoose";
/* ============================================================
   PORTFOLIO MODEL
   One document per user. Tracks cash, holdings, P&L,
   transaction history and trade stats.
   ============================================================ */

/* ── Holding sub-schema ──────────────────────────────────── */
const HoldingSchema = new mongoose.Schema(
  {
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
    quantity: {
      type:     Number,
      required: true,
      min:      0,
      default:  0,
    },
    avgBuyPrice: {
      // weighted average cost per share
      type:     Number,
      required: true,
      min:      0,
    },
    totalInvested: {
      // avgBuyPrice * quantity — recalculated on every trade
      type:    Number,
      default: 0,
    },
  },
  { _id: false }
);

/* ── Transaction sub-schema ──────────────────────────────── */
const TransactionSchema = new mongoose.Schema(
  {
    type: {
      type:     String,
      enum:     ["BUY", "SELL", "DEPOSIT", "WITHDRAWAL"],
      required: true,
    },
    symbol: {
      // null for DEPOSIT / WITHDRAWAL
      type:      String,
      uppercase: true,
      trim:      true,
      default:   null,
    },
    quantity:  { type: Number, default: null },
    price:     { type: Number, default: null },   // execution price per share
    total: {
      // quantity * price  OR  deposit/withdrawal amount
      type:     Number,
      required: true,
    },
    balanceBefore: { type: Number, required: true },
    balanceAfter:  { type: Number, required: true },
    pnl:           { type: Number, default: null }, // only for SELL
    note:          { type: String, default: ""    },
    executedAt:    { type: Date,   default: Date.now },
  },
  { _id: true }
);

/* ── Portfolio main schema ───────────────────────────────── */
const PortfolioSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
      unique:   true,   // one portfolio per user
      index:    true,
    },

    /* Cash */
    cashBalance: {
      type:    Number,
      default: 100000,  // ₹1,00,000 starting balance
      min:     0,
    },

    /* Holdings */
    holdings: {
      type:    [HoldingSchema],
      default: [],
    },

    /* P&L */
    realizedPnL: {
      type:    Number,
      default: 0,
    },
    totalDeposited: {
      type:    Number,
      default: 100000, // tracks how much virtual money user has added
    },

    /* Transaction history */
    transactions: {
      type:    [TransactionSchema],
      default: [],
    },

    /* Trade stats — used for leaderboard */
    totalTrades:   { type: Number, default: 0 },
    winningTrades: { type: Number, default: 0 },
    losingTrades:  { type: Number, default: 0 },
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

/* Total amount currently invested across all holdings */
PortfolioSchema.virtual("totalInvestedValue").get(function () {
  return this.holdings.reduce((sum, h) => sum + h.totalInvested, 0);
});

/* Win rate % */
PortfolioSchema.virtual("winRate").get(function () {
  if (this.totalTrades === 0) return 0;
  return parseFloat(((this.winningTrades / this.totalTrades) * 100).toFixed(1));
});

/* ============================================================
   INSTANCE METHODS
   ============================================================ */

/* Add or update holding after a BUY trade */
PortfolioSchema.methods.addHolding = function (symbol, companyName, quantity, buyPrice) {
  const existing = this.holdings.find((h) => h.symbol === symbol);

  if (existing) {
    // Weighted average: (oldQty * oldAvg + newQty * newPrice) / totalQty
    const totalQty         = existing.quantity + quantity;
    const totalCost        = existing.avgBuyPrice * existing.quantity + buyPrice * quantity;
    existing.avgBuyPrice   = totalCost / totalQty;
    existing.quantity      = totalQty;
    existing.totalInvested = existing.avgBuyPrice * totalQty;
    existing.companyName   = companyName || existing.companyName;
  } else {
    this.holdings.push({
      symbol,
      companyName,
      quantity,
      avgBuyPrice:   buyPrice,
      totalInvested: buyPrice * quantity,
    });
  }
};

/* Reduce holding after a SELL trade. Returns realized P&L for this sell. */
PortfolioSchema.methods.reduceHolding = function (symbol, quantity, sellPrice) {
  const holding = this.holdings.find((h) => h.symbol === symbol);
  if (!holding)                  throw new Error(`No holding found for ${symbol}`);
  if (holding.quantity < quantity) throw new Error(`Insufficient shares for ${symbol}`);

  const pnl = (sellPrice - holding.avgBuyPrice) * quantity;

  holding.quantity      -= quantity;
  holding.totalInvested  = holding.avgBuyPrice * holding.quantity;

  // Remove holding entirely if quantity hits zero
  if (holding.quantity === 0) {
    this.holdings = this.holdings.filter((h) => h.symbol !== symbol);
  }

  // Update P&L and trade stats
  this.realizedPnL   += pnl;
  this.totalTrades   += 1;
  if (pnl >= 0) this.winningTrades += 1;
  else          this.losingTrades  += 1;

  return pnl;
};

/* Log a transaction entry */
PortfolioSchema.methods.logTransaction = function (type, data) {
  this.transactions.push({
    type,
    symbol:        data.symbol        || null,
    quantity:      data.quantity      || null,
    price:         data.price         || null,
    total:         data.total,
    balanceBefore: data.balanceBefore,
    balanceAfter:  data.balanceAfter,
    pnl:           data.pnl           || null,
    note:          data.note          || "",
  });
};

/* ============================================================
   STATIC METHODS
   ============================================================ */

/* Get or create portfolio for a user */
PortfolioSchema.statics.getOrCreate = async function (userId) {
  let portfolio = await this.findOne({ user: userId });
  if (!portfolio) {
    portfolio = await this.create({ user: userId });
  }
  return portfolio;
};

/* ============================================================
   INDEXES
   ============================================================ */
PortfolioSchema.index({ user: 1 });
PortfolioSchema.index({ "holdings.symbol": 1 });
PortfolioSchema.index({ realizedPnL: -1 }); // for leaderboard sorting

const Portfolio = mongoose.model("Portfolio", PortfolioSchema);
export default Portfolio;