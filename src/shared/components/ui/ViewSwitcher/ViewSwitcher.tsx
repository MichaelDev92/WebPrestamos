"use client";

import clsx from "clsx";
import type { ReactNode } from "react";
import styles from "./ViewSwitcher.module.css";

export interface ViewOption<T extends string> {
  value: T;
  label: string;
  icon: ReactNode;
}

interface ViewSwitcherProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: ViewOption<T>[];
}

/** Control segmentado para alternar entre vistas (tabla / tarjetas / galería). */
export function ViewSwitcher<T extends string>({
  value,
  onChange,
  options,
}: ViewSwitcherProps<T>) {
  return (
    <div className={styles.group} role="group">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-label={option.label}
          title={option.label}
          aria-pressed={value === option.value}
          className={clsx(styles.item, value === option.value && styles.active)}
          onClick={() => onChange(option.value)}
        >
          {option.icon}
        </button>
      ))}
    </div>
  );
}
