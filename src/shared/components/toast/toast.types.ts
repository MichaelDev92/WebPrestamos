export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  title?: string;
  message: string;
  duration?: number;
}

export interface ToastInput {
  variant?: ToastVariant;
  title?: string;
  message: string;
  duration?: number;
}
