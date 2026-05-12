"use server";

import { redirect } from "next/navigation";
import { serverConfig } from "@/server/config";
import {
  clearSession,
  readAccessToken,
  writeSession,
} from "./session";
import {
  clearSessionUser,
  writeSessionUser,
} from "./sessionUser";
import {
  DASHBOARD_ALLOWED_ROLES,
  type AccessTokenClaims,
  type LoginResponse,
  type RegisterRequest,
  type SessionUser,
} from "@/types/auth";

export interface ActionResult<T = void> {
  ok: boolean;
  data?: T;
  error?: {
    status: number;
    message: string;
  };
}

interface LoginInput {
  email: string;
  password: string;
}

export async function loginAction(input: LoginInput): Promise<ActionResult<SessionUser>> {
  try {
    const response = await fetch(`${serverConfig.apiUrl}/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
      cache: "no-store",
    });

    if (!response.ok) {
      const payload = (await safeJson(response)) as { message?: string } | null;
      return {
        ok: false,
        error: {
          status: response.status,
          message: payload?.message ?? "auth.login.invalidCredentials",
        },
      };
    }

    const data = (await response.json()) as LoginResponse;
    if (!data.accessToken || !data.refreshToken) {
      return {
        ok: false,
        error: { status: 500, message: "errors.server" },
      };
    }

    const claims = decodeJwtPayload<AccessTokenClaims>(data.accessToken);
    if (!claims?.sub || !claims.email || !claims.role || !claims.fullName) {
      return {
        ok: false,
        error: { status: 500, message: "errors.server" },
      };
    }

    const user: SessionUser = {
      id: claims.sub,
      email: claims.email,
      fullName: claims.fullName,
      role: claims.role,
    };

    if (!DASHBOARD_ALLOWED_ROLES.includes(user.role)) {
      return {
        ok: false,
        error: { status: 403, message: "auth.login.unauthorized" },
      };
    }

    await writeSession({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
    await writeSessionUser(user);

    return { ok: true, data: user };
  } catch {
    return { ok: false, error: { status: 0, message: "errors.network" } };
  }
}

export async function logoutAction(): Promise<void> {
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
  redirect("/login");
}

export async function registerAction(
  input: RegisterRequest,
): Promise<ActionResult<SessionUser>> {
  try {
    const accessToken = await readAccessToken();
    if (!accessToken) {
      return { ok: false, error: { status: 401, message: "auth.sessionExpired" } };
    }

    const response = await fetch(`${serverConfig.apiUrl}/auth/register`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(input),
      cache: "no-store",
    });

    if (!response.ok) {
      const payload = (await safeJson(response)) as { message?: string } | null;
      return {
        ok: false,
        error: {
          status: response.status,
          message: payload?.message ?? "errors.unknown",
        },
      };
    }

    const data = (await response.json()) as SessionUser;
    return { ok: true, data };
  } catch {
    return { ok: false, error: { status: 0, message: "errors.network" } };
  }
}

async function safeJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function decodeJwtPayload<T>(token: string): T | null {
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
