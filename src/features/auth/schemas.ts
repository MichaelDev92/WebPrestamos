import { z } from "zod";
import { ROLES } from "@/types/auth";

export const loginSchema = z.object({
  email: z.string().email("common.validation.email"),
  password: z.string().min(1, "common.validation.required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  names: z.string().min(1, "common.validation.required"),
  surnames: z.string().min(1, "common.validation.required"),
  email: z.string().email("common.validation.email"),
  password: z.string().min(8, "common.validation.minLength"),
  phoneNumber: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  birthdate: z.string().optional().or(z.literal("")),
  role: z.enum(ROLES).default("user"),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
