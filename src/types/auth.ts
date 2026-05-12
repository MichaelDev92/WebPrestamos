export const ROLES = ["user", "admin", "superadmin"] as const;
export type Role = (typeof ROLES)[number];

export const DASHBOARD_ALLOWED_ROLES: Role[] = ["admin", "superadmin"];
export const REGISTER_ALLOWED_ROLES: Role[] = ["superadmin"];

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface AccessTokenClaims {
  sub: string;
  email: string;
  role: Role;
  fullName: string;
  iat: number;
  exp: number;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterRequest {
  names: string;
  surnames: string;
  email: string;
  password: string;
  phoneNumber?: string;
  address?: string;
  birthdate?: string; // ISO 8601
  role?: Role;
}

export function hasRole(user: SessionUser | null, allowed: Role[]): boolean {
  return Boolean(user && allowed.includes(user.role));
}
