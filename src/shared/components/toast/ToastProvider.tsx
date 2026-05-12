"use client";

import {
  createContext,
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ToastViewport } from "./ToastViewport";
import type { ToastInput, ToastItem, ToastVariant } from "./toast.types";

interface ToastApi {
  show: (input: ToastInput) => string;
  success: (message: string, opts?: Omit<ToastInput, "message" | "variant">) => string;
  error: (message: string, opts?: Omit<ToastInput, "message" | "variant">) => string;
  warning: (message: string, opts?: Omit<ToastInput, "message" | "variant">) => string;
  info: (message: string, opts?: Omit<ToastInput, "message" | "variant">) => string;
  dismiss: (id: string) => void;
}

export const ToastContext = createContext<ToastApi | null>(null);

const DEFAULT_DURATION = 4500;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const show = useCallback(
    (input: ToastInput): string => {
      const id = crypto.randomUUID();
      const item: ToastItem = {
        id,
        variant: input.variant ?? "info",
        title: input.title,
        message: input.message,
        duration: input.duration ?? DEFAULT_DURATION,
      };
      setToasts((prev) => [...prev, item]);

      const timer = setTimeout(() => dismiss(id), item.duration);
      timersRef.current.set(id, timer);
      return id;
    },
    [dismiss],
  );

  const helper = (variant: ToastVariant) =>
    (message: string, opts?: Omit<ToastInput, "message" | "variant">) =>
      show({ ...opts, message, variant });

  const api = useMemo<ToastApi>(
    () => ({
      show,
      success: helper("success"),
      error: helper("error"),
      warning: helper("warning"),
      info: helper("info"),
      dismiss,
    }),
    // helper closures depend on show; ESLint puede pedir más, pero es estable
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [show, dismiss],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}
