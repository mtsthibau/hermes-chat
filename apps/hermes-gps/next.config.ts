import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@hermes/api", "@hermes/ui", "@hermes/tailwind-config"],
};

export default nextConfig;
