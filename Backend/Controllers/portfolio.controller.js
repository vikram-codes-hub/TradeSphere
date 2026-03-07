import Portfolio from "../Models/Portfolio.js";
import Trade     from "../Models/Trade.js";
import Stock     from "../Models/Stock.js";
import { getStockPrice } from "../Services/Stockservice.js";
import { getRedisClient } from "../Config/redis.js";

/* ── helper: enrich a holding with live price ────────────── */
const enrichHolding = async (holding, redisClient) => {
  const livePrice     = await getStockPrice(redisClient, holding.symbol) || holding.avgBuyPrice;
  const currentValue  = parseFloat((livePrice * holding.quantity).toFixed(2));
  const investedValue = parseFloat((holding.avgBuyPrice * holding.quantity).toFixed(2));
  const unrealisedPnl = parseFloat((currentValue - investedValue).toFixed(2));
  const unrealisedPct = investedValue > 0
    ? parseFloat(((unrealisedPnl / investedValue) * 100).toFixed(2))
    : 0;

  return {
    _id:              holding._id,
    symbol:           holding.symbol,
    companyName:      holding.companyName,
    exchange:         holding.exchange,
    sector:           holding.sector,
    quantity:         holding.quantity,
    avgBuyPrice:      holding.avgBuyPrice,
    currentPrice:     livePrice,
    currentValue,
    investedValue,
    unrealisedPnl,
    unrealisedPnlPct: unrealisedPct,
    lastUpdated:      holding.lastUpdated,
  };
};

/* ============================================================
   GET MY PORTFOLIO
   GET /api/portfolio
   Returns all holdings with live prices + summary stats
   ============================================================ */
export const getPortfolio = async (req, res, next) => {
  try {
    const holdings    = await Portfolio.find({ user: req.user._id });
    const redisClient = getRedisClient();

    const enriched = await Promise.all(holdings.map((h) => enrichHolding(h, redisClient)));

    // Summary calculations
    const totalCurrentValue  = parseFloat(enriched.reduce((s, h) => s + h.currentValue,  0).toFixed(2));
    const totalInvestedValue = parseFloat(enriched.reduce((s, h) => s + h.investedValue, 0).toFixed(2));
    const totalUnrealisedPnl = parseFloat((totalCurrentValue - totalInvestedValue).toFixed(2));

    res.status(200).json({
      success: true,
      summary: {
        holdingsCount:     enriched.length,
        totalCurrentValue,
        totalInvestedValue,
        totalUnrealisedPnl,
        totalUnrealisedPct: totalInvestedValue > 0
          ? parseFloat(((totalUnrealisedPnl / totalInvestedValue) * 100).toFixed(2))
          : 0,
      },
      holdings: enriched,
    });
  } catch (err) {
    next(err);
  }
};

/* ============================================================
   GET PORTFOLIO SUMMARY (lightweight — for dashboard widget)
   GET /api/portfolio/summary
   ============================================================ */
