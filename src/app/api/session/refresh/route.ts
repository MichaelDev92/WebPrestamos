import { NextResponse } from "next/server";
import { tryRefresh } from "@/server/auth/refresh";
import { readRefreshToken } from "@/server/auth/session";
import { getTokenExpiryMs } from "@/server/auth/jwt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "cache-control": "no-store" } as const;

/**
 * Refresco proactivo: rota access + refresh usando la cookie de refresh (server-only).
 * Lo invoca el SessionWatcher mientras el usuario está activo, antes de que el
 * access token expire, para mantener la sesión viva (ventana deslizante).
 * - 200 { ok: true, absoluteExpiresAt } con la nueva expiración del refresh token.
 * - 401 { ok: false } si el refresh falló (token inválido/vencido) → forzar login.
 */
export async function POST() {
  const accessToken = await tryRefresh();
  if (!accessToken) {
    return NextResponse.json({ ok: false }, { status: 401, headers: NO_STORE });
  }
  const refresh = await readRefreshToken();
  const absoluteExpiresAt = getTokenExpiryMs(refresh);
  return NextResponse.json({ ok: true, absoluteExpiresAt }, { headers: NO_STORE });
}
