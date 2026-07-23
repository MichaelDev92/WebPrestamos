import { z } from "zod";

export const clientSchema = z.object({
  names: z.string().min(2, "Mínimo 2 caracteres").max(100, "Máximo 100 caracteres"),
  surnames: z.string().min(2, "Mínimo 2 caracteres").max(100, "Máximo 100 caracteres"),
  email: z.string().min(1, "common.validation.required").email("common.validation.email"),
  phoneNumber: z.string().min(7, "Teléfono inválido").max(20, "Máximo 20 caracteres"),
  address: z.string().min(5, "Mínimo 5 caracteres").max(200, "Máximo 200 caracteres"),
  birthdate: z.string().min(1, "common.validation.required"),
  typeDocument: z.string().min(1, "common.validation.required"),
  documentNumber: z.string().min(5, "Mínimo 5 caracteres").max(20, "Máximo 20 caracteres"),
  employmentStatus: z.string().min(1, "common.validation.required"),
  employerName: z.string().min(2, "Mínimo 2 caracteres").max(100, "Máximo 100 caracteres"),
  monthlyIncome: z
    .number({ message: "common.validation.required" })
    .nonnegative("common.validation.positiveNumber"),
  creditScore: z
    .number({ message: "common.validation.required" })
    .int("common.validation.integer")
    .min(0, "common.validation.positiveNumber"),
  riskCategory: z.string().min(1, "common.validation.required"),
  notes: z.string().min(2, "Mínimo 2 caracteres").max(300, "Máximo 300 caracteres"),
});

export type ClientFormValues = z.infer<typeof clientSchema>;