export const getPortfolioSummary = async (req, res, next) => {
  try {
    const holdings    = await Portfolio.find({ user: req.user._id });
    const redisClient = getRedisClient();

    let totalCurrentValue  = 0;
    let totalInvestedValue = 0;

    for (const h of holdings) {
      const livePrice = await getStockPrice(redisClient, h.symbol) || h.avgBuyPrice;
      totalCurrentValue  += livePrice * h.quantity;
      totalInvestedValue += h.avgBuyPrice * h.quantity;
    }

    totalCurrentValue  = parseFloat(totalCurrentValue.toFixed(2));
    totalInvestedValue = parseFloat(totalInvestedValue.toFixed(2));
    const unrealisedPnl = parseFloat((totalCurrentValue - totalInvestedValue).toFixed(2));

    res.status(200).json({
      success: true,
      summary: {
        holdingsCount:  holdings.length,
        totalCurrentValue,
        totalInvestedValue,
        unrealisedPnl,
        unrealisedPct:  totalInvestedValue > 0
          ? parseFloat(((unrealisedPnl / totalInvestedValue) * 100).toFixed(2))
          : 0,
        cashBalance:    req.user.cashBalance,
        netWorth:       parseFloat((req.user.cashBalance + totalCurrentValue).toFixed(2)),
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ============================================================
   GET SINGLE HOLDING
   GET /api/portfolio/:symbol
   ============================================================ */
export const getHolding = async (req, res, next) => {
  try {
    const symbol  = req.params.symbol.toUpperCase();
    const holding = await Portfolio.findOne({ user: req.user._id, symbol });

    if (!holding) {
      return res.status(404).json({
        success: false,
        message: `You don't own any shares of ${symbol}.`,
      });
    }

    const redisClient = getRedisClient();
    const enriched    = await enrichHolding(holding, redisClient);

    res.status(200).json({ success: true, holding: enriched });
  } catch (err) {
    next(err);
  }
};

/* ============================================================
   GET P&L BREAKDOWN
   GET /api/portfolio/pnl
   ============================================================ */
export const getPnL = async (req, res, next) => {
  try {
    const holdings    = await Portfolio.find({ user: req.user._id });
    const redisClient = getRedisClient();

    const breakdown = await Promise.all(holdings.map(async (h) => {
      const livePrice     = await getStockPrice(redisClient, h.symbol) || h.avgBuyPrice;
      const unrealisedPnl = parseFloat(((livePrice - h.avgBuyPrice) * h.quantity).toFixed(2));
      return {
        symbol:      h.symbol,
        companyName: h.companyName,
        unrealisedPnl,
        pnlPct: h.avgBuyPrice > 0
          ? parseFloat((((livePrice - h.avgBuyPrice) / h.avgBuyPrice) * 100).toFixed(2))
          : 0,
      };
    }));

    // Realised P&L from sell trades
    const sellTrades = await Trade.find({ user: req.user._id, type: "SELL" })
      .sort({ createdAt: -1 })
      .limit(50)
      .select("symbol pnl pnlPct createdAt quantity price");

    const totalRealised   = parseFloat(sellTrades.reduce((s, t) => s + (t.pnl || 0), 0).toFixed(2));
    const totalUnrealised = parseFloat(breakdown.reduce((s, h) => s + h.unrealisedPnl, 0).toFixed(2));

    res.status(200).json({
      success: true,
      pnl: {
        totalRealised,
        totalUnrealised,
        totalPnl:    parseFloat((totalRealised + totalUnrealised).toFixed(2)),
        breakdown,
        recentSells: sellTrades,
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ============================================================
   GET ALLOCATION (pie chart data)
   GET /api/portfolio/allocation
   ============================================================ */
export const getAllocation = async (req, res, next) => {
  try {
    const holdings    = await Portfolio.find({ user: req.user._id });
    const redisClient = getRedisClient();

    let total = 0;
    const values = await Promise.all(holdings.map(async (h) => {
      const livePrice = await getStockPrice(redisClient, h.symbol) || h.avgBuyPrice;
      const value     = livePrice * h.quantity;
      total += value;
      return { symbol: h.symbol, companyName: h.companyName, sector: h.sector, value };
    }));

    // Add cash allocation
    total += req.user.cashBalance;

    const allocation = [
      ...values.map((v) => ({
        ...v,
        value:      parseFloat(v.value.toFixed(2)),
        percentage: parseFloat(((v.value / total) * 100).toFixed(2)),
      })),
      {
        symbol:      "CASH",
        companyName: "Cash Balance",
        sector:      "Cash",
        value:       parseFloat(req.user.cashBalance.toFixed(2)),
        percentage:  parseFloat(((req.user.cashBalance / total) * 100).toFixed(2)),
      },
    ];

    // Sector breakdown
    const sectorMap = {};
    allocation.forEach((a) => {
      if (!sectorMap[a.sector]) sectorMap[a.sector] = 0;
      sectorMap[a.sector] += a.value;
    });

    const sectorBreakdown = Object.entries(sectorMap).map(([sector, value]) => ({
      sector,
      value:      parseFloat(value.toFixed(2)),
      percentage: parseFloat(((value / total) * 100).toFixed(2)),
    }));

    res.status(200).json({
      success: true,
      totalValue:      parseFloat(total.toFixed(2)),
      allocation,
      sectorBreakdown,
    });
  } catch (err) {
    next(err);
  }
};