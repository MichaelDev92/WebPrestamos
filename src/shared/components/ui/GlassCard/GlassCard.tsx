import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";
import styles from "./GlassCard.module.css";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Activa glow bioluminiscente en hover */
  glow?: boolean;
  /** Reduce padding interno */
  compact?: boolean;
}

export function GlassCard({
  children,
  className,
  glow = false,
  compact = false,
  ...rest
}: GlassCardProps) {
  return (
    <div
      className={clsx(
        styles.card,
        glow && styles.glow,
        compact && styles.compact,
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
