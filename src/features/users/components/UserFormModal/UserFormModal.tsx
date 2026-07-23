"use client";

import { useEffect } from "react";
import { useController, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/shared/components/ui/Modal/Modal";
import { FormField, FormRow } from "@/shared/components/ui/FormField/FormField";
import { Input } from "@/shared/components/ui/Input/Input";
import { PasswordInput } from "@/shared/components/ui/PasswordInput/PasswordInput";
import { Dropdown } from "@/shared/components/ui/Dropdown/Dropdown";
import { DatePicker } from "@/shared/components/ui/DatePicker/DatePicker";
import { Button } from "@/shared/components/ui/Button/Button";
import { useT } from "@/shared/hooks/useT";
import { useToast } from "@/shared/hooks/useToast";
import { isApiError } from "@/shared/lib/http/errors";
import { ROLES } from "@/types/auth";
import { useCreateUser, useUpdateUser } from "@/features/users/hooks/useUsers";
import { userSchema, type UserFormValues } from "@/features/users/schemas";
import type { User } from "@/features/users/types";
import type { TranslationKey } from "@/shared/lib/i18n/translate";

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  user?: User | null;
}

const EMPTY_VALUES: UserFormValues = {
  names: "",
  surnames: "",
  email: "",
  password: "",
  role: "user",
  phoneNumber: "",
  address: "",
  birthdate: "",
};

export function UserFormModal({ open, onClose, user }: UserFormModalProps) {
  const { t } = useT();
  const toast = useToast();
  const isEdit = Boolean(user);
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  const {
    register,
    handleSubmit,
    reset,
    control,
    setError,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: EMPTY_VALUES,
  });

  const birthdate = useController({ control, name: "birthdate" });
  const role = useController({ control, name: "role" });

  useEffect(() => {
    if (!open) return;
    if (user) {
      reset({
        names: user.names,
        surnames: user.surnames,
        email: user.email,
        password: "",
        role: user.role,
        phoneNumber: user.phoneNumber ?? "",
        address: user.address ?? "",
        birthdate: user.registrationDate ? user.registrationDate.slice(0, 10) : "",
      });
    } else {
      reset(EMPTY_VALUES);
    }
  }, [open, user, reset]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const translate = (raw: string | undefined, fallback = "") => {
    if (!raw) return fallback;
    if (!raw.includes(".")) return raw;
    const translated = t(raw as TranslationKey);
    return translated === raw ? fallback || raw : translated;
  };

  const roleOptions = ROLES.map((value) => ({
    value,
    label: t(`auth.register.roles.${value}` as TranslationKey),
  }));

  const onSubmit = handleSubmit((values) => {
    const password = values.password?.trim() || "";
    if (!isEdit && password.length === 0) {
      setError("password", { message: "common.validation.required" });
      return;
    }

    const base = {
      names: values.names.trim(),
      surnames: values.surnames.trim(),
      fullName: `${values.names.trim()} ${values.surnames.trim()}`,
      email: values.email.trim(),
      role: values.role,
      phoneNumber: values.phoneNumber?.trim() || undefined,
      address: values.address?.trim() || undefined,
      birthdate: values.birthdate,
    };

    const onSuccess = () => {
      toast.success(isEdit ? t("users.update.success") : t("users.create.success"));
      onClose();
    };

    const onError = (error: unknown) => {
      if (isApiError(error)) {
        if (error.status === 409) {
          toast.error(t("users.create.duplicateEmail"));
          return;
        }
        toast.error(error.message || t("errors.unknown"));
        return;
      }
      toast.error(t("errors.unknown"));
    };

    if (isEdit && user) {
      updateMutation.mutate(
        { id: user.id, ...base, ...(password ? { password } : {}) },
        { onSuccess, onError },
      );
    } else {
      createMutation.mutate(
        { ...base, password, registrationDate: new Date().toISOString() },
        { onSuccess, onError },
      );
    }
  });

  return (
    <Modal
      open={open}
      onClose={isPending ? () => undefined : onClose}
      title={isEdit ? t("users.form.editTitle") : t("users.form.createTitle")}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            {t("common.actions.cancel")}
          </Button>
          <Button onClick={onSubmit} loading={isPending}>
            {t("common.actions.save")}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate style={{ display: "grid", gap: "var(--space-4)" }}>
        <FormRow columns={2}>
          <FormField
            label={t("users.form.fields.names")}
            error={translate(errors.names?.message)}
            required
          >
            <Input autoFocus disabled={isPending} invalid={Boolean(errors.names)} {...register("names")} />
          </FormField>
          <FormField
            label={t("users.form.fields.surnames")}
            error={translate(errors.surnames?.message)}
            required
          >
            <Input disabled={isPending} invalid={Boolean(errors.surnames)} {...register("surnames")} />
          </FormField>
        </FormRow>

        <FormRow columns={2}>
          <FormField
            label={t("users.form.fields.email")}
            error={translate(errors.email?.message)}
            required
          >
            <Input
              type="email"
              disabled={isPending}
              invalid={Boolean(errors.email)}
              {...register("email")}
            />
          </FormField>
          <FormField
            label={t("users.form.fields.role")}
            error={translate(errors.role?.message)}
            required
          >
            <Dropdown
              value={role.field.value}
              onChange={role.field.onChange}
              options={roleOptions}
              placeholder={t("clients.form.selectPlaceholder")}
              disabled={isPending}
              invalid={Boolean(errors.role)}
            />
          </FormField>
        </FormRow>

        <FormRow columns={2}>
          <FormField
            label={t("users.form.fields.password")}
            error={translate(errors.password?.message)}
            hint={isEdit ? t("users.form.passwordEditHint") : undefined}
            required={!isEdit}
          >
            <PasswordInput
              autoComplete="new-password"
              disabled={isPending}
              invalid={Boolean(errors.password)}
              {...register("password")}
            />
          </FormField>
          <FormField
            label={t("users.form.fields.birthdate")}
            error={translate(errors.birthdate?.message)}
            required
          >
            <DatePicker
              value={birthdate.field.value}
              onChange={birthdate.field.onChange}
              disabled={isPending}
              invalid={Boolean(errors.birthdate)}
            />
          </FormField>
        </FormRow>

        <FormRow columns={2}>
          <FormField
            label={t("users.form.fields.phoneNumber")}
            error={translate(errors.phoneNumber?.message)}
          >
            <Input
              type="tel"
              disabled={isPending}
              invalid={Boolean(errors.phoneNumber)}
              {...register("phoneNumber")}
            />
          </FormField>
          <FormField
            label={t("users.form.fields.address")}
            error={translate(errors.address?.message)}
          >
            <Input disabled={isPending} invalid={Boolean(errors.address)} {...register("address")} />
          </FormField>
        </FormRow>
      </form>
    </Modal>
  );
}
