import mongoose from "mongoose";

const WatchlistSchema = new mongoose.Schema(
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
    addedAt: {
      type:    Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON:  { virtuals: true },
    toObject:{ virtuals: true },
  }
);

// One user can't add same stock twice
WatchlistSchema.index({ user: 1, symbol: 1 }, { unique: true });

export default mongoose.model("Watchlist", WatchlistSchema);