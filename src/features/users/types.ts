import type { Role } from "@/types/auth";

export interface User {
  id: string;
  names: string;
  surnames: string;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  address?: string | null;
  /** ISO. Nota: el mapper de la API expone aquí el `birthdate`. */
  registrationDate: string;
  role: Role;
  /** 1 = activo, 0 = inactivo (soft delete). */
  active: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListUsersParams {
  page: number;
  limit: number;
  search?: string;
}

export interface UserPayload {
  names: string;
  surnames: string;
  fullName: string;
  email: string;
  password?: string;
  phoneNumber?: string;
  address?: string;
  birthdate: string;
  registrationDate?: string;
  role: Role;
}

export interface UpdateUserPayload extends UserPayload {
  id: string;
}
