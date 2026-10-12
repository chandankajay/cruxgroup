import type { NextConfig } from "next";

function securityHeaders(): { key: string; value: string }[] {
  return [
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=()",
    },
  ];
}

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  serverExternalPackages: ["@prisma/client", ".prisma/client"],
  async redirects() {
    return [
      {
        source: "/:locale(en|te)/services/ground-levelling",
        destination: "/:locale/services/land-levelling",
        permanent: true,
      },
      {
        source: "/:locale(en|te)/services/compound-fence",
        destination: "/:locale/services/compound-fencing",
        permanent: true,
      },
      {
        source: "/:locale(en|te)/services/debris-clearing",
        destination: "/:locale/services/debris-rock-breaking",
        permanent: true,
      },
      {
        source: "/:locale(en|te)/services/silent-rock-breaking",
        destination: "/:locale/services/debris-rock-breaking",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders(),
      },
    ];
  },
  images: {
    // In dev, default image cache is very long; local `/public` swaps look "stuck" until cache clears.
    ...(process.env["NODE_ENV"] === "development" ? { minimumCacheTTL: 0 } : {}),
    remotePatterns: [
      { protocol: "https", hostname: "img1.wsimg.com", pathname: "/**" },
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
      { protocol: "https", hostname: "cdn.cruxgroup.in", pathname: "/**" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;
