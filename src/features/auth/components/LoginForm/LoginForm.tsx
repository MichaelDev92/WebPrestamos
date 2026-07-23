"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useT } from "@/shared/hooks/useT";
import { useToast } from "@/shared/hooks/useToast";
import { loginAction } from "@/server/auth/actions";
import { loginSchema, type LoginFormValues } from "@/features/auth/schemas";
import { GlassCard } from "@/shared/components/ui/GlassCard/GlassCard";
import { FormField } from "@/shared/components/ui/FormField/FormField";
import { Input } from "@/shared/components/ui/Input/Input";
import { PasswordInput } from "@/shared/components/ui/PasswordInput/PasswordInput";
import { Button } from "@/shared/components/ui/Button/Button";
import type { TranslationKey } from "@/shared/lib/i18n/translate";
import styles from "./LoginForm.module.css";

const REMEMBER_KEY = "wp_remember_email";

export function LoginForm() {
  const { t } = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [remember, setRemember] = useState(false);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    setFocus,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    const saved =
      typeof window !== "undefined" ? window.localStorage.getItem(REMEMBER_KEY) : null;
    // Diferido para no hacer setState síncrono dentro del efecto y para asegurar
    // que el input ya esté montado antes de enfocarlo.
    const frame = requestAnimationFrame(() => {
      if (saved) {
        setValue("email", saved);
        setRemember(true);
        // Con el correo precargado, el foco va directo a la contraseña.
        setFocus("password");
      } else {
        setFocus("email");
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [setValue, setFocus]);

  const translateMaybeKey = (raw: string | undefined, fallback: string) => {
    if (!raw) return fallback;
    if (!raw.includes(".")) return raw;
    const translated = t(raw as TranslationKey);
    return translated === raw ? fallback || raw : translated;
  };

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const result = await loginAction(values);
      if (!result.ok) {
        const fallback = t("auth.login.invalidCredentials");
        toast.error(translateMaybeKey(result.error?.message, fallback));
        return;
      }
      // El correo (no credencial) se puede recordar en el dispositivo.
      if (remember) {
        window.localStorage.setItem(REMEMBER_KEY, values.email);
      } else {
        window.localStorage.removeItem(REMEMBER_KEY);
      }
      const from = searchParams.get("from") ?? "/";
      router.replace(from);
      router.refresh();
    });
  });

  return (
    <GlassCard>
      <header className={styles.header}>
        <h1 className={styles.title}>{t("auth.login.title")}</h1>
        <p className={styles.subtitle}>{t("auth.login.subtitle")}</p>
      </header>

      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <FormField
          label={t("auth.login.email")}
          error={translateMaybeKey(errors.email?.message, "")}
          required
        >
          <Input
            type="email"
            autoComplete="email"
            disabled={isPending}
            invalid={Boolean(errors.email)}
            {...register("email")}
          />
        </FormField>

        <FormField
          label={t("auth.login.password")}
          error={translateMaybeKey(errors.password?.message, "")}
          required
        >
          <PasswordInput
            autoComplete="current-password"
            disabled={isPending}
            invalid={Boolean(errors.password)}
            {...register("password")}
          />
        </FormField>

        <label className={styles.remember}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
            disabled={isPending}
          />
          <span>{t("auth.login.remember")}</span>
        </label>

        <Button type="submit" loading={isPending} fullWidth>
          {isPending ? t("auth.login.submitting") : t("auth.login.submit")}
        </Button>
      </form>
    </GlassCard>
  );
}
