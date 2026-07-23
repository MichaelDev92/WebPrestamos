import path from "node:path";
import type { NextConfig } from "next";
import { version as appVersion } from "./package.json";

const isDev = process.env.NODE_ENV !== "production";

// Origen del socket del chat (API). connect-src debe permitirlo (http + ws) porque
// el socket va a un origen distinto al del Web.
const wsOrigin = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:3000";
const wsScheme = wsOrigin.replace(/^http/, "ws");

/**
 * Content-Security-Policy. En dev se permite 'unsafe-eval' y websockets (HMR de Turbopack).
 * En producción se restringe. Los tokens viven en cookies httpOnly, no en JS.
 */
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${wsOrigin} ${wsScheme}${isDev ? " ws: wss: http://localhost:*" : ""}`,
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Expone la versión del package.json al cliente (footer del sidebar).
  env: {
    NEXT_PUBLIC_APP_VERSION: appVersion,
  },
  turbopack: {
    root: path.join(__dirname),
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
