"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import styles from "./Popover.module.css";

interface Position {
  top: number;
  left: number;
  width?: number;
}

interface PopoverProps {
  anchorRef: RefObject<HTMLElement | null>;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Iguala el ancho del panel al del anchor (útil para dropdowns). */
  matchWidth?: boolean;
  gap?: number;
  className?: string;
}

const VIEWPORT_PADDING = 8;

/**
 * Panel anclado a un elemento, renderizado en portal con posición fija.
 * Reposiciona en scroll/resize, hace flip vertical si no cabe abajo y clamping
 * horizontal para no salirse del viewport. Cierra en click-fuera y Escape.
 * Evita el recorte por `overflow` de contenedores padre (p. ej. el body del Modal).
 */
export function Popover({
  anchorRef,
  open,
  onClose,
  children,
  matchWidth = true,
  gap = 6,
  className,
}: PopoverProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<Position | null>(null);

  useLayoutEffect(() => {
    if (!open) return;

    const compute = () => {
      const anchor = anchorRef.current;
      const panel = panelRef.current;
      if (!anchor) return;

      const rect = anchor.getBoundingClientRect();
      const panelHeight = panel?.offsetHeight ?? 0;
      const panelWidth = matchWidth ? rect.width : panel?.offsetWidth ?? 0;

      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const openUp = spaceBelow < panelHeight + gap && spaceAbove > spaceBelow;

      const top = openUp ? rect.top - gap - panelHeight : rect.bottom + gap;

      let left = rect.left;
      if (left + panelWidth > window.innerWidth - VIEWPORT_PADDING) {
        left = window.innerWidth - panelWidth - VIEWPORT_PADDING;
      }
      if (left < VIEWPORT_PADDING) left = VIEWPORT_PADDING;

      setPos({ top, left, width: matchWidth ? rect.width : undefined });
    };

    compute();
    const raf = requestAnimationFrame(compute);
    window.addEventListener("scroll", compute, true);
    window.addEventListener("resize", compute);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", compute, true);
      window.removeEventListener("resize", compute);
    };
  }, [open, anchorRef, matchWidth, gap]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const onPointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      onClose();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open, onClose, anchorRef]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={panelRef}
      className={clsx(styles.panel, className)}
      style={{
        top: pos?.top ?? -9999,
        left: pos?.left ?? -9999,
        width: pos?.width,
        visibility: pos ? "visible" : "hidden",
      }}
    >
      {children}
    </div>,
    document.body,
  );
}
