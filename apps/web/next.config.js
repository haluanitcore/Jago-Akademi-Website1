/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: "/kursus", destination: "/e-course", permanent: true },
      { source: "/kursus/:path*", destination: "/e-course/:path*", permanent: true },
    ];
  },
  transpilePackages: ["@repo/ui"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.jagoakademi.com" },
      { protocol: "https", hostname: "**.cloudflare.com" },
      { protocol: "https", hostname: "**.r2.dev" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
