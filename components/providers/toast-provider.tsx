"use client";

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Toast, ToastVariant } from "@/components/ui/toast";

type ToastItem = {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
};

type ToastInput = Omit<ToastItem, "id">;

interface ToastContextValue {
  toast: (input: ToastInput) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const AUTO_DISMISS_MS = 5000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  // The toast portal only exists on the client (it targets
  // document.body), so both the server render and React's initial
  // client render must produce nothing here — otherwise hydration sees
  // a mismatch. Flipping this in an effect defers the portal to a
  // client-only pass, after hydration has already reconciled.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional mount-flag to defer the portal past hydration (see comment above)
    setMounted(true);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, ...input }]);
      setTimeout(() => removeToast(id), AUTO_DISMISS_MS);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {mounted &&
        createPortal(
          <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            {toasts.map((item) => (
              <Toast
                key={item.id}
                title={item.title}
                description={item.description}
                variant={item.variant}
                onClose={() => removeToast(item.id)}
              />
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
