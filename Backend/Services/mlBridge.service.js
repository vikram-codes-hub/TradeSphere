import axios from "axios";

const ML_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

/* ── Check if ML service is alive ────────────────────────── */
export const checkMLHealth = async () => {
  try {
    const res = await axios.get(`${ML_URL}/health`, { timeout: 5000 });
    return res.data?.status === "ok";
  } catch {
    return false;
  }
};

/* ── Request prediction from ML service ─────────────────── */
export const requestMLPrediction = async (symbol) => {
  const response = await axios.post(
    `${ML_URL}/predict`,
    { symbol },
    { timeout: 30000 }
  );
  return response.data;
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