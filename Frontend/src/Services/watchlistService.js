import api from "./api.js";

export const watchlistService = {

  getWatchlist: async () => {
    const res = await api.get("/watchlist");
    return res.data;
  },

  add: async (symbol) => {
    const res = await api.post(`/watchlist/${symbol}`);
    return res.data;
  },

  remove: async (symbol) => {
    const res = await api.delete(`/watchlist/${symbol}`);
    return res.data;
  },

  clear: async () => {
    const res = await api.delete("/watchlist");
    return res.data;
  },

  check: async (symbol) => {
    const res = await api.get(`/watchlist/check/${symbol}`);
    return res.data;
  },
};