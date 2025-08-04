import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // optional, remove this if you want Next.js image optimization
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
