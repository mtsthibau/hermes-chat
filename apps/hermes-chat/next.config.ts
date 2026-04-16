import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@hermes/api", "@hermes/ui", "@hermes/tailwind-config"],
};

export default nextConfig;
