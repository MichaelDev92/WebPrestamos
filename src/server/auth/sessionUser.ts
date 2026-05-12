import "server-only";
import { cookies } from "next/headers";
import type { SessionUser } from "@/types/auth";
import { serverConfig } from "@/server/config";

const USER_COOKIE = "wp_user";
const USER_MAX_AGE = 60 * 60 * 24 * 7;

export async function readSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const raw = store.get(USER_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export async function writeSessionUser(user: SessionUser): Promise<void> {
  const store = await cookies();
  store.set(USER_COOKIE, JSON.stringify(user), {
    httpOnly: true,
    secure: serverConfig.isProduction,
    sameSite: serverConfig.cookies.sameSite,
    path: "/",
    maxAge: USER_MAX_AGE,
  });
}

export async function clearSessionUser(): Promise<void> {
  const store = await cookies();
  store.delete(USER_COOKIE);
}
