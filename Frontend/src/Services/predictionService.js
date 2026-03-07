import api from "./api.js";

export const predictionService = {

  requestPrediction: async (symbol) => {
    // Returns 202 immediately — listen for Socket.IO "prediction:ready" event
    const res = await api.post("/predict", { symbol });
    return res.data;
  },

  getHistory: async (params = {}) => {
    // params: { symbol, status, page, limit }
    const res = await api.get("/predict/history", { params });
    return res.data;
  },

  getPrediction: async (id) => {
    const res = await api.get(`/predict/${id}`);
    return res.data.prediction;
  },

  getLatest: async (symbol) => {
    const res = await api.get(`/predict/latest/${symbol}`);
    return res.data.prediction;
  },

  getTrending: async () => {
    const res = await api.get("/predict/trending");
    return res.data;
  },

  getUsage: async () => {
    const res = await api.get("/predict/usage");
    return res.data.usage;
  },
};