"use server";

import { cookies } from "next/headers";
import { isTheme, THEME_COOKIE, type Theme } from "./theme.constants";

export async function setThemeCookie(theme: Theme): Promise<void> {
  if (!isTheme(theme)) return;
  const store = await cookies();
  store.set(THEME_COOKIE, theme, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    httpOnly: false,
  });
}
