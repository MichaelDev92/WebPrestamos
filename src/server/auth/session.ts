import "server-only";
import { cookies } from "next/headers";
import { serverConfig } from "@/server/config";

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
  accessMaxAgeSeconds?: number;
  refreshMaxAgeSeconds?: number;
}

const ACCESS_MAX_AGE_DEFAULT = 60 * 15; // 15 min
const REFRESH_MAX_AGE_DEFAULT = 60 * 60 * 24 * 7; // 7 días

export async function readAccessToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(serverConfig.cookies.access)?.value ?? null;
}

export async function readRefreshToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(serverConfig.cookies.refresh)?.value ?? null;
}

export async function writeSession(tokens: SessionTokens): Promise<void> {
  const store = await cookies();
  const baseOptions = {
    httpOnly: true,
    secure: serverConfig.isProduction,
    sameSite: serverConfig.cookies.sameSite,
    path: "/",
  } as const;

  store.set(serverConfig.cookies.access, tokens.accessToken, {
    ...baseOptions,
    maxAge: tokens.accessMaxAgeSeconds ?? ACCESS_MAX_AGE_DEFAULT,
  });
  store.set(serverConfig.cookies.refresh, tokens.refreshToken, {
    ...baseOptions,
    maxAge: tokens.refreshMaxAgeSeconds ?? REFRESH_MAX_AGE_DEFAULT,
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(serverConfig.cookies.access);
  store.delete(serverConfig.cookies.refresh);
}

export async function hasSession(): Promise<boolean> {
  const access = await readAccessToken();
  return Boolean(access);
}
