import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure @sparticuz/chromium is included in serverless bundle
  experimental: {
    serverComponentsExternalPackages: ["@sparticuz/chromium"],
  },
};

export default nextConfig;
