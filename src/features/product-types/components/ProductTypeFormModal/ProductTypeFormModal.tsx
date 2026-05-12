"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/shared/components/ui/Modal/Modal";
import { FormField, FormRow } from "@/shared/components/ui/FormField/FormField";
import { Input } from "@/shared/components/ui/Input/Input";
import { Textarea } from "@/shared/components/ui/Textarea/Textarea";
import { Button } from "@/shared/components/ui/Button/Button";
import { useT } from "@/shared/hooks/useT";
import { useToast } from "@/shared/hooks/useToast";
import { isApiError } from "@/shared/lib/http/errors";
import {
  productTypeSchema,
  type ProductTypeFormValues,
} from "@/features/product-types/schemas";
import {
  useCreateProductType,
  useUpdateProductType,
} from "@/features/product-types/hooks/useProductTypes";
import type { ProductType } from "@/features/product-types/types";
import type { TranslationKey } from "@/shared/lib/i18n/translate";

interface ProductTypeFormModalProps {
  open: boolean;
  onClose: () => void;
  productType?: ProductType | null;
}

const EMPTY_VALUES: ProductTypeFormValues = { name: "", code: "", notes: "" };

export function ProductTypeFormModal({ open, onClose, productType }: ProductTypeFormModalProps) {
  const { t } = useT();
  const toast = useToast();
  const isEdit = Boolean(productType);
  const createMutation = useCreateProductType();
  const updateMutation = useUpdateProductType();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductTypeFormValues>({
    resolver: zodResolver(productTypeSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (open) {
      reset(
        productType
          ? {
              name: productType.name,
              code: productType.code,
              notes: productType.notes ?? "",
            }
          : EMPTY_VALUES,
      );
    }
  }, [open, productType, reset]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const translateMessage = (raw: string | undefined, fallback: string) => {
    if (!raw) return fallback;
    if (!raw.includes(".")) return raw;
    const translated = t(raw as TranslationKey);
    return translated === raw ? fallback : translated;
  };

  const onSubmit = handleSubmit((values) => {
    const payload = {
      name: values.name.trim(),
      code: values.code.trim(),
      notes: values.notes?.trim() || undefined,
    };

    const onSuccess = () => {
      toast.success(
        isEdit
          ? t("productTypes.update.success")
          : t("productTypes.create.success"),
      );
      onClose();
    };

    const onError = (error: unknown) => {
      if (isApiError(error)) {
        if (error.status === 409) {
          toast.error(
            isEdit
              ? t("productTypes.update.conflict")
              : t("productTypes.delete.conflict"),
          );
          return;
        }
        toast.error(error.message || t("errors.unknown"));
        return;
      }
      toast.error(t("errors.unknown"));
    };

    if (isEdit && productType) {
      updateMutation.mutate({ id: productType.id, ...payload }, { onSuccess, onError });
    } else {
      createMutation.mutate(payload, { onSuccess, onError });
    }
  });

  return (
    <Modal
      open={open}
      onClose={isPending ? () => undefined : onClose}
      title={isEdit ? t("productTypes.form.editTitle") : t("productTypes.form.createTitle")}
      size="sm"
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
            label={t("productTypes.form.fields.name")}
            error={translateMessage(errors.name?.message, "")}
            required
          >
            <Input
              autoFocus
              disabled={isPending}
              invalid={Boolean(errors.name)}
              {...register("name")}
            />
          </FormField>
          <FormField
            label={t("productTypes.form.fields.code")}
            hint="Solo letras y números"
            error={translateMessage(errors.code?.message, "")}
            required
          >
            <Input
              disabled={isPending}
              invalid={Boolean(errors.code)}
              placeholder="ELEC"
              {...register("code")}
            />
          </FormField>
        </FormRow>

        <FormField
          label={t("productTypes.form.fields.notes")}
          error={translateMessage(errors.notes?.message, "")}
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
