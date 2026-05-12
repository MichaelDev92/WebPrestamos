"use client";

import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import clsx from "clsx";
import type { ToastItem, ToastVariant } from "./toast.types";
import styles from "./Toast.module.css";

interface ToastViewportProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

const ICONS: Record<ToastVariant, React.ComponentType<{ size?: number }>> = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

export function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  if (toasts.length === 0) return null;

  return (
    <ol className={styles.viewport} aria-live="polite" aria-relevant="additions">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.variant];
        return (
          <li key={toast.id} className={clsx(styles.toast, styles[toast.variant])}>
            <Icon size={20} />
            <div className={styles.body}>
              {toast.title && <strong className={styles.title}>{toast.title}</strong>}
              <span className={styles.message}>{toast.message}</span>
            </div>
            <button
              type="button"
              className={styles.close}
              onClick={() => onDismiss(toast.id)}
              aria-label="Cerrar notificación"
            >
              <X size={16} />
            </button>
          </li>
        );
      })}
    </ol>
  );
}
