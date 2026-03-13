import axios        from "axios";
import YahooFinance from "yahoo-finance2";
const yahooFinance = new YahooFinance();
const ML_URL = process.env.ML_SERVICE_URL || "http://localhost:5001";

/* ── Check if ML service is alive ────────────────────────── */
export const checkMLHealth = async () => {
  try {
    const res = await axios.get(`${ML_URL}/health`, { timeout: 5000 });
    return res.data?.status === "ok";
  } catch {
    return false;
  }
};

const fetchPriceHistory = async (symbol) => {
  try {
    const yahooFinance = new YahooFinance({ suppressNotices: ['ripHistorical'] });
    const endDate   = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);

    const result = await yahooFinance.chart(symbol, {
      period1:  startDate.toISOString().split("T")[0],
      period2:  endDate.toISOString().split("T")[0],
      interval: "1d",
    });

    const quotes = result?.quotes ?? [];
    if (!quotes.length) throw new Error(`No data returned for ${symbol}`);

    return quotes
      .filter(d => d.close != null)
      .map(d => ({
        price:     d.close,
        volume:    d.volume ?? 0,
        timestamp: new Date(d.date).toISOString(),
      }));
  } catch (err) {
    throw new Error(`Failed to fetch price history for ${symbol}: ${err.message}`);
  }
};

/* ── Request prediction from ML service ─────────────────── */
export const requestMLPrediction = async (symbol) => {
  // Fetch price history first — ML needs it
  const priceHistory = await fetchPriceHistory(symbol);

  if (priceHistory.length < 10)
    throw new Error(`Not enough price history for ${symbol}. Need at least 10 days.`);

  const response = await axios.post(
    `${ML_URL}/predict`,
    { symbol, priceHistory },  // ← ML expects both fields
    { timeout: 30000 }
  );

  // ML returns { success: true, data: { ... } }
  if (!response.data?.success)
    throw new Error(response.data?.error || "ML prediction failed");

  return response.data.data; // ← unwrap nested data
};

/* ── Get model info ──────────────────────────────────────── */
export const getMLModelInfo = async () => {
  try {
    const res = await axios.get(`${ML_URL}/model-info`, { timeout: 5000 });
    return res.data;
  } catch {
    return null;
  }
};