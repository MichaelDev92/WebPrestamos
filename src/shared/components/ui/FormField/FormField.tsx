import clsx from "clsx";
import { useId, type ReactElement, type ReactNode, cloneElement } from "react";
import styles from "./FormField.module.css";

interface FormFieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  htmlFor?: string;
  className?: string;
  children: ReactElement<{ id?: string; "aria-describedby"?: string }>;
}

export function FormField({
  label,
  hint,
  error,
  required = false,
  htmlFor,
  className,
  children,
}: FormFieldProps) {
  const autoId = useId();
  const controlId = htmlFor ?? autoId;
  const hintId = hint ? `${controlId}-hint` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  const control = cloneElement(children, {
    id: controlId,
    "aria-describedby": describedBy,
  });

  return (
    <div className={clsx(styles.field, className)}>
      <label htmlFor={controlId} className={styles.label}>
        {label}
        {required && <span className={styles.required}> *</span>}
      </label>
      {control}
      {hint && !error && (
        <span id={hintId} className={styles.hint}>
          {hint}
        </span>
      )}
      {error && (
        <span id={errorId} className={styles.error} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

interface FormRowProps {
  columns?: 1 | 2;
  children: ReactNode;
}

export function FormRow({ columns = 2, children }: FormRowProps) {
  return (
    <div className={clsx(styles.row, columns === 2 && styles.rowTwo)}>{children}</div>
  );
}
