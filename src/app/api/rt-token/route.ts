import { NextResponse } from "next/server";
import { readAccessToken } from "@/server/auth/session";
import { tryRefresh } from "@/server/auth/refresh";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "cache-control": "no-store" } as const;

/**
 * Emite el access token (leído de la cookie httpOnly en el server) para autenticar
 * el handshake del socket del chat. Refresca si el access ya expiró. Token corto (15 min).
 */
export async function GET() {
  let token = await readAccessToken();
  if (!token) {
    token = await tryRefresh();
  }
  if (!token) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401, headers: NO_STORE });
  }
  return NextResponse.json({ token }, { headers: NO_STORE });
}
