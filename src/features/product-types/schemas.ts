import { z } from "zod";

export const productTypeSchema = z.object({
  name: z
    .string()
    .min(1, "common.validation.required")
    .max(80, "common.validation.maxLength"),
  code: z
    .string()
    .min(1, "common.validation.required")
    .max(20, "common.validation.maxLength")
    .regex(/^[A-Z0-9_-]+$/i, "Solo letras, números, guión y guión bajo")
    .transform((value) => value.toUpperCase()),
  notes: z.string().max(500, "common.validation.maxLength").optional().or(z.literal("")),
});

export type ProductTypeFormValues = z.infer<typeof productTypeSchema>;
