import Stock from "../Models/Stock.js";
import { fetchHistorical, getStockPrice, TRACKED_STOCKS } from "../Services/Stockservice.js";
import { getRedisClient } from "../Config/redis.js";

//get all stocks

export const getAllStocks = async (req, res, next) => {
  try {
    const { sector, exchange, search, sort = "symbol" } = req.query;

    let query = { isActive: true };
    if (sector)   query.sector   = sector;
    if (exchange) query.exchange  = exchange.toUpperCase();
    if (search) {
      query.$or = [
        { symbol:      { $regex: search, $options: "i" } },
        { companyName: { $regex: search, $options: "i" } },
      ];
    }
    const stocks = await Stock.find(query)
      .select("symbol companyName exchange sector currentPrice previousClose openPrice dayHigh dayLow volume marketCap weekHigh52 weekLow52 isHalted lastSyncedAt")
      .sort(sort);

    const stocksWithChange = stocks.map((s) => ({
      ...s.toObject(),
      priceChange:    parseFloat((s.currentPrice - s.previousClose).toFixed(2)),
      priceChangePct: s.previousClose > 0
        ? parseFloat((((s.currentPrice - s.previousClose) / s.previousClose) * 100).toFixed(2))
        : 0,
    }));

    res.status(200).json({ success: true, count: stocksWithChange.length, stocks: stocksWithChange });
  } catch (err) { next(err); }
};

//get single stock by symbol
export const getStock=async(req,res,next)=>{
    try {
    const symbol = req.params.symbol.toUpperCase();
    const stock  = await Stock.findOne({ symbol, isActive: true });
    if (!stock) return res.status(404).json({ success: false, message: `Stock ${symbol} not found.` });
        res.status(200).json({
      success: true,
      stock: {
        ...stock.toObject(),
        priceChange:    parseFloat((stock.currentPrice - stock.previousClose).toFixed(2)),
        priceChangePct: stock.previousClose > 0
          ? parseFloat((((stock.currentPrice - stock.previousClose) / stock.previousClose) * 100).toFixed(2))
          : 0,
      },
    });
    } catch (error) {  next(error); }
}

//get price history for chart
export const getStockHistory=async(req,res,next)=>{
    try {
    const symbol=req.params.symbol.toUpperCase();
     const stock  = await Stock.findOne({ symbol, isActive: true });
    if (!stock) return res.status(404).json({ success: false, message: `Stock ${symbol} not found.` });
      res.status(200).json({
      success:      true,
      symbol:       stock.symbol,
      companyName:  stock.companyName,
      priceHistory: stock.priceHistory || [],
    });
    } catch (error) {
        next(error);
    }
}

// /* GET HISTORICAL OHLCV 
export const getHistoricalData = async (req, res, next) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const days   = parseInt(req.query.days) || 365;
    if (days > 1825) return res.status(400).json({ success: false, message: "Max 5 years (1825 days)." });

    const data = await fetchHistorical(symbol, days);
    if (!data || data.length === 0)
      return res.status(404).json({ success: false, message: `No historical data for ${symbol}.` });

    res.status(200).json({ success: true, symbol, days, count: data.length, data });
  } catch (err) { next(err); }
};

//get current price (with Redis caching)
export const getCurrentPrice = async (req, res, next) => {
    try {
    const symbol = req.params.symbol.toUpperCase();
    const redisClient = getRedisClient();
    const price       = await getStockPrice(redisClient, symbol);
    if (!price) return res.status(404).json({ success: false, message: `Price not available for ${symbol}.` });
    res.status(200).json({ success: true, symbol, price, cachedAt: new Date().toISOString() });
    } catch (error) {
        next(error);
    }
}

// /* GET MARKET SUMMARY
export const getMarketSummary = async (req, res, next) => {
  try {
    const stocks = await Stock.find({ isActive: true })
      .select("symbol companyName exchange sector currentPrice previousClose volume marketCap isHalted");

    const withChange = stocks.map((s) => ({
      symbol: s.symbol, companyName: s.companyName, exchange: s.exchange,
      sector: s.sector, currentPrice: s.currentPrice, previousClose: s.previousClose,
      volume: s.volume, marketCap: s.marketCap, isHalted: s.isHalted,
      priceChange:    parseFloat((s.currentPrice - s.previousClose).toFixed(2)),
      priceChangePct: s.previousClose > 0
        ? parseFloat((((s.currentPrice - s.previousClose) / s.previousClose) * 100).toFixed(2))
        : 0,
    }));

    res.status(200).json({
      success: true,
      summary: {
        totalStocks:  withChange.length,
        gainersCount: withChange.filter((s) => s.priceChangePct > 0).length,
        losersCount:  withChange.filter((s) => s.priceChangePct < 0).length,
        haltedCount:  withChange.filter((s) => s.isHalted).length,
      },
      gainers:    [...withChange].sort((a, b) => b.priceChangePct - a.priceChangePct).slice(0, 5),
      losers:     [...withChange].sort((a, b) => a.priceChangePct - b.priceChangePct).slice(0, 5),
      mostActive: [...withChange].sort((a, b) => b.volume - a.volume).slice(0, 5),
      halted:     withChange.filter((s) => s.isHalted),
    });
  } catch (err) { next(err); }
};

/* ADMIN HALT/RESUME  */
export const haltStock = async (req, res, next) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const { reason, duration } = req.body;
    const stock = await Stock.findOne({ symbol });
    if (!stock) return res.status(404).json({ success: false, message: `Stock ${symbol} not found.` });

    if (stock.isHalted) {
      stock.isHalted = false; stock.haltReason = null;
      stock.haltedAt = null;  stock.haltedUntil = null;
      await stock.save();
      global.io?.emit("market:resumed", { symbol });
      return res.status(200).json({ success: true, message: `${symbol} trading resumed.` });
    } else {
      stock.halt(reason || "Manual admin halt", duration || 0);
      await stock.save();
      global.io?.emit("market:halted", { symbol, reason: stock.haltReason, haltedAt: stock.haltedAt });
      return res.status(200).json({ success: true, message: `${symbol} trading halted.`, stock: { symbol, isHalted: true, haltReason: stock.haltReason } });
    }
  } catch (err) { next(err); }
};














