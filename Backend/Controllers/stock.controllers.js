import YahooFinance from "yahoo-finance2";
const yahooFinance = new YahooFinance();

import Stock from "../Models/Stock.js";
import { fetchHistorical, getStockPrice } from "../Services/Stockservice.js";
import { getRedisClient } from "../Config/redis.js";

// ── helpers ───────────────────────────────────────────────
const deriveExchange = (symbol) => {
  if (symbol.endsWith(".NS"))  return "NSE";
  if (symbol.endsWith(".BSE")) return "BSE";
  return "NASDAQ";
};

const withChange = (s) => {
  const change = parseFloat(((s.currentPrice || 0) - (s.previousClose || 0)).toFixed(2));
  const pct    = (s.previousClose || 0) > 0
    ? parseFloat((((s.currentPrice - s.previousClose) / s.previousClose) * 100).toFixed(2))
    : 0;
  return {
    ...s.toObject(),
    priceChange:    change,
    priceChangePct: pct,
  };
};

/* ── Name → Symbol dictionary ────────────────────────────
   Common names users might type → actual Yahoo ticker
   Add more as needed
   ──────────────────────────────────────────────────────── */
const NAME_TO_SYMBOL = {
  // US Stocks
  "nvidia":       "NVDA",
  "nvdia":        "NVDA",
  "nvidea":       "NVDA",
  "apple":        "AAPL",
  "microsoft":    "MSFT",
  "google":       "GOOGL",
  "alphabet":     "GOOGL",
  "amazon":       "AMZN",
  "tesla":        "TSLA",
  "meta":         "META",
  "facebook":     "META",
  "netflix":      "NFLX",
  "amd":          "AMD",
  "intel":        "INTC",
  "paypal":       "PYPL",
  "uber":         "UBER",
  "twitter":      "TWTR",
  "spotify":      "SPOT",
  "adobe":        "ADBE",
  "salesforce":   "CRM",
  "oracle":       "ORCL",
  "qualcomm":     "QCOM",
  "broadcom":     "AVGO",
  "disney":       "DIS",
  "walmart":      "WMT",
  "jpmorgan":     "JPM",
  "jp morgan":    "JPM",
  "goldmansachs": "GS",
  "goldman sachs":"GS",
  "berkshire":    "BRK-B",
  "exxon":        "XOM",
  "cocacola":     "KO",
  "coca cola":    "KO",
  "pepsi":        "PEP",
  "pepsico":      "PEP",
  "johnson":      "JNJ",
  "pfizer":       "PFE",
  "visa":         "V",
  "mastercard":   "MA",
  "colgate":      "CL",
  "colgatepalmolive": "CL",
  "colgate palmolive": "CL",

  // Indian Stocks (NSE)
  "reliance":         "RELIANCE.NS",
  "tcs":              "TCS.NS",
  "tata consultancy": "TCS.NS",
  "infosys":          "INFY.NS",
  "infy":             "INFY.NS",
  "wipro":            "WIPRO.NS",
  "hdfc":             "HDFCBANK.NS",
  "hdfc bank":        "HDFCBANK.NS",
  "icici":            "ICICIBANK.NS",
  "icici bank":       "ICICIBANK.NS",
  "sbi":              "SBIN.NS",
  "state bank":       "SBIN.NS",
  "bajaj finance":    "BAJFINANCE.NS",
  "bajaj":            "BAJFINANCE.NS",
  "adani":            "ADANIENT.NS",
  "tata motors":      "TATAMOTORS.NS",
  "tatamotors":       "TATAMOTORS.NS",
  "sun pharma":       "SUNPHARMA.NS",
  "sunpharma":        "SUNPHARMA.NS",
  "hindustan unilever":"HINDUNILVR.NS",
  "hul":              "HINDUNILVR.NS",
  "maruti":           "MARUTI.NS",
  "itc":              "ITC.NS",
  "axis bank":        "AXISBANK.NS",
  "kotak":            "KOTAKBANK.NS",
  "kotak bank":       "KOTAKBANK.NS",
  "ongc":             "ONGC.NS",
  "ntpc":             "NTPC.NS",
  "powergrid":        "POWERGRID.NS",
  "ultratech":        "ULTRACEMCO.NS",
  "asian paints":     "ASIANPAINT.NS",
  "dr reddy":         "DRREDDY.NS",
  "cipla":            "CIPLA.NS",
  "techm":            "TECHM.NS",
  "tech mahindra":    "TECHM.NS",
  "hcltech":          "HCLTECH.NS",
  "hcl":              "HCLTECH.NS",
  "ltimindtree":      "LTIM.NS",
  "zomato":           "ZOMATO.NS",
  "nykaa":            "NYKAA.NS",
  "paytm":            "PAYTM.NS",
};

