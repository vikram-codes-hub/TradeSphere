import api from "./api.js";

export const leaderboardService = {

  getLeaderboard: async (params = {}) => {
    // params: { type: "pnl"|"winrate"|"trades", period: "all"|"weekly"|"monthly"|"daily", limit }
    const res = await api.get("/leaderboard", { params });
    return res.data;
  },

  getMyRank: async (params = {}) => {
    // params: { period }
    const res = await api.get("/leaderboard/me", { params });
    return res.data;
  },
};