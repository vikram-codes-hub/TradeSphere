import Trade from "../Models/Trade.js";
import User from "../Models/User.js";
import Portfolio from "../Models/Portfolio.js";
import Stock from "../Models/Stock.js";
import { fetchQuote, getStockPrice } from "../Services/Stockservice.js";
import { getRedisClient } from "../Config/redis.js";

//Get live price
export const getLivePrice = async (req, res) => {
  const redisClient = getRedisClient();
  const cached = await getStockPrice(redisClient, symbol);
  if (cached) return cached;
  const quote = await fetchQuote(symbol);
  return quote?.currentPrice || null;
};

/* ============================================================
   BUY STOCK — POST 
   ============================================================ */
export const buyStock = async (req, res, next) => {
  try {
    const { symbol, quantity } = req.body;
    if (!symbol || !quantity || quantity <= 0)
      return res.status(400).json({
        success: false,
        message: "Please provide a valid symbol and quantity.",
      });

    const qty = parseInt(quantity);
    const stockDoc = await Stock.findOne({ symbol: symbol.toUpperCase() });

    if (stockDoc?.isHalted)
      return res.status(400).json({
        success: false,
        message: `Trading halted for ${symbol}. Reason: ${stockDoc.haltReason}`,
      });

    const price = await getLivePrice(symbol.toUpperCase());
    if (!price)
      return res.status(404).json({
        success: false,
        message: `Could not fetch live price for ${symbol}. Check the symbol and try again.`,
      });

    const totalCost = parseFloat((price * qty).toFixed(2));
    const user = await User.findById(req.user._id);

    if (user.cashBalance < totalCost)
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Need ₹${totalCost.toLocaleString()} but you have ₹${user.cashBalance.toLocaleString()}.`,
        required: totalCost,
        available: user.cashBalance,
      });

    // Deduct balance
    user.cashBalance = parseFloat((user.cashBalance - totalCost).toFixed(2));
    user.totalTrades += 1;
    await user.save({ validateBeforeSave: false });

    // Update portfolio
    let holding = await Portfolio.findOne({
      user: req.user._id,
      symbol: symbol.toUpperCase(),
    });
    if (holding) {
      const totalQty = holding.quantity + qty;
      const totalCostBasis =
        holding.avgBuyPrice * holding.quantity + price * qty;
      holding.avgBuyPrice = parseFloat((totalCostBasis / totalQty).toFixed(2));
      holding.quantity = totalQty;
      holding.currentPrice = price;
      holding.lastUpdated = new Date();
    } else {
      holding = new Portfolio({
        user: req.user._id,
        symbol: symbol.toUpperCase(),
        companyName: stockDoc?.companyName || symbol.toUpperCase(),
        quantity: qty,
        avgBuyPrice: price,
        currentPrice: price,
        exchange: stockDoc?.exchange || "NSE",
        sector: stockDoc?.sector || "Unknown",
      });
    }
    await holding.save();

    // Record trade
    const trade = await Trade.create({
      user: req.user._id,
      symbol: symbol.toUpperCase(),
      companyName: stockDoc?.companyName || symbol.toUpperCase(),
      type: "BUY",
      quantity: qty,
      price,
      totalAmount: totalCost,
      balanceAfter: user.cashBalance,
    });

    global.io?.emit("trade:executed", {
      userId: req.user._id,
      userName: user.name,
      symbol: symbol.toUpperCase(),
      type: "BUY",
      quantity: qty,
      price,
      totalAmount: totalCost,
      time: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: `Successfully bought ${qty} shares of ${symbol.toUpperCase()} at ₹${price}.`,
      trade: {
        _id: trade._id,
        symbol: trade.symbol,
        type: "BUY",
        quantity: qty,
        price,
        totalAmount: totalCost,
        balanceAfter: user.cashBalance,
        executedAt: trade.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ============================================================
   SELL STOCK — POST
   ============================================================ */
export const sellStock = async (req, res, next) => {
  try {
    const { symbol, quantity } = req.body;
    if (!symbol || !quantity || quantity <= 0)
      return res.status(400).json({
        success: false,
        message: "Please provide a valid symbol and quantity.",
      });
    const qty = parseInt(quantity);
    const stockDoc = await Stock.findOne({ symbol: symbol.toUpperCase() });
    if (stockDoc?.isHalted)
      return res.status(400).json({
        success: false,
        message: `Trading halted for ${symbol}. Reason: ${stockDoc.haltReason}`,
      });

    const holding = await Portfolio.findOne({
      user: req.user._id,
      symbol: symbol.toUpperCase(),
    });
    if (!holding || holding.quantity < qty)
      return res.status(400).json({
        success: false,
        message: !holding
          ? `You don't own any shares of ${symbol}.`
          : `Insufficient shares. You own ${holding.quantity} but tried to sell ${qty}.`,
        owned: holding?.quantity || 0,
      });

    const price = await getLivePrice(symbol.toUpperCase());
    if (!price)
      return res.status(404).json({
        success: false,
        message: `Could not fetch live price for ${symbol}. Check the symbol and try again.`,
      });

    const totalReceived = parseFloat((price * qty).toFixed(2));
    const pnl = parseFloat(((price - holding.avgBuyPrice) * qty).toFixed(2));
    const pnlPct = parseFloat(
      (((price - holding.avgBuyPrice) / holding.avgBuyPrice) * 100).toFixed(2),
    );

    //update the user
    const user = await User.findById(req.user._id);
    user.cashBalance = parseFloat(
      (user.cashBalance + totalReceived).toFixed(2),
    );
    user.totalTrades += 1;
    user.totalPnl = parseFloat((user.totalPnl + pnl).toFixed(2));
    if (pnl > 0) user.winningTrades += 1;
    await user.save({ validateBeforeSave: false });

    //update the user Portfolio
    holding.quantity -= qty;
    holding.currentPrice = price;
    holding.lastUpdated = new Date();
    if (holding.quantity === 0) {
      await Portfolio.deleteOne({ _id: holding._id });
    } else {
      await holding.save();
    }
    // Record trade
    const trade = await Trade.create({
      user: req.user._id,
      symbol: symbol.toUpperCase(),
      companyName: stockDoc?.companyName || symbol.toUpperCase(),
      type: "SELL",
      quantity: qty,
      price,
      totalAmount: totalReceived,
      pnl,
      pnlPct,
      avgBuyPrice: holding.avgBuyPrice,
      balanceAfter: user.cashBalance,
    });

    global.io?.emit("trade:executed", {
      userId: req.user._id,
      userName: user.name,
      symbol: symbol.toUpperCase(),
      type: "SELL",
      quantity: qty,
      price,
      totalAmount: totalReceived,
      pnl,
      time: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      message: `Successfully sold ${qty} shares of ${symbol.toUpperCase()} at ₹${price}.`,
      trade: {
        _id: trade._id,
        symbol: trade.symbol,
        type: "SELL",
        quantity: qty,
        price,
        totalAmount: totalReceived,
        pnl,
        pnlPct,
        balanceAfter: user.cashBalance,
        executedAt: trade.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ============================================================
   GET TRADE HISTORY — GET 
   ============================================================ */

export const getTradeHistory = async (req, res, next) => {
  try {
    const { symbol, type, page = 1, limit = 20 } = req.query;
    let query = { user: req.user._id };

    if (symbol) query.symbol = symbol.toUpperCase();
    if (type) query.type = type.toUpperCase();

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Trade.countDocuments(query);

    const trades = await Trade.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: trades.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      trades,
    });
  } catch (error) {
    next(error);
  }
};

/* ============================================================
   GET SINGLE TRADE — GET 
   ============================================================ */
export const getTrade = async (req, res, next) => {
  try {
    const trade = await Trade.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!trade)
      return res
        .status(404)
        .json({ success: false, message: "Trade not found." });
    res.status(200).json({ success: true, trade });
  } catch (err) {
    next(err);
  }
};

