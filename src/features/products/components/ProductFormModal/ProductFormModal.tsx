"use client";

import { useEffect } from "react";
import { Controller, useController, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/shared/components/ui/Modal/Modal";
import { FormField, FormRow } from "@/shared/components/ui/FormField/FormField";
import { Input } from "@/shared/components/ui/Input/Input";
import { Dropdown } from "@/shared/components/ui/Dropdown/Dropdown";
import { Textarea } from "@/shared/components/ui/Textarea/Textarea";
import { Button } from "@/shared/components/ui/Button/Button";
import { useT } from "@/shared/hooks/useT";
import { useToast } from "@/shared/hooks/useToast";
import { useProductTypesQuery } from "@/features/product-types/hooks/useProductTypes";
import { isApiError } from "@/shared/lib/http/errors";
import {
  useCreateProduct,
  useUpdateProduct,
} from "@/features/products/hooks/useProducts";
import { productSchema, type ProductFormValues } from "@/features/products/schemas";
import type { Product } from "@/features/products/types";
import { ImageUrlsField } from "@/features/products/components/ImageUrlsField/ImageUrlsField";
import type { TranslationKey } from "@/shared/lib/i18n/translate";

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  product?: Product | null;
}

const EMPTY_VALUES: ProductFormValues = {
  name: "",
  code: "",
  productType: "",
  salePrice: 0,
  costPrice: undefined,
  stock: 0,
  barcode: "",
  brand: "",
  model: "",
  description: "",
  imageUrls: [],
};

export function ProductFormModal({ open, onClose, product }: ProductFormModalProps) {
  const { t } = useT();
  const toast = useToast();
  const typesQuery = useProductTypesQuery();
  const isEdit = Boolean(product);
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: EMPTY_VALUES,
  });

  const productType = useController({ control, name: "productType" });

  useEffect(() => {
    if (!open) return;
    if (product) {
      reset({
        name: product.name,
        code: product.code,
        productType: product.productType.id,
        salePrice: product.salePrice,
        costPrice: product.costPrice ?? undefined,
        stock: product.stock,
        barcode: product.barcode ?? "",
        brand: product.brand ?? "",
        model: product.model ?? "",
        description: product.description ?? "",
        imageUrls: product.imageUrls ?? [],
      });
    } else {
      reset(EMPTY_VALUES);
    }
  }, [open, product, reset]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const translate = (raw: string | undefined, fallback = "") => {
    if (!raw) return fallback;
    if (!raw.includes(".")) return raw;
    const translated = t(raw as TranslationKey);
    return translated === raw ? fallback || raw : translated;
  };

  const onSubmit = handleSubmit((values) => {
    const payload = {
      name: values.name.trim(),
      code: values.code.trim(),
      productType: values.productType,
      salePrice: values.salePrice,
      costPrice: values.costPrice,
      stock: values.stock,
      barcode: values.barcode?.trim() || undefined,
      brand: values.brand?.trim() || undefined,
      model: values.model?.trim() || undefined,
      description: values.description?.trim() || undefined,
      imageUrls: values.imageUrls.filter((url) => url.trim() !== ""),
    };

    const onSuccess = () => {
      toast.success(
        isEdit ? t("products.update.success") : t("products.create.success"),
      );
      onClose();
    };

    const onError = (error: unknown) => {
      if (isApiError(error)) {
        if (error.status === 409) {
          toast.error(t("products.create.duplicateCode"));
          return;
        }
        toast.error(error.message || t("errors.unknown"));
        return;
      }
      toast.error(t("errors.unknown"));
    };

    if (isEdit && product) {
      updateMutation.mutate({ id: product.id, ...payload }, { onSuccess, onError });
    } else {
      createMutation.mutate(payload, { onSuccess, onError });
    }
  });

  return (
    <Modal
      open={open}
      onClose={isPending ? () => undefined : onClose}
      title={isEdit ? t("products.form.editTitle") : t("products.form.createTitle")}
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
            label={t("products.form.fields.name")}
            error={translate(errors.name?.message)}
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
            label={t("products.form.fields.code")}
            error={translate(errors.code?.message)}
            required
          >
            <Input
              disabled={isPending}
              invalid={Boolean(errors.code)}
              placeholder="LAP-001"
              {...register("code")}
            />
          </FormField>
        </FormRow>

        <FormField
          label={t("products.form.fields.productType")}
          error={translate(errors.productType?.message)}
          required
        >
          <Dropdown
            value={productType.field.value}
            onChange={productType.field.onChange}
            options={
              typesQuery.data?.map((type) => ({
                value: type.id,
                label: `${type.name} (${type.code})`,
              })) ?? []
            }
            placeholder="—"
            searchable
            disabled={isPending || typesQuery.isLoading}
            invalid={Boolean(errors.productType)}
          />
        </FormField>

        <FormRow columns={2}>
          <FormField
            label={t("products.form.fields.salePrice")}
            error={translate(errors.salePrice?.message)}
            required
          >
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              disabled={isPending}
              invalid={Boolean(errors.salePrice)}
              {...register("salePrice", { valueAsNumber: true })}
            />
          </FormField>
          <FormField
            label={t("products.form.fields.costPrice")}
            error={translate(errors.costPrice?.message)}
          >
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              disabled={isPending}
              invalid={Boolean(errors.costPrice)}
              {...register("costPrice", {
                setValueAs: (value: string) =>
                  value === "" || value === undefined ? undefined : Number(value),
              })}
            />
          </FormField>
        </FormRow>

        <FormRow columns={2}>
          <FormField
            label={t("products.form.fields.stock")}
            error={translate(errors.stock?.message)}
            required
          >
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              disabled={isPending}
              invalid={Boolean(errors.stock)}
              {...register("stock", { valueAsNumber: true })}
            />
          </FormField>
          <FormField
            label={t("products.form.fields.barcode")}
            error={translate(errors.barcode?.message)}
          >
            <Input
              disabled={isPending}
              invalid={Boolean(errors.barcode)}
              {...register("barcode")}
            />
          </FormField>
        </FormRow>

        <FormRow columns={2}>
          <FormField
            label={t("products.form.fields.brand")}
            error={translate(errors.brand?.message)}
          >
            <Input
              disabled={isPending}
              invalid={Boolean(errors.brand)}
              {...register("brand")}
            />
          </FormField>
          <FormField
            label={t("products.form.fields.model")}
            error={translate(errors.model?.message)}
          >
            <Input
              disabled={isPending}
              invalid={Boolean(errors.model)}
              {...register("model")}
            />
          </FormField>
        </FormRow>

        <FormField
          label={t("products.form.fields.description")}
          error={translate(errors.description?.message)}
        >
          <Textarea
            rows={3}
            disabled={isPending}
            invalid={Boolean(errors.description)}
            {...register("description")}
          />
        </FormField>

        <FormField
          label={t("products.form.fields.imageUrls")}
          error={errors.imageUrls?.message ? translate(errors.imageUrls.message) : undefined}
        >
          <Controller
            control={control}
            name="imageUrls"
            render={({ field }) => (
              <ImageUrlsField
                value={field.value ?? []}
                onChange={field.onChange}
                disabled={isPending}
                errors={errors.imageUrls?.map?.((error) => error?.message) as string[] | undefined}
              />
            )}
          />
        </FormField>
      </form>
    </Modal>
  );
}
