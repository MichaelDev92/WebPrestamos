import "server-only";
import { serverConfig } from "@/server/config";
import {
  clearSession,
  readRefreshToken,
  writeSession,
} from "./session";

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * Intenta refrescar la sesión usando el refreshToken de las cookies.
 * Si OK: setea cookies nuevas y devuelve el nuevo accessToken.
 * Si falla: limpia cookies y devuelve null.
 *
 * Concurrency: si múltiples requests reciben 401 simultáneo, se deduplican
 * vía un Promise compartido durante la ventana de refresh.
 */
let inflight: Promise<string | null> | null = null;

export async function tryRefresh(): Promise<string | null> {
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const refreshToken = await readRefreshToken();
      if (!refreshToken) return null;

      const response = await fetch(`${serverConfig.apiUrl}/auth/refresh`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          // La API valida el refresh token desde la cookie `refreshToken`
          // (RefreshTokenGuard). Este Web es BFF: reenvía el token (guardado en su
          // propia cookie httpOnly) como cookie para que el guard lo encuentre.
          cookie: `refreshToken=${refreshToken}`,
        },
        body: JSON.stringify({ refreshToken }),
        cache: "no-store",
      });

      if (!response.ok) {
        await clearSession();
        return null;
      }

      const data = (await response.json()) as RefreshResponse;
      if (!data?.accessToken || !data?.refreshToken) {
        await clearSession();
        return null;
      }

      await writeSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      return data.accessToken;
    } catch {
      await clearSession();
      return null;
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}
