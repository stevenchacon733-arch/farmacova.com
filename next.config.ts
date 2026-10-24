import type { NextConfig } from "next";

// Lista de orígenes que el navegador puede usar. Todo lo demás se bloquea:
// si alguien lograra inyectar un script, no podría cargar código de otro
// sitio ni enviar datos fuera. Supabase se lee de la variable pública.
function contentSecurityPolicy() {
  const dev = process.env.NODE_ENV !== "production";
  const preview = process.env.VERCEL_ENV === "preview";
  let supabase: string[] = [];
  try {
    const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
    supabase = [url.origin, `wss://${url.host}`];
  } catch {}
  // Barra de comentarios de Vercel, solo en las vistas previas.
  const vercel = preview ? ["https://vercel.live"] : [];
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      "'unsafe-inline'",
      ...(dev ? ["'unsafe-eval'"] : []),
      "https://www.googletagmanager.com",
      "https://connect.facebook.net",
      ...vercel,
    ],
    "style-src": ["'self'", "'unsafe-inline'", ...vercel],
    "img-src": ["'self'", "data:", "blob:", "https:"],
    "font-src": [
      "'self'",
      "data:",
      ...vercel,
      ...(preview ? ["https://assets.vercel.com"] : []),
    ],
    "connect-src": [
      "'self'",
      ...supabase,
      "https://*.google-analytics.com",
      "https://*.analytics.google.com",
      "https://www.googletagmanager.com",
      "https://www.facebook.com",
      ...vercel,
      ...(preview ? ["wss://ws-us3.pusher.com"] : []),
    ],
    "frame-src": vercel.length ? vercel : ["'none'"],
    "worker-src": ["'self'", "blob:"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
  };
  return [
    ...Object.entries(directives).map(([key, values]) =>
      [key, ...values].join(" "),
    ),
    ...(dev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // next/image entrega AVIF o WebP según el navegador, con carga diferida.
  images: { formats: ["image/avif", "image/webp"] },
  // Opción para verificar en entornos que restringen procesos secundarios.
  ...(process.env.FARMACOVA_RESTRICTED_BUILD === "true"
    ? {
        experimental: {
          useTypeScriptCli: false,
          workerThreads: true,
          webpackBuildWorker: false,
          cpus: 2,
        },
      }
    : {}),
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy() },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
