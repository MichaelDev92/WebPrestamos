import { NextResponse } from "next/server";
import { serverConfig } from "@/server/config";
import { clearSession, readAccessToken, readRefreshToken } from "@/server/auth/session";
import { clearSessionUser, readSessionUser } from "@/server/auth/sessionUser";
import { getTokenExpiryMs } from "@/server/auth/jwt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "cache-control": "no-store" } as const;

/**
 * Estado de sesión para el observador cliente (SessionWatcher).
 * - 200 { authenticated: true, absoluteExpiresAt } mientras la sesión es válida.
 * - 401 { authenticated: false } si no hay usuario/refresh o el refresh ya venció.
 * Siempre `no-store` para que ni el navegador ni un proxy lo cacheen.
 */
export async function GET() {
  const [user, refresh] = await Promise.all([readSessionUser(), readRefreshToken()]);
  const absoluteExpiresAt = getTokenExpiryMs(refresh);
  const authenticated = Boolean(
    user && refresh && absoluteExpiresAt && absoluteExpiresAt > Date.now(),
  );

  if (!authenticated) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401, headers: NO_STORE },
    );
  }

  return NextResponse.json(
    { authenticated: true, absoluteExpiresAt },
    { headers: NO_STORE },
  );
}

/**
 * Cierra la sesión (para el SessionWatcher al expirar por inactividad/tope).
 * Se usa un Route Handler en lugar de una Server Action porque las rutas `/api`
 * quedan fuera del middleware: así el POST/DELETE no puede ser redirigido a
 * `/login` cuando la cookie de acceso ya no está (el redirect rompía el cliente
 * de Server Actions → unhandledRejection "An unexpected response...").
 * Invalida el refresh token en la API (best-effort) y limpia las cookies.
 */
export async function DELETE() {
  try {
    const accessToken = await readAccessToken();
    if (accessToken) {
      await fetch(`${serverConfig.apiUrl}/auth/logout`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      }).catch(() => undefined);
    }
  } finally {
    await clearSession();
    await clearSessionUser();
  }
  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}
