"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useT } from "@/shared/hooks/useT";
import { loginAction } from "@/server/auth/actions";
import { loginSchema, type LoginFormValues } from "@/features/auth/schemas";
import { GlassCard } from "@/shared/components/ui/GlassCard/GlassCard";
import { FormField } from "@/shared/components/ui/FormField/FormField";
import { Input } from "@/shared/components/ui/Input/Input";
import { Button } from "@/shared/components/ui/Button/Button";
import type { TranslationKey } from "@/shared/lib/i18n/translate";
import styles from "./LoginForm.module.css";

export function LoginForm() {
  const { t } = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const translateMaybeKey = (raw: string | undefined, fallback: string) => {
    if (!raw) return fallback;
    if (!raw.includes(".")) return raw;
    const translated = t(raw as TranslationKey);
    return translated === raw ? fallback || raw : translated;
  };

  const onSubmit = handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      const result = await loginAction(values);
      if (!result.ok) {
        const fallback = t("auth.login.invalidCredentials");
        setServerError(translateMaybeKey(result.error?.message, fallback));
        return;
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
          <Input
            type="password"
            autoComplete="current-password"
            disabled={isPending}
            invalid={Boolean(errors.password)}
            {...register("password")}
          />
        </FormField>

        {serverError && <p className={styles.serverError}>{serverError}</p>}

        <Button type="submit" loading={isPending} fullWidth>
          {isPending ? t("auth.login.submitting") : t("auth.login.submit")}
        </Button>
      </form>
    </GlassCard>
  );
}
