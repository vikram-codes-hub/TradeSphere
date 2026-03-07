import Watchlist from "../Models/Watchlist.js";
import Stock     from "../Models/Stock.js";
import { getStockPrice } from "../Services/Stockservice.js";
import { getRedisClient } from "../Config/redis.js";

const MAX_WATCHLIST = 20;

/* ============================================================
   GET WATCHLIST
   GET /api/watchlist
   ============================================================ */
export const getWatchlist = async (req, res, next) => {
  try {
    const items       = await Watchlist.find({ user: req.user._id }).sort({ addedAt: -1 });
    const redisClient = getRedisClient();

    if (items.length === 0)
      return res.status(200).json({ success: true, count: 0, watchlist: [] });

    // Enrich each item with live price data
    const enriched = await Promise.all(
      items.map(async (item) => {
        const stockDoc  = await Stock.findOne({ symbol: item.symbol })
          .select("currentPrice previousClose isHalted haltReason");
        const livePrice = await getStockPrice(redisClient, item.symbol)
          || stockDoc?.currentPrice
          || 0;
        const prevClose = stockDoc?.previousClose || livePrice;

        return {
          _id:            item._id,
          symbol:         item.symbol,
          companyName:    item.companyName,
          exchange:       item.exchange,
          sector:         item.sector,
          addedAt:        item.addedAt,
          currentPrice:   livePrice,
          previousClose:  prevClose,
          priceChange:    parseFloat((livePrice - prevClose).toFixed(2)),
          priceChangePct: prevClose > 0
            ? parseFloat((((livePrice - prevClose) / prevClose) * 100).toFixed(2))
            : 0,
          isHalted:   stockDoc?.isHalted   || false,
          haltReason: stockDoc?.haltReason || null,
        };
      })
    );

    res.status(200).json({
      success:   true,
      count:     enriched.length,
      watchlist: enriched,
    });
  } catch (err) {
    next(err);
  }
};

/* ============================================================
   ADD TO WATCHLIST
   POST /api/watchlist/:symbol
   ============================================================ */
export const addToWatchlist = async (req, res, next) => {
  try {
    const symbol = req.params.symbol.toUpperCase();

    // Check max limit
    const count = await Watchlist.countDocuments({ user: req.user._id });
    if (count >= MAX_WATCHLIST)
      return res.status(400).json({
        success: false,
        message: `Watchlist full. Maximum ${MAX_WATCHLIST} stocks allowed. Remove one to add another.`,
      });

    // Check if already in watchlist
    const existing = await Watchlist.findOne({ user: req.user._id, symbol });
    if (existing)
      return res.status(400).json({
        success: false,
        message: `${symbol} is already in your watchlist.`,
      });

    // Get stock details if it exists in our DB
    const stockDoc = await Stock.findOne({ symbol })
      .select("companyName exchange sector");

    const item = await Watchlist.create({
      user:        req.user._id,
      symbol,
      companyName: stockDoc?.companyName || symbol,
      exchange:    stockDoc?.exchange    || "NSE",
      sector:      stockDoc?.sector      || "Unknown",
    });

    res.status(201).json({
      success: true,
      message: `${symbol} added to watchlist.`,
      item,
    });
  } catch (err) {
    next(err);
  }
};

/* ============================================================
   REMOVE FROM WATCHLIST
   DELETE /api/watchlist/:symbol
   ============================================================ */
export const removeFromWatchlist = async (req, res, next) => {
  try {
    const symbol = req.params.symbol.toUpperCase();

    const item = await Watchlist.findOneAndDelete({
      user: req.user._id,
      symbol,
    });

    if (!item)
      return res.status(404).json({
        success: false,
        message: `${symbol} is not in your watchlist.`,
      });

    res.status(200).json({
      success: true,
      message: `${symbol} removed from watchlist.`,
    });
  } catch (err) {
    next(err);
  }
};

/* ============================================================
   CLEAR ENTIRE WATCHLIST
   DELETE /api/watchlist
   ============================================================ */
export const clearWatchlist = async (req, res, next) => {
  try {
    await Watchlist.deleteMany({ user: req.user._id });

    res.status(200).json({
      success:   true,
      message:   "Watchlist cleared.",
      watchlist: [],
    });
  } catch (err) {
    next(err);
  }
};

/* ============================================================
   CHECK IF SYMBOL IS WATCHLISTED
   GET /api/watchlist/check/:symbol
   ============================================================ */
export const checkWatchlist = async (req, res, next) => {
  try {
    const symbol = req.params.symbol.toUpperCase();

    const item = await Watchlist.findOne({ user: req.user._id, symbol });

    res.status(200).json({
      success:       true,
      symbol,
      isWatchlisted: !!item,
      itemId:        item?._id || null,
    });
  } catch (err) {
    next(err);
  }
};