import api from "./api.js";

export const stockService = {

  getAllStocks: async (params = {}) => {
    // params: { sector, exchange, search, sort }
    const res = await api.get("/stocks", { params });
    return res.data;
  },

  getStock: async (symbol) => {
    const res = await api.get(`/stocks/${symbol}`);
    return res.data.stock;
  },

  getStockHistory: async (symbol) => {
    const res = await api.get(`/stocks/${symbol}/history`);
    return res.data;
  },

  getHistoricalData: async (symbol, days = 365) => {
    const res = await api.get(`/stocks/${symbol}/historical`, { params: { days } });
    return res.data;
  },

  getLivePrice: async (symbol) => {
    const res = await api.get(`/stocks/${symbol}/price`);
    return res.data;
  },

  getMarketSummary: async () => {
    const res = await api.get("/stocks/summary");
    return res.data;
  },
};