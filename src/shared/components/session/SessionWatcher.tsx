"use client";

import { useEffect, useRef } from "react";

interface SessionWatcherProps {
  /** Tope absoluto (epoch ms): expiración del refresh token. */
  absoluteExpiresAt: number | null;
  /** Timeout por inactividad en ms. Cualquier actividad del usuario lo resetea. */
  inactivityMs?: number;
}

const DEFAULT_INACTIVITY_MS = 15 * 60 * 1000; // 15 min sin actividad → logout
const REFRESH_AFTER_MS = 13 * 60 * 1000; // si hay actividad, refrescar ~antes de que expire el access (15 min)
const CHECK_INTERVAL_MS = 30 * 1000; // chequeo cada 30s
const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
  "pointerdown",
] as const;

/**
 * Observador de sesión híbrido con refresco proactivo:
 * - Mientras el usuario está ACTIVO, refresca los tokens antes de que el access
 *   expire (ventana deslizante) → nunca se cae la sesión trabajando.
 * - Si NO hay actividad durante `inactivityMs` → cierra sesión y va a /login.
 * - Si el refresh token realmente venció (tope absoluto) o el refresh falla → login.
 * - Revalida en focus/visibilitychange/pageshow (cubre bfcache y sleep).
 * Al expirar usa `location.replace('/login')` (sin entrada en el historial).
 */
export function SessionWatcher({
  absoluteExpiresAt,
  inactivityMs = DEFAULT_INACTIVITY_MS,
}: SessionWatcherProps) {
  const lastActivityRef = useRef(0);
  const lastRefreshRef = useRef(0);
  const absoluteExpiryRef = useRef<number | null>(absoluteExpiresAt);
  const busyRef = useRef(false);
  const expiredRef = useRef(false);

  useEffect(() => {
    const now = Date.now();
    absoluteExpiryRef.current = absoluteExpiresAt;
    lastActivityRef.current = now;
    lastRefreshRef.current = now;
    expiredRef.current = false;
    let cancelled = false;

    const expire = async () => {
      if (expiredRef.current) return;
      expiredRef.current = true;
      try {
        // Route Handler (fuera del middleware) en vez de Server Action: evita que
        // el redirect a /login rompa el cliente de acciones cuando ya no hay cookie.
        await fetch("/api/session", { method: "DELETE", cache: "no-store" });
      } catch {
        // Ignora fallos de red: igual redirigimos al login.
      } finally {
        window.location.replace("/login");
      }
    };

    const markActivity = () => {
      lastActivityRef.current = Date.now();
    };

    /** Rota tokens (extiende la sesión). Devuelve false solo si el refresh es rechazado. */
    const refreshSession = async (): Promise<boolean> => {
      if (busyRef.current) return true;
      busyRef.current = true;
      try {
        const response = await fetch("/api/session/refresh", {
          method: "POST",
          cache: "no-store",
        });
        if (response.status === 401) return false;
        if (response.ok) {
          const data = (await response.json()) as { absoluteExpiresAt?: number };
          if (data?.absoluteExpiresAt) absoluteExpiryRef.current = data.absoluteExpiresAt;
          lastRefreshRef.current = Date.now();
        }
        return true;
      } catch {
        return true; // fallo de red puntual: no forzar logout
      } finally {
        busyRef.current = false;
      }
    };

    const isInactive = () => Date.now() - lastActivityRef.current >= inactivityMs;
    const absoluteExpired = () => {
      const abs = absoluteExpiryRef.current;
      return Boolean(abs && Date.now() >= abs);
    };

    const tick = async () => {
      if (cancelled || expiredRef.current) return;
      if (isInactive() || absoluteExpired()) {
        void expire();
        return;
      }
      // Activo: refresca proactivamente antes de que el access expire.
      if (Date.now() - lastRefreshRef.current >= REFRESH_AFTER_MS) {
        const ok = await refreshSession();
        if (!ok && !cancelled) void expire();
      }
    };

    const revalidate = async () => {
      if (cancelled || expiredRef.current) return;
      if (isInactive()) {
        void expire();
        return;
      }
      try {
        const response = await fetch("/api/session", { cache: "no-store" });
        if (!response.ok) {
          if (!cancelled) void expire();
          return;
        }
        const data = (await response.json()) as { absoluteExpiresAt?: number };
        if (data?.absoluteExpiresAt) absoluteExpiryRef.current = data.absoluteExpiresAt;
      } catch {
        return; // red caída: no forzar logout
      }
      // Si estuvo en background y el access pudo expirar, renueva.
      if (Date.now() - lastRefreshRef.current >= REFRESH_AFTER_MS) {
        const ok = await refreshSession();
        if (!ok && !cancelled) void expire();
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") void revalidate();
    };
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) void revalidate();
    };

    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, markActivity, { passive: true }),
    );
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("focus", onVisibility);
    const interval = window.setInterval(() => void tick(), CHECK_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, markActivity));
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("focus", onVisibility);
    };
  }, [absoluteExpiresAt, inactivityMs]);

  return null;
}
