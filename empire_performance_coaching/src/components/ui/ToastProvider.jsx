import React, { createContext, useContext, useMemo, useRef, useState } from 'react';

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const remove = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const show = ({ title, description, variant = 'default', duration = 4000 }) => {
    const id = ++idRef.current;
    const toast = { id, title, description, variant };
    setToasts((prev) => [...prev, toast]);
    if (duration > 0) {
      setTimeout(() => remove(id), duration);
    }
    return id;
  };

  const value = useMemo(() => ({ show, remove }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 w-[90vw] max-w-sm">
        {toasts?.map((t) => (
          <div
            key={t.id}
            className={`rounded-lg border px-4 py-3 shadow-elevation-2 bg-[#1A1A1D] border-[#2A2A2E] ${
              t.variant === 'destructive' ? 'border-red-500/40' : 'border-[#2A2A2E]'
            }`}
            role="status"
            aria-live="polite"
          >
            {t.title && (
              <div className="font-semibold mb-0.5" style={{ color: '#F5F5F5' }}>{t.title}</div>
            )}
            {t.description && (
              <div className="text-sm" style={{ color: '#CFCFCF' }}>{t.description}</div>
            )}
            <button
              onClick={() => remove(t.id)}
              className="absolute top-2 right-2 text-[#CFCFCF] hover:text-[#F5F5F5]"
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

