import  YahooFinance from 'yahoo-finance2';
import Stock             from "../Models/Stock.js";

const yahooFinance = new YahooFinance({
 suppressNotices: ['yahooSurvey'] 
 });

/* ============================================================
   STOCK SERVICE
   Yahoo Finance fetching, MongoDB updates, Redis caching.
   ============================================================ */

/* ── Stocks to track ───────────────────────────────────────── */
export const TRACKED_STOCKS = [
  // Indian stocks (NSE)
  { symbol: "RELIANCE.NS",   companyName: "Reliance Industries",  exchange: "NSE",    sector: "Energy",        volatility: 1.2 },
  { symbol: "TCS.NS",        companyName: "Tata Consultancy",     exchange: "NSE",    sector: "Technology",    volatility: 0.9 },
  { symbol: "INFY.NS",       companyName: "Infosys",              exchange: "NSE",    sector: "Technology",    volatility: 1.0 },
  { symbol: "HDFCBANK.NS",   companyName: "HDFC Bank",            exchange: "NSE",    sector: "Banking",       volatility: 0.8 },
  { symbol: "WIPRO.NS",      companyName: "Wipro",                exchange: "NSE",    sector: "Technology",    volatility: 1.1 },
 
  { symbol: "ICICIBANK.NS",  companyName: "ICICI Bank",           exchange: "NSE",    sector: "Banking",       volatility: 0.9 },
  { symbol: "BAJFINANCE.NS", companyName: "Bajaj Finance",        exchange: "NSE",    sector: "Finance",       volatility: 1.3 },
  { symbol: "ADANIENT.NS",   companyName: "Adani Enterprises",    exchange: "NSE",    sector: "Conglomerate",  volatility: 1.8 },
  { symbol: "SUNPHARMA.NS",  companyName: "Sun Pharmaceutical",   exchange: "NSE",    sector: "Pharma",        volatility: 1.0 },

  // US stocks
  { symbol: "AAPL",          companyName: "Apple Inc.",           exchange: "NASDAQ", sector: "Technology",    volatility: 0.9 },
  { symbol: "TSLA",          companyName: "Tesla Inc.",           exchange: "NASDAQ", sector: "Automobile",    volatility: 2.0 },
  { symbol: "MSFT",          companyName: "Microsoft Corp.",      exchange: "NASDAQ", sector: "Technology",    volatility: 0.8 },
  { symbol: "GOOGL",         companyName: "Alphabet Inc.",        exchange: "NASDAQ", sector: "Technology",    volatility: 1.0 },
  { symbol: "AMZN",          companyName: "Amazon.com Inc.",      exchange: "NASDAQ", sector: "E-Commerce",    volatility: 1.1 },
];

/* ============================================================
   SEED STOCKS — run once on server start
   ============================================================ */
export const seedStocks = async () => {
  try {
    for (const stock of TRACKED_STOCKS) {
      const exists = await Stock.findOne({ symbol: stock.symbol });
      if (!exists) {
        await Stock.create({
          symbol:           stock.symbol,
          companyName:      stock.companyName,
          exchange:         stock.exchange,
          sector:           stock.sector,
          volatilityFactor: stock.volatility,
          currentPrice:     0,
          isActive:         true,
        });
        console.log(`✅ Seeded: ${stock.symbol}`);
      }
    }
    console.log("📦 Stock seeding complete");
  } catch (err) {
    console.error("❌ Stock seeding failed:", err.message);
  }
};

/* ============================================================
   FETCH QUOTE — single stock from Yahoo Finance v3
   ============================================================ */
export const fetchQuote = async (symbol) => {
  try {
    const quote = await yahooFinance.quote(symbol);
    return {
      symbol:        quote.symbol,
      currentPrice:  quote.regularMarketPrice         || 0,
      previousClose: quote.regularMarketPreviousClose  || 0,
      openPrice:     quote.regularMarketOpen           || 0,
      dayHigh:       quote.regularMarketDayHigh        || 0,
      dayLow:        quote.regularMarketDayLow         || 0,
      volume:        quote.regularMarketVolume         || 0,
      marketCap:     quote.marketCap                   || 0,
      weekHigh52:    quote.fiftyTwoWeekHigh             || 0,
      weekLow52:     quote.fiftyTwoWeekLow              || 0,
    };
  } catch (err) {
    console.error(`❌ Yahoo Finance fetch failed for ${symbol}:`, err.message);
    return null;
  }
};

/* ============================================================
   SYNC SINGLE STOCK — fetch + update DB + circuit breaker
   ============================================================ */
