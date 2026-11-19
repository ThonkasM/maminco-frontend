import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

function origin(url: string | undefined): string[] {
  if (!url) return [];
  try {
    const u = new URL(url);
    const ws = u.protocol === "https:" ? "wss:" : "ws:";
    return [u.origin, `${ws}//${u.host}`];
  } catch {
    return [];
  }
}

export function buildContentSecurityPolicy(): string {
  const connect = [
    "'self'",
    ...origin(process.env.NEXT_PUBLIC_API_URL),
    ...origin(process.env.NEXT_PUBLIC_SOCKET_URL),
  ];
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src ${Array.from(new Set(connect)).join(" ")}${isDev ? " ws: http:" : ""}`,
    `frame-src ${Array.from(new Set(["'self'", ...origin(process.env.NEXT_PUBLIC_API_URL).slice(0, 1), "https://*.s3.amazonaws.com", "https://*.s3.us-east-1.amazonaws.com"])).join(" ")}`,
    "media-src 'self' blob:",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
  ].join("; ");
}

const securityHeaders = [
  { key: "Content-Security-Policy", value: buildContentSecurityPolicy() },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(self), geolocation=(), payment=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
