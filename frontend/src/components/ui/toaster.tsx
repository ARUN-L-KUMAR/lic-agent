"use client";

import { useState, createContext, useContext, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  toast: (opts: Omit<Toast, "id">) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((t) => t.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((opts: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { ...opts, id }]);
    setTimeout(() => dismiss(id), 5000);
  }, [dismiss]);

  const success = useCallback((title: string, message?: string) =>
    addToast({ type: "success", title, message }), [addToast]);
  const error = useCallback((title: string, message?: string) =>
    addToast({ type: "error", title, message }), [addToast]);
  const info = useCallback((title: string, message?: string) =>
    addToast({ type: "info", title, message }), [addToast]);

  const icons = {
    success: <CheckCircle size={18} />,
    error: <AlertCircle size={18} />,
    info: <Info size={18} />,
    warning: <AlertCircle size={18} />,
  };

  const colors = {
    success: { bg: "#d1fae5", color: "#198754", border: "#6ee7b7" },
    error: { bg: "#fee2e2", color: "#D92D20", border: "#fca5a5" },
    info: { bg: "#dbeafe", color: "#0066B3", border: "#93c5fd" },
    warning: { bg: "#fef3c7", color: "#D99A00", border: "#fcd34d" },
  };

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, info }}>
      <div
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          maxWidth: "380px",
          width: "100%",
        }}
      >
        {toasts.map((t) => {
          const c = colors[t.type];
          return (
            <div
              key={t.id}
              style={{
                background: c.bg,
                border: `1px solid ${c.border}`,
                borderRadius: "var(--radius-lg)",
                padding: "1rem 1.25rem",
                boxShadow: "var(--shadow-lg)",
                display: "flex",
                gap: "0.75rem",
                alignItems: "flex-start",
              }}
              className="animate-slide-in"
            >
              <span style={{ color: c.color, marginTop: "1px" }}>{icons[t.type]}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: c.color, fontSize: "0.9rem" }}>{t.title}</div>
                {t.message && (
                  <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                    {t.message}
                  </div>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                style={{ background: "none", border: "none", cursor: "pointer", color: c.color, padding: "2px" }}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Return a no-op if used outside provider
    return {
      toast: () => {},
      success: () => {},
      error: () => {},
      info: () => {},
    };
  }
  return ctx;
}
