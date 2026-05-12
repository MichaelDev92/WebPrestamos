import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "common.validation.required").max(120, "common.validation.maxLength"),
  code: z
    .string()
    .min(1, "common.validation.required")
    .max(40, "common.validation.maxLength")
    .regex(/^[A-Z0-9_-]+$/i, "Solo letras, números, guión y guión bajo")
    .transform((value) => value.toUpperCase()),
  productType: z.string().min(1, "common.validation.required"),
  salePrice: z
    .number({ message: "common.validation.required" })
    .positive("common.validation.positiveNumber"),
  costPrice: z
    .number()
    .nonnegative("common.validation.positiveNumber")
    .optional()
    .or(z.literal(undefined)),
  stock: z
    .number({ message: "common.validation.required" })
    .int("common.validation.integer")
    .nonnegative("common.validation.positiveNumber"),
  barcode: z.string().max(60, "common.validation.maxLength").optional().or(z.literal("")),
  brand: z.string().max(80, "common.validation.maxLength").optional().or(z.literal("")),
  model: z.string().max(80, "common.validation.maxLength").optional().or(z.literal("")),
  description: z
    .string()
    .max(1000, "common.validation.maxLength")
    .optional()
    .or(z.literal("")),
  imageUrls: z.array(z.string().url("common.validation.url")).max(10),
});

export type ProductFormValues = z.infer<typeof productSchema>;
