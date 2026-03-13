import api from "./api"
export const authService = {

  register: async (name, email, password) => {
    const res = await api.post("/auth/register", { name, email, password });
    if (res.data.token) localStorage.setItem("token", res.data.token);
    return res.data;
  },

  login: async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    if (res.data.token) localStorage.setItem("token", res.data.token);
    return res.data;
  },

  logout: async () => {
    await api.post("/auth/logout");
    localStorage.removeItem("token");
  },

  getMe: async () => {
    const res = await api.get("/auth/me");
    return res.data.user;
  },

  updateProfile: async (formData) => {
    const res = await api.put("/auth/profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.user;
  },

  changePassword: async (currentPassword, newPassword) => {
    const res = await api.put("/auth/password", { currentPassword, newPassword });
    return res.data;
  },
  upgrade: async () => {
  const res = await api.patch("/auth/upgrade");
  return res.data.user;
},
};