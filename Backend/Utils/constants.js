/* ============================================================
   CONSTANTS
   ============================================================ */

export const ROLES = {
  FREE:    "free",
  PREMIUM: "premium",
  ADMIN:   "admin",
};

export const TRADE_TYPES = {
  BUY:  "BUY",
  SELL: "SELL",
};

export const PREDICTION_STATUS = {
  PENDING:    "PENDING",
  PROCESSING: "PROCESSING",
  COMPLETED:  "COMPLETED",
  FAILED:     "FAILED",
};

export const PREDICTION_LIMITS = {
  FREE:    5,    // per day
  PREMIUM: 9999, // unlimited
};

export const PORTFOLIO = {
  STARTING_BALANCE: 100000, // ₹1,00,000
  MAX_WATCHLIST:    20,
};

export const CACHE_TTL = {
  STOCK_PRICE:  300,  // 5 minutes
  LEADERBOARD:  300,  // 5 minutes
  MARKET_DATA:  60,   // 1 minute
};

export const CIRCUIT_BREAKER = {
  HALT_THRESHOLD_PCT: 10,  // halt if price moves >10%
  DEFAULT_HALT_MS:    120000, // 2 minutes
};

export const SYNC_INTERVAL_MS = 60 * 1000; // 60 seconds

export const QUEUE_NAMES = {
  MARKET_SYNC:  "market-sync",
  PREDICTION:   "prediction",
  LEADERBOARD:  "leaderboard",
  SETTLEMENT:   "settlement",
  SIMULATION:   "simulation",
};