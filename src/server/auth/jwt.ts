import "server-only";

/**
 * Decodifica el payload de un JWT sin verificar la firma.
 * Uso server-only: solo para leer claims (exp, role...) de tokens ya emitidos
 * por la API y guardados en cookies httpOnly.
 */
export function decodeJwt<T = Record<string, unknown>>(token: string): T | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(Buffer.from(padded, "base64").toString("utf8")) as T;
  } catch {
    return null;
  }
}

/** Devuelve el `exp` del token en milisegundos epoch, o null si no se puede leer. */
export function getTokenExpiryMs(token: string | null): number | null {
  if (!token) return null;
  const payload = decodeJwt<{ exp?: number }>(token);
  if (!payload?.exp) return null;
  return payload.exp * 1000;
}

/** True si el token no existe, no tiene `exp`, o ya venció. */
export function isTokenExpired(token: string | null): boolean {
  const exp = getTokenExpiryMs(token);
  return !exp || exp <= Date.now();
}
