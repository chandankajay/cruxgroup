import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", ".prisma/client"],
  /** KYC uploads 3 files × up to 5MB; default Server Action limit is 1MB and fails before our action runs. */
  experimental: {
    serverActions: {
      bodySizeLimit: "16mb",
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
