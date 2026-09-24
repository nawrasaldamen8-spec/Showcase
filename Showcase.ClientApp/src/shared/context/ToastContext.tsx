import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import React, { useCallback, useState, type ReactNode } from "react";
import { ToastContext, type ToastItem, type ToastType } from "./toastContextDef.ts";

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const getBorderAndBg = (type: ToastType) => {
    switch (type) {
      case "success":
        return "border-[#2e7d32]/40 bg-[#faf9f5] text-[#141413]";
      case "error":
        return "border-[#d97757]/60 bg-[#faf9f5] text-[#141413]";
      case "warning":
        return "border-[#f1a900]/60 bg-[#faf9f5] text-[#141413]";
      case "info":
      default:
        return "border-[#cccbc8] bg-[#faf9f5] text-[#141413]";
    }
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-[#2e7d32] shrink-0" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-[#d97757] shrink-0" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-[#f1a900] shrink-0" />;
      case "info":
      default:
        return <Info className="h-4 w-4 text-[#87867f] shrink-0" />;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}

      {/* Global Toast Container */}
      <aside
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border font-serif text-sm transition-all duration-200 animate-in slide-in-from-bottom-3 ${getBorderAndBg(
              toast.type,
            )}`}
          >
            <div className="flex items-center gap-2.5">
              {getIcon(toast.type)}
              <span className="leading-snug">{toast.message}</span>
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="text-[#87867f] hover:text-[#141413] transition-colors p-1 rounded-full cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </aside>
    </ToastContext.Provider>
  );
};