// Fuzzy match: find closest key in dictionary
const findSymbolFromName = (q) => {
  const lower = q.toLowerCase().trim();

  // Exact match
  if (NAME_TO_SYMBOL[lower]) return NAME_TO_SYMBOL[lower];

  // Partial match — query is contained in a key or key is contained in query
  for (const [name, symbol] of Object.entries(NAME_TO_SYMBOL)) {
    if (name.includes(lower) || lower.includes(name)) {
      return symbol;
    }
  }

  return null;
};

// Fetch quote from Yahoo by symbol
const fetchQuoteAndSeed = async (symbol) => {
  const existing = await Stock.findOne({ symbol });
  if (existing) {
    if (!existing.isActive) { existing.isActive = true; await existing.save(); }
    return existing;
  }

  try {
    const quote = await yahooFinance.quote(symbol);
    if (!quote?.regularMarketPrice) return null;

    const newStock = await Stock.create({
      symbol,
      companyName:   quote.longName || quote.shortName || symbol,
      exchange:      deriveExchange(symbol),
      sector:        quote.sector   || "Unknown",
      industry:      quote.industry || "Unknown",
      currentPrice:  quote.regularMarketPrice,
      previousClose: quote.regularMarketPreviousClose || quote.regularMarketPrice,
      openPrice:     quote.regularMarketOpen          || quote.regularMarketPrice,
      dayHigh:       quote.regularMarketDayHigh       || quote.regularMarketPrice,
      dayLow:        quote.regularMarketDayLow        || quote.regularMarketPrice,
      volume:        quote.regularMarketVolume        || 0,
      marketCap:     quote.marketCap                  || 0,
      weekHigh52:    quote.fiftyTwoWeekHigh            || 0,
      weekLow52:     quote.fiftyTwoWeekLow             || 0,
      isActive:      true,
      lastSyncedAt:  new Date(),
    });
    console.log(`[Stock Search] Seeded: ${symbol} (${newStock.companyName})`);
    return newStock;
  } catch (err) {
    console.error(`[Stock Search] Failed to seed ${symbol}:`, err.message);
    return null;
  }
};

/* ============================================================
   SEARCH + AUTO-SEED
   GET /api/stocks/search?q=nvidia
   Strategy:
   1. Search DB by symbol + companyName regex
   2. Check name→symbol dictionary for fuzzy name match
   3. Try direct Yahoo quote() with symbol variations
   4. Seed any new stock found into DB
   ============================================================ */
export const searchStocks = async (req, res, next) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.status(400).json({ success: false, message: "Query param 'q' is required." });

    // ── Step 1: DB search ─────────────────────────────────
    const dbResults = await Stock.find({
      isActive: true,
      $or: [
        { symbol:      { $regex: q, $options: "i" } },
        { companyName: { $regex: q, $options: "i" } },
      ],
    }).limit(10);

    if (dbResults.length >= 3) {
      return res.status(200).json({
        success: true, source: "db",
        count: dbResults.length, stocks: dbResults.map(withChange),
      });
    }

    const existingSymbols = new Set(dbResults.map(s => s.symbol));
    const seeded          = [];

    // ── Step 2: Name dictionary lookup ────────────────────
    const mappedSymbol = findSymbolFromName(q);
    if (mappedSymbol && !existingSymbols.has(mappedSymbol)) {
      console.log(`[Stock Search] Name match: "${q}" → ${mappedSymbol}`);
      const stock = await fetchQuoteAndSeed(mappedSymbol);
      if (stock) {
        seeded.push(stock);
        existingSymbols.add(mappedSymbol);
      }
    }

    // ── Step 3: Direct symbol quote fallback ──────────────
    // Try treating the query itself as a symbol (e.g. user types "NVDA")
    if (seeded.length === 0) {
      const upper      = q.toUpperCase().replace(/\s+/g, "");
      const candidates = [upper, `${upper}.NS`].filter(s => !existingSymbols.has(s));

      for (const sym of candidates) {
        const stock = await fetchQuoteAndSeed(sym);
        if (stock) {
          seeded.push(stock);
          existingSymbols.add(sym);
          break;
        }
      }
    }

    const merged = [...dbResults, ...seeded];
    res.status(200).json({
      success: true,
      source:  seeded.length > 0 ? "yahoo+seeded" : "db",
      count:   merged.length,
      stocks:  merged.map(withChange),
    });
  } catch (err) {
    next(err);
  }
};

/* ============================================================
   GET ALL STOCKS
   ============================================================ */
export const getAllStocks = async (req, res, next) => {
  try {
    const { sector, exchange, search, sort = "symbol" } = req.query;

    let query = { isActive: true };
    if (sector)   query.sector   = sector;
    if (exchange) query.exchange = exchange.toUpperCase();
    if (search) {
      query.$or = [
        { symbol:      { $regex: search, $options: "i" } },
        { companyName: { $regex: search, $options: "i" } },
      ];
    }

    const stocks = await Stock.find(query)
      .select("symbol companyName exchange sector currentPrice previousClose openPrice dayHigh dayLow volume marketCap weekHigh52 weekLow52 isHalted lastSyncedAt")
      .sort(sort);

    res.status(200).json({ success: true, count: stocks.length, stocks: stocks.map(withChange) });
  } catch (err) { next(err); }
};

