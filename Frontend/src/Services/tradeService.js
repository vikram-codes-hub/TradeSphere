import api from "./api.js";

export const tradeService = {

  buy: async (symbol, quantity) => {
    const res = await api.post("/trades/buy", { symbol, quantity });
    return res.data;
  },

  sell: async (symbol, quantity) => {
    const res = await api.post("/trades/sell", { symbol, quantity });
    return res.data;
  },

  getHistory: async (params = {}) => {
    // params: { symbol, type, page, limit }
    const res = await api.get("/trades/history", { params });
    return res.data;
  },

  getTrade: async (id) => {
    const res = await api.get(`/trades/${id}`);
    return res.data.trade;
  },

  getStats: async () => {
    const res = await api.get("/trades/stats");
    return res.data.stats;
  },
};