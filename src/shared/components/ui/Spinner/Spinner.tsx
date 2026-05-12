import { Loader2 } from "lucide-react";
import styles from "./Spinner.module.css";

interface SpinnerProps {
  size?: number;
  label?: string;
}

export function Spinner({ size = 20, label }: SpinnerProps) {
  return (
    <span className={styles.wrap} role="status" aria-label={label ?? "Cargando"}>
      <Loader2 size={size} className={styles.spin} aria-hidden="true" />
      {label && <span className={styles.label}>{label}</span>}
    </span>
  );
}
