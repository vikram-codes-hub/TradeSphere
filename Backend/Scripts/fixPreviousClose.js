// Backend/Scripts/fixPreviousClose.js
// Run once: node Backend/Scripts/fixPreviousClose.js
// This fetches real previousClose from Yahoo for all stocks in DB

import mongoose      from "mongoose";
import YahooFinance  from "yahoo-finance2";
import Stock         from "../Models/Stock.js";
import { config }    from "dotenv";

config();

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

const fix = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB");

  const stocks = await Stock.find({ isActive: true });
  console.log(`🔄 Fixing previousClose for ${stocks.length} stocks...`);

  let fixed = 0;
  for (const stock of stocks) {
    try {
      const quote = await yahooFinance.quote(stock.symbol);
      if (!quote?.regularMarketPrice) continue;

      const prevClose = quote.regularMarketPreviousClose || quote.regularMarketPrice;
      
      stock.currentPrice  = quote.regularMarketPrice;
      stock.previousClose = prevClose;
      stock.openPrice     = quote.regularMarketOpen     || prevClose;
      stock.dayHigh       = quote.regularMarketDayHigh  || quote.regularMarketPrice;
      stock.dayLow        = quote.regularMarketDayLow   || quote.regularMarketPrice;
      stock.volume        = quote.regularMarketVolume   || 0;
      stock.marketCap     = quote.marketCap             || 0;
      stock.weekHigh52    = quote.fiftyTwoWeekHigh       || 0;
      stock.weekLow52     = quote.fiftyTwoWeekLow        || 0;
      stock.lastSyncedAt  = new Date();

      await stock.save();
      
      const change = (quote.regularMarketPrice - prevClose).toFixed(2);
      const pct    = prevClose > 0 ? (((quote.regularMarketPrice - prevClose) / prevClose) * 100).toFixed(2) : 0;
      console.log(`✅ ${stock.symbol}: ₹${quote.regularMarketPrice} (${pct > 0 ? "+" : ""}${pct}%)`);
      fixed++;

      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 300));
    } catch (err) {
      console.error(`❌ Failed for ${stock.symbol}:`, err.message);
    }
  }

  console.log(`\n✅ Fixed ${fixed}/${stocks.length} stocks`);
  await mongoose.disconnect();
  process.exit(0);
};

fix().catch(err => {
  console.error("❌ Script failed:", err);
  process.exit(1);
});