/* ============================================================
   GET TRADE STATS — GET 
   ============================================================ */
export const getTradeStats = async (req, res, next) => {
  try {
    const [stats] = await Trade.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: null,
          totalTrades: { $sum: 1 },
          totalBuys: { $sum: { $cond: [{ $eq: ["$type", "BUY"] }, 1, 0] } },
          totalSells: { $sum: { $cond: [{ $eq: ["$type", "SELL"] }, 1, 0] } },
          totalPnl: { $sum: "$pnl" },
          winningTrades: { $sum: { $cond: [{ $gt: ["$pnl", 0] }, 1, 0] } },
          losingTrades: { $sum: { $cond: [{ $lt: ["$pnl", 0] }, 1, 0] } },
          totalVolume: { $sum: "$totalAmount" },
          avgTradeSize: { $avg: "$totalAmount" },
          bestTrade: { $max: "$pnl" },
          worstTrade: { $min: "$pnl" },
        },
      },
    ]);

    if (!stats)
      return res
        .status(200)
        .json({
          success: true,
          stats: { totalTrades: 0, totalPnl: 0, winRate: 0 },
        });

    res.status(200).json({
      success: true,
      stats: {
        ...stats,
        winRate: parseFloat(
          ((stats.winningTrades / (stats.totalSells || 1)) * 100).toFixed(2),
        ),
      },
    });
  } catch (err) {
    next(err);
  }
};
