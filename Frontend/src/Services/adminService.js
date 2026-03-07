import api from "./api.js";

export const adminService = {

  getStats: async () => {
    const res = await api.get("/admin/stats");
    return res.data.stats;
  },

  // Users
  getAllUsers: async (params = {}) => {
    // params: { page, limit, role, search, banned }
    const res = await api.get("/admin/users", { params });
    return res.data;
  },

  getUserDetails: async (id) => {
    const res = await api.get(`/admin/users/${id}`);
    return res.data;
  },

  updateUserRole: async (id, role) => {
    const res = await api.put(`/admin/users/${id}/role`, { role });
    return res.data;
  },

  banUser: async (id, reason) => {
    const res = await api.put(`/admin/users/${id}/ban`, { reason });
    return res.data;
  },

  unbanUser: async (id) => {
    const res = await api.put(`/admin/users/${id}/unban`);
    return res.data;
  },

  resetBalance: async (id, amount = 100000) => {
    const res = await api.put(`/admin/users/${id}/reset-balance`, { amount });
    return res.data;
  },

  // Stocks
  getAllStocks: async () => {
    const res = await api.get("/admin/stocks");
    return res.data;
  },

  haltStock: async (symbol, halt = true, reason = "") => {
    const res = await api.put(`/admin/stocks/${symbol}/halt`, { halt, reason });
    return res.data;
  },

  // Trades
  getRecentTrades: async (params = {}) => {
    const res = await api.get("/admin/trades", { params });
    return res.data;
  },

  // System
  clearCache: async () => {
    const res = await api.delete("/admin/cache");
    return res.data;
  },
};