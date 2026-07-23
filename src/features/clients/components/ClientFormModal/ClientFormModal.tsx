"use client";

import { useEffect } from "react";
import { useController, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/shared/components/ui/Modal/Modal";
import { FormField, FormRow } from "@/shared/components/ui/FormField/FormField";
import { Input } from "@/shared/components/ui/Input/Input";
import { Dropdown } from "@/shared/components/ui/Dropdown/Dropdown";
import { Textarea } from "@/shared/components/ui/Textarea/Textarea";
import { DatePicker } from "@/shared/components/ui/DatePicker/DatePicker";
import { Button } from "@/shared/components/ui/Button/Button";
import { useT } from "@/shared/hooks/useT";
import { useToast } from "@/shared/hooks/useToast";
import { isApiError } from "@/shared/lib/http/errors";
import {
  useCreateClient,
  useDocTypesQuery,
  useUpdateClient,
} from "@/features/clients/hooks/useClients";
import { clientSchema, type ClientFormValues } from "@/features/clients/schemas";
import type { Client } from "@/features/clients/types";
import type { TranslationKey } from "@/shared/lib/i18n/translate";

interface ClientFormModalProps {
  open: boolean;
  onClose: () => void;
  client?: Client | null;
}

const EMPTY_VALUES: ClientFormValues = {
  names: "",
  surnames: "",
  email: "",
  phoneNumber: "",
  address: "",
  birthdate: "",
  typeDocument: "",
  documentNumber: "",
  employmentStatus: "",
  employerName: "",
  monthlyIncome: 0,
  creditScore: 0,
  riskCategory: "",
  notes: "",
};

const EMPLOYMENT_OPTIONS = ["Empleado", "Independiente", "Desempleado", "Pensionado"];
const RISK_OPTIONS = ["Bajo", "Medio", "Alto"];

/** Garantiza que un valor existente (data legacy) aparezca como opción. */
function withCurrent(options: string[], current?: string): string[] {
  if (current && !options.includes(current)) return [current, ...options];
  return options;
}

const toOptions = (values: string[]) => values.map((value) => ({ value, label: value }));

export function ClientFormModal({ open, onClose, client }: ClientFormModalProps) {
  const { t } = useT();
  const toast = useToast();
  const docTypesQuery = useDocTypesQuery();
  const isEdit = Boolean(client);
  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: EMPTY_VALUES,
  });

  const birthdate = useController({ control, name: "birthdate" });
  const typeDocument = useController({ control, name: "typeDocument" });
  const employmentStatus = useController({ control, name: "employmentStatus" });
  const riskCategory = useController({ control, name: "riskCategory" });

  useEffect(() => {
    if (!open) return;
    if (client) {
      reset({
        names: client.names,
        surnames: client.surnames,
        email: client.email,
        phoneNumber: client.phoneNumber,
        address: client.address,
        birthdate: client.birthdate ? client.birthdate.slice(0, 10) : "",
        typeDocument: client.typeDocument?.id ?? "",
        documentNumber: client.documentNumber,
        employmentStatus: client.employmentStatus ?? "",
        employerName: client.employerName,
        monthlyIncome: client.monthlyIncome,
        creditScore: client.creditScore,
        riskCategory: client.riskCategory ?? "",
        notes: client.notes,
      });
    } else {
      reset(EMPTY_VALUES);
    }
  }, [open, client, reset]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const translate = (raw: string | undefined, fallback = "") => {
    if (!raw) return fallback;
    if (!raw.includes(".")) return raw;
    const translated = t(raw as TranslationKey);
    return translated === raw ? fallback || raw : translated;
  };

  const onSubmit = handleSubmit((values) => {
    const base = {
      names: values.names.trim(),
      surnames: values.surnames.trim(),
      email: values.email.trim(),
      phoneNumber: values.phoneNumber.trim(),
      address: values.address.trim(),
      birthdate: values.birthdate,
      typeDocument: values.typeDocument,
      documentNumber: values.documentNumber.trim(),
      employmentStatus: values.employmentStatus,
      employerName: values.employerName.trim(),
      monthlyIncome: values.monthlyIncome,
      creditScore: values.creditScore,
      riskCategory: values.riskCategory,
      notes: values.notes.trim(),
    };

    const onSuccess = () => {
      toast.success(isEdit ? t("clients.update.success") : t("clients.create.success"));
      onClose();
    };

    const onError = (error: unknown) => {
      if (isApiError(error)) {
        if (error.status === 409) {
          toast.error(
            /document/i.test(error.message)
              ? t("clients.create.duplicateDocument")
              : t("clients.create.duplicateEmail"),
          );
          return;
        }
        toast.error(error.message || t("errors.unknown"));
        return;
      }
      toast.error(t("errors.unknown"));
    };

    if (isEdit && client) {
      updateMutation.mutate({ id: client.id, ...base }, { onSuccess, onError });
    } else {
      createMutation.mutate({ ...base, active: 1 }, { onSuccess, onError });
    }
  });

  const docTypeOptions =
    docTypesQuery.data?.map((doc) => ({ value: doc.id, label: doc.description })) ?? [];
  const employmentOptions = toOptions(withCurrent(EMPLOYMENT_OPTIONS, client?.employmentStatus));
  const riskOptions = toOptions(withCurrent(RISK_OPTIONS, client?.riskCategory));

  return (
    <Modal
      open={open}
      onClose={isPending ? () => undefined : onClose}
      title={isEdit ? t("clients.form.editTitle") : t("clients.form.createTitle")}
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
            label={t("clients.form.fields.names")}
            error={translate(errors.names?.message)}
            required
          >
            <Input autoFocus disabled={isPending} invalid={Boolean(errors.names)} {...register("names")} />
          </FormField>
          <FormField
            label={t("clients.form.fields.surnames")}
            error={translate(errors.surnames?.message)}
            required
          >
            <Input disabled={isPending} invalid={Boolean(errors.surnames)} {...register("surnames")} />
          </FormField>
        </FormRow>

        <FormRow columns={2}>
          <FormField
            label={t("clients.form.fields.typeDocument")}
            error={translate(errors.typeDocument?.message)}
            required
          >
            <Dropdown
              value={typeDocument.field.value}
              onChange={typeDocument.field.onChange}
              options={docTypeOptions}
              placeholder={t("clients.form.selectPlaceholder")}
              searchable
              disabled={isPending || docTypesQuery.isLoading}
              invalid={Boolean(errors.typeDocument)}
            />
          </FormField>
          <FormField
            label={t("clients.form.fields.documentNumber")}
            error={translate(errors.documentNumber?.message)}
            required
          >
            <Input
              disabled={isPending}
              invalid={Boolean(errors.documentNumber)}
              {...register("documentNumber")}
            />
          </FormField>
        </FormRow>

        <FormRow columns={2}>
          <FormField
            label={t("clients.form.fields.email")}
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
            label={t("clients.form.fields.phoneNumber")}
            error={translate(errors.phoneNumber?.message)}
            required
          >
            <Input
              type="tel"
              disabled={isPending}
              invalid={Boolean(errors.phoneNumber)}
              {...register("phoneNumber")}
            />
          </FormField>
        </FormRow>

        <FormRow columns={2}>
          <FormField
            label={t("clients.form.fields.birthdate")}
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
          <FormField
            label={t("clients.form.fields.address")}
            error={translate(errors.address?.message)}
            required
          >
            <Input disabled={isPending} invalid={Boolean(errors.address)} {...register("address")} />
          </FormField>
        </FormRow>

        <FormRow columns={2}>
          <FormField
            label={t("clients.form.fields.employmentStatus")}
            error={translate(errors.employmentStatus?.message)}
            required
          >
            <Dropdown
              value={employmentStatus.field.value}
              onChange={employmentStatus.field.onChange}
              options={employmentOptions}
              placeholder={t("clients.form.selectPlaceholder")}
              disabled={isPending}
              invalid={Boolean(errors.employmentStatus)}
            />
          </FormField>
          <FormField
            label={t("clients.form.fields.employerName")}
            error={translate(errors.employerName?.message)}
            required
          >
            <Input
              disabled={isPending}
              invalid={Boolean(errors.employerName)}
              {...register("employerName")}
            />
          </FormField>
        </FormRow>

        <FormRow columns={2}>
          <FormField
            label={t("clients.form.fields.monthlyIncome")}
            error={translate(errors.monthlyIncome?.message)}
            required
          >
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              disabled={isPending}
              invalid={Boolean(errors.monthlyIncome)}
              {...register("monthlyIncome", { valueAsNumber: true })}
            />
          </FormField>
          <FormField
            label={t("clients.form.fields.creditScore")}
            error={translate(errors.creditScore?.message)}
            required
          >
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              disabled={isPending}
              invalid={Boolean(errors.creditScore)}
              {...register("creditScore", { valueAsNumber: true })}
            />
          </FormField>
        </FormRow>

        <FormField
          label={t("clients.form.fields.riskCategory")}
          error={translate(errors.riskCategory?.message)}
          required
        >
          <Dropdown
            value={riskCategory.field.value}
            onChange={riskCategory.field.onChange}
            options={riskOptions}
            placeholder={t("clients.form.selectPlaceholder")}
            disabled={isPending}
            invalid={Boolean(errors.riskCategory)}
          />
        </FormField>

        <FormField
          label={t("clients.form.fields.notes")}
          error={translate(errors.notes?.message)}
          required
        >
          <Textarea
            rows={3}
            disabled={isPending}
            invalid={Boolean(errors.notes)}
            {...register("notes")}
          />
        </FormField>
      </form>
    </Modal>
  );
}
