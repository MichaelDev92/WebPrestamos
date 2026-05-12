import { type NextRequest, NextResponse } from "next/server";
import { serverConfig } from "@/server/config";
import { clearSession, readAccessToken } from "@/server/auth/session";
import { tryRefresh } from "@/server/auth/refresh";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
]);

function buildRequestHeaders(request: NextRequest, accessToken: string | null): Headers {
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });
  if (accessToken) {
    headers.set("authorization", `Bearer ${accessToken}`);
  } else {
    headers.delete("authorization");
  }
  return headers;
}

function buildResponseHeaders(source: Headers): Headers {
  const headers = new Headers();
  source.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });
  return headers;
}

async function forward(
  request: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
): Promise<NextResponse> {
  const { path } = await ctx.params;
  const targetPath = path.join("/");
  const targetUrl = `${serverConfig.apiUrl}/${targetPath}${request.nextUrl.search}`;

  const method = request.method.toUpperCase();
  const bodyBuffer =
    method === "GET" || method === "HEAD" ? null : Buffer.from(await request.arrayBuffer());

  let accessToken = await readAccessToken();

  const doFetch = async () => {
    const headers = buildRequestHeaders(request, accessToken);
    return fetch(targetUrl, {
      method,
      headers,
      body: bodyBuffer,
      cache: "no-store",
      redirect: "manual",
    });
  };

  let upstream = await doFetch();

  if (upstream.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      accessToken = refreshed;
      upstream = await doFetch();
    } else {
      await clearSession();
      return NextResponse.json(
        { message: "Session expired" },
        { status: 401 },
      );
    }
  }

  const responseBody = await upstream.arrayBuffer();
  return new NextResponse(responseBody, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: buildResponseHeaders(upstream.headers),
  });
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
