import api from "./api.js";

export const portfolioService = {

  getPortfolio: async () => {
    const res = await api.get("/portfolio");
    return res.data;
  },

  getSummary: async () => {
    const res = await api.get("/portfolio/summary");
    return res.data;
  },

  getHolding: async (symbol) => {
    const res = await api.get(`/portfolio/${symbol}`);
    return res.data;
  },

  getPnL: async () => {
    const res = await api.get("/portfolio/pnl");
    return res.data;
  },

  getAllocation: async () => {
    const res = await api.get("/portfolio/allocation");
    return res.data;
  },
};