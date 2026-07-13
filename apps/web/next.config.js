/** @type {import('next').NextConfig} */
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  // Self-contained server build for the Docker runner image (TASK-020).
  // apps/web/Dockerfile copies .next/standalone — without this the image build fails.
  output: "standalone",

  // Turbopack needs the monorepo root in workspaces (Next.js 16+).
  turbopack: {
    root: resolve(__dirname, "../.."),
  },

  async redirects() {
    return [
      { source: "/kursus", destination: "/e-course", permanent: true },
      { source: "/kursus/:path*", destination: "/checkout/:path*", permanent: true },
      // /lms index → the B2B LMS landing (/clients). The /lms/* namespace is the
      // multi-tenant LMS app, so only the exact /lms path redirects.
      { source: "/lms", destination: "/clients", permanent: false },
    ];
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:4000/api/:path*",
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            // Baseline CSP (TASK-013). `'unsafe-inline'`/`'unsafe-eval'` are required
            // by Next.js hydration + Tailwind without per-request nonces; upgrading
            // to a nonce-based policy is the P2 hardening tracked in BL-16.
            // frame-ancestors/base-uri/form-action/object-src are the safe,
            // high-value directives that block clickjacking and injection.
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Analytics (TASK-041): GA (googletagmanager) + Mixpanel (mxpnl) script origins.
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://cdn.mxpnl.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              // Analytics beacons: GA collect + Mixpanel API.
              // Also allow localhost:4000 for development (backend API direct fetch).
              `connect-src 'self' https: ${process.env.NODE_ENV === 'development' ? 'http://localhost:4000' : ''}`.trim(),
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "object-src 'none'",
            ].join("; "),
          },
        ],
      },
      {
        source: "/api/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store" },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },

  transpilePackages: ["@repo/ui"],

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**.jagoakademi.com" },
      { protocol: "https", hostname: "**.cloudflare.com" },
      { protocol: "https", hostname: "**.r2.dev" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    minimumCacheTTL: 60,
  },

  compress: true,

  poweredByHeader: false,

  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

export default nextConfig;
