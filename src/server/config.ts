import "server-only";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variable de entorno requerida: ${name}`);
  }
  return value;
}

/**
 * Acceso lazy a config server-only.
 * Los getters evalúan env vars solo cuando se usan (no al importar),
 * para que el build no falle si una env runtime no está disponible.
 */
export const serverConfig = {
  get apiUrl(): string {
    return requireEnv("API_URL").replace(/\/$/, "");
  },
  cookies: {
    get access(): string {
      return process.env.SESSION_COOKIE_ACCESS ?? "wp_at";
    },
    get refresh(): string {
      return process.env.SESSION_COOKIE_REFRESH ?? "wp_rt";
    },
    get sameSite(): "lax" | "strict" | "none" {
      return (process.env.COOKIE_SAMESITE as "lax" | "strict" | "none") ?? "lax";
    },
  },
  get isProduction(): boolean {
    return process.env.NODE_ENV === "production";
  },
} as const;
