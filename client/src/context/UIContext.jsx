import { createContext, useContext, useState, useCallback } from "react";

const UIContext = createContext(null);

export const UIProvider = ({ children }) => {
  const [toast, setToast] = useState({ show: false, msg: "", tone: "ok" });

  const showToast = useCallback((msg, tone = "ok") => {
    setToast({ show: true, msg, tone });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3600);
  }, []);

  return (
    <UIContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] transition-all duration-300 ${
          toast.show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
        }`}
      >
        <div
          className={`px-5 py-3 rounded-full text-sm font-medium border shadow-lg ${
            toast.tone === "error"
              ? "bg-raised border-red-500/40 text-red-200"
              : "bg-raised border-accent/40 text-text"
          }`}
        >
          {toast.msg}
        </div>
      </div>
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const ctx = useContext(UIContext);
  if (!ctx) return { showToast: () => {} };
  return ctx;
};
