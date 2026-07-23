import { z } from "zod";

export const userSchema = z.object({
  names: z.string().min(2, "Mínimo 2 caracteres").max(100, "Máximo 100 caracteres"),
  surnames: z.string().min(2, "Mínimo 2 caracteres").max(100, "Máximo 100 caracteres"),
  email: z.string().min(1, "common.validation.required").email("common.validation.email"),
  // Opcional a nivel schema; en modo creación se exige en el submit del modal.
  password: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .max(32, "Máximo 32 caracteres")
    .optional()
    .or(z.literal("")),
  role: z.enum(["user", "admin", "superadmin"]),
  phoneNumber: z.string().max(20, "Máximo 20 caracteres").optional().or(z.literal("")),
  address: z.string().max(200, "Máximo 200 caracteres").optional().or(z.literal("")),
  birthdate: z.string().min(1, "common.validation.required"),
});

export type UserFormValues = z.infer<typeof userSchema>;