/* ============================================================
   GET SINGLE STOCK — auto-seeds from Yahoo if not in DB
   ============================================================ */
export const getStock = async (req, res, next) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    let stock    = await Stock.findOne({ symbol, isActive: true });

    if (!stock) {
      try {
        const quote = await yahooFinance.quote(symbol);
        if (!quote?.regularMarketPrice)
          return res.status(404).json({ success: false, message: `Stock ${symbol} not found.` });

        stock = await Stock.create({
          symbol,
          companyName:   quote.longName || quote.shortName || symbol,
          exchange:      deriveExchange(symbol),
          sector:        quote.sector   || "Unknown",
          industry:      quote.industry || "Unknown",
          currentPrice:  quote.regularMarketPrice,
          previousClose: quote.regularMarketPreviousClose || quote.regularMarketPrice,
          openPrice:     quote.regularMarketOpen          || quote.regularMarketPrice,
          dayHigh:       quote.regularMarketDayHigh       || quote.regularMarketPrice,
          dayLow:        quote.regularMarketDayLow        || quote.regularMarketPrice,
          volume:        quote.regularMarketVolume        || 0,
          marketCap:     quote.marketCap                  || 0,
          weekHigh52:    quote.fiftyTwoWeekHigh            || 0,
          weekLow52:     quote.fiftyTwoWeekLow             || 0,
          isActive:      true,
          lastSyncedAt:  new Date(),
        });
      } catch (_) {
        return res.status(404).json({ success: false, message: `Stock ${symbol} not found.` });
      }
    }

    res.status(200).json({ success: true, stock: withChange(stock) });
  } catch (err) { next(err); }
};

/* ============================================================
   GET STOCK HISTORY
   ============================================================ */
export const getStockHistory = async (req, res, next) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const stock  = await Stock.findOne({ symbol, isActive: true });
    if (!stock) return res.status(404).json({ success: false, message: `Stock ${symbol} not found.` });

    res.status(200).json({
      success: true, symbol: stock.symbol,
      companyName: stock.companyName, priceHistory: stock.priceHistory || [],
    });
  } catch (err) { next(err); }
};

/* ============================================================
   GET HISTORICAL OHLCV
   ============================================================ */
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

/* ============================================================
   GET CURRENT PRICE
   ============================================================ */
export const getCurrentPrice = async (req, res, next) => {
  try {
    const symbol      = req.params.symbol.toUpperCase();
    const redisClient = getRedisClient();
    const price       = await getStockPrice(redisClient, symbol);
    if (!price) return res.status(404).json({ success: false, message: `Price not available for ${symbol}.` });

    res.status(200).json({ success: true, symbol, price, cachedAt: new Date().toISOString() });
  } catch (err) { next(err); }
};

/* ============================================================
   GET MARKET SUMMARY
   ============================================================ */
export const getMarketSummary = async (req, res, next) => {
  try {
    const stocks = await Stock.find({ isActive: true })
      .select("symbol companyName exchange sector currentPrice previousClose volume marketCap isHalted");

    const mapped = stocks.map(s => ({
      symbol: s.symbol, companyName: s.companyName, exchange: s.exchange,
      sector: s.sector, currentPrice: s.currentPrice, previousClose: s.previousClose,
      volume: s.volume, marketCap: s.marketCap, isHalted: s.isHalted,
      priceChange:    parseFloat(((s.currentPrice || 0) - (s.previousClose || 0)).toFixed(2)),
      priceChangePct: (s.previousClose || 0) > 0
        ? parseFloat((((s.currentPrice - s.previousClose) / s.previousClose) * 100).toFixed(2))
        : 0,
    }));

    res.status(200).json({
      success: true,
      summary: {
        totalStocks:  mapped.length,
        gainersCount: mapped.filter(s => s.priceChangePct > 0).length,
        losersCount:  mapped.filter(s => s.priceChangePct < 0).length,
        haltedCount:  mapped.filter(s => s.isHalted).length,
      },
      gainers:    [...mapped].sort((a, b) => b.priceChangePct - a.priceChangePct).slice(0, 5),
      losers:     [...mapped].sort((a, b) => a.priceChangePct - b.priceChangePct).slice(0, 5),
      mostActive: [...mapped].sort((a, b) => b.volume - a.volume).slice(0, 5),
      halted:     mapped.filter(s => s.isHalted),
    });
  } catch (err) { next(err); }
};

/* ============================================================
   ADMIN — HALT / RESUME
   ============================================================ */
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
      return res.status(200).json({ success: true, message: `${symbol} trading halted.` });
    }
  } catch (err) { next(err); }
};