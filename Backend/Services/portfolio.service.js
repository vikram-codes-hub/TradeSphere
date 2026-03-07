import Portfolio from "../Models/Portfolio.js";
import { getStockPrice } from "./Stockservice.js";
import { getRedisClient } from "../Config/redis.js";

/* ── Get portfolio value with live prices ────────────────── */
export const getPortfolioValue = async (userId) => {
  const holdings    = await Portfolio.find({ user: userId });
  const redisClient = getRedisClient();

  let totalValue = 0;
  for (const h of holdings) {
    const price = await getStockPrice(redisClient, h.symbol) || h.avgBuyPrice;
    totalValue += price * h.quantity;
  }

  return parseFloat(totalValue.toFixed(2));
};

/* ── Get all holdings for a user ─────────────────────────── */
export const getUserHoldings = async (userId) => {
  return await Portfolio.find({ user: userId });
};