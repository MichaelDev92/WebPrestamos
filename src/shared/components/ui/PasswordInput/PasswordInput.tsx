"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import clsx from "clsx";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/shared/components/ui/Input/Input";
import styles from "./PasswordInput.module.css";

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  invalid?: boolean;
}

/** Input de contraseña con botón de mostrar/ocultar. Compatible con react-hook-form. */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ invalid, className, disabled, ...rest }, ref) {
    const [visible, setVisible] = useState(false);
    return (
      <div className={styles.wrap}>
        <Input
          ref={ref}
          type={visible ? "text" : "password"}
          invalid={invalid}
          disabled={disabled}
          className={clsx(styles.input, className)}
          {...rest}
        />
        <button
          type="button"
          className={styles.toggle}
          onClick={() => setVisible((prev) => !prev)}
          disabled={disabled}
          tabIndex={-1}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    );
  },
);
