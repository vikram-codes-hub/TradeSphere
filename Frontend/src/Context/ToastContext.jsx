import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Shortcuts
  const toast = {
    success: (msg, duration)  => addToast(msg, "success", duration),
    error:   (msg, duration)  => addToast(msg, "error",   duration),
    warn:    (msg, duration)  => addToast(msg, "warn",    duration),
    info:    (msg, duration)  => addToast(msg, "info",    duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* ── Toast Container ───────────────────────────────── */}
      <div style={s.container}>
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{ ...s.toast, ...s[t.type] }}
            onClick={() => removeToast(t.id)}
          >
            <span style={s.icon}>{icons[t.type]}</span>
            <span style={s.message}>{t.message}</span>
            <button
              onClick={(e) => { e.stopPropagation(); removeToast(t.id); }}
              style={s.closeBtn}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const icons = {
  success: "✅",
  error:   "❌",
  warn:    "⚠️",
  info:    "ℹ️",
};

const s = {
  container: {
    position:      "fixed",
    bottom:        "24px",
    right:         "24px",
    zIndex:        9999,
    display:       "flex",
    flexDirection: "column",
    gap:           "10px",
    maxWidth:      "360px",
    width:         "100%",
    pointerEvents: "none",
  },
  toast: {
    display:       "flex",
    alignItems:    "center",
    gap:           "10px",
    padding:       "14px 16px",
    borderRadius:  "12px",
    border:        "1px solid",
    backdropFilter:"blur(12px)",
    fontFamily:    "'Poppins', sans-serif",
    fontSize:      "13.5px",
    fontWeight:    "500",
    cursor:        "pointer",
    pointerEvents: "all",
    animation:     "toastIn 0.3s ease both",
    boxShadow:     "0 8px 32px rgba(0,0,0,0.4)",
  },
  success: {
    background:  "rgba(0,229,160,0.1)",
    borderColor: "rgba(0,229,160,0.25)",
    color:       "#00e5a0",
  },
  error: {
    background:  "rgba(255,77,109,0.1)",
    borderColor: "rgba(255,77,109,0.25)",
    color:       "#ff4d6d",
  },
  warn: {
    background:  "rgba(251,191,36,0.1)",
    borderColor: "rgba(251,191,36,0.25)",
    color:       "#fbbf24",
  },
  info: {
    background:  "rgba(45,126,247,0.1)",
    borderColor: "rgba(45,126,247,0.25)",
    color:       "#2d7ef7",
  },
  icon:     { fontSize: "16px", flexShrink: 0 },
  message:  { flex: 1, lineHeight: "1.4" },
  closeBtn: {
    background: "none", border: "none",
    cursor: "pointer", fontSize: "12px",
    color: "inherit", opacity: 0.6,
    padding: "0", flexShrink: 0,
    fontFamily: "'Poppins', sans-serif",
  },
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
};