export const syncStock = async (symbol) => {
  try {
    const quoteData = await fetchQuote(symbol);
    if (!quoteData) return null;

    const stock = await Stock.findOne({ symbol: symbol.toUpperCase() });
    if (!stock) return null;

    const prevPrice = stock.currentPrice;

    stock.currentPrice  = quoteData.currentPrice;
    stock.previousClose = quoteData.previousClose;
    stock.openPrice     = quoteData.openPrice;
    stock.dayHigh       = quoteData.dayHigh;
    stock.dayLow        = quoteData.dayLow;
    stock.volume        = quoteData.volume;
    stock.marketCap     = quoteData.marketCap;
    stock.weekHigh52    = quoteData.weekHigh52;
    stock.weekLow52     = quoteData.weekLow52;
    stock.lastSyncedAt  = new Date();
    stock.syncError     = null;

    if (quoteData.currentPrice > 0) {
      stock.pushPricePoint(quoteData.currentPrice, quoteData.volume);
    }

    const wasResumed = stock.checkAndResume();

    // Circuit breaker — halt if price moved >10%
    if (!stock.isHalted && prevPrice > 0 && quoteData.currentPrice > 0) {
      const pctMove = Math.abs(
        ((quoteData.currentPrice - prevPrice) / prevPrice) * 100
      );
      if (pctMove >= 10) {
        stock.halt(
          `Price moved ${pctMove.toFixed(1)}% — circuit breaker triggered`,
          120000
        );
        console.warn(`🔴 Circuit breaker: ${symbol} halted (${pctMove.toFixed(1)}% move)`);
      }
    }

    await stock.save();

    return { stock, wasResumed, priceChanged: prevPrice !== quoteData.currentPrice };
  } catch (err) {
    await Stock.findOneAndUpdate(
      { symbol: symbol.toUpperCase() },
      { syncError: err.message }
    );
    console.error(`❌ syncStock failed for ${symbol}:`, err.message);
    return null;
  }
};

/* ============================================================
   SYNC ALL STOCKS — called by BullMQ worker every 60s
   ============================================================ */
export const syncAllStocks = async () => {
  const results = [];
  const symbols = TRACKED_STOCKS.map((s) => s.symbol);

  console.log(`🔄 Syncing ${symbols.length} stocks...`);

  const BATCH_SIZE = 5;
  for (let i = 0; i < symbols.length; i += BATCH_SIZE) {
    const batch = symbols.slice(i, i + BATCH_SIZE);

    const batchResults = await Promise.allSettled(
      batch.map((symbol) => syncStock(symbol))
    );

    batchResults.forEach((result, idx) => {
      if (result.status === "fulfilled" && result.value) {
        results.push(result.value);
      } else {
        console.error(`❌ Sync failed: ${batch[idx]}`);
      }
    });

    if (i + BATCH_SIZE < symbols.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  console.log(`✅ Synced ${results.length}/${symbols.length} stocks`);
  return results;
};

/* ============================================================
   FETCH HISTORICAL — for ML training (1 year OHLCV)
   ============================================================ */
export const fetchHistorical = async (symbol, days = 365) => {
  try {
    const endDate   = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await yahooFinance.historical(symbol, {
      period1:  startDate,
      period2:  endDate,
      interval: "1d",
    });

    return result.map((day) => ({
      date:   day.date,
      open:   day.open,
      high:   day.high,
      low:    day.low,
      close:  day.close,
      volume: day.volume,
    }));
  } catch (err) {
    console.error(`❌ fetchHistorical failed for ${symbol}:`, err.message);
    return [];
  }
};

/* ============================================================
   REDIS HELPERS
   ============================================================ */
export const cacheStockPrice = async (redisClient, symbol, price) => {
  try {
    await redisClient.set(`stock:price:${symbol}`, price.toString(), "EX", 300);
  } catch (err) {
    console.error(`❌ Redis cache failed for ${symbol}:`, err.message);
  }
};

export const getCachedPrice = async (redisClient, symbol) => {
  try {
    const cached = await redisClient.get(`stock:price:${symbol}`);
    return cached ? parseFloat(cached) : null;
  } catch (err) {
    return null;
  }
};

export const getStockPrice = async (redisClient, symbol) => {
  const cached = await getCachedPrice(redisClient, symbol);
  if (cached) return cached;
  const stock = await Stock.findOne({ symbol: symbol.toUpperCase() }).select("currentPrice");
  return stock ? stock.currentPrice : null;
};