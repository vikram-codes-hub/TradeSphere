import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authService }                from "../services/authService.js";
import { useSocket, disconnectSocket } from "../Hooks/useSocket.js"

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const socket                = useSocket();

  /*socket connext */
  const connectUserSocket = useCallback((userData) => {
    if (!socket || !userData?._id) return;
    
    socket.emit("joinUserRoom", userData._id);
    console.log(`🔌 Socket joined user room: ${userData._id}`);
  }, [socket]);


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    fetchMe();
  }, []);

  // Once user is loaded + socket ready → join user room
  useEffect(() => {
    if (user && socket) {
      connectUserSocket(user);
    }
  }, [user, socket, connectUserSocket]);

  const fetchMe = async () => {
    try {
      setLoading(true);
      const userData = await authService.getMe();
      setUser(userData);
    } catch {
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /* ── Register ────────────────────────────────────────────── */
  const register = useCallback(async (name, email, password) => {
    try {
      setError(null);
      const data = await authService.register(name, email, password);
      setUser(data.user);
      connectUserSocket(data.user); // ← connect socket on register
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed.";
      setError(msg);
      return { success: false, message: msg };
    }
  }, [connectUserSocket]);

  /* ── Login ───────────────────────────────────────────────── */
  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      const data = await authService.login(email, password);
      setUser(data.user);
      connectUserSocket(data.user); // ← connect socket on login
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed.";
      setError(msg);
      return { success: false, message: msg };
    }
  }, [connectUserSocket]);

  /* ── Logout ──────────────────────────────────────────────── */
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Even if API fails, clear local state
    } finally {
      setUser(null);
      localStorage.removeItem("token");
      disconnectSocket(); // ← disconnect socket on logout
    }
  }, []);

  /* ── Update profile ──────────────────────────────────────── */
  const updateProfile = useCallback(async (formData) => {
    try {
      setError(null);
      const updatedUser = await authService.updateProfile(formData);
      setUser(updatedUser);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || "Update failed.";
      setError(msg);
      return { success: false, message: msg };
    }
  }, []);

  /* ── Change password ─────────────────────────────────────── */
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      setError(null);
      await authService.changePassword(currentPassword, newPassword);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || "Password change failed.";
      setError(msg);
      return { success: false, message: msg };
    }
  }, []);

  const isAdmin    = user?.role === "admin";
  const isPremium  = user?.role === "premium" || user?.role === "admin";
  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      isLoggedIn,
      isAdmin,
      isPremium,
      login,
      logout,
      register,
      updateProfile,
      changePassword,
      refreshUser: fetchMe,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};