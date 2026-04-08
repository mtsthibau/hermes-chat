import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@platform/ui", "@platform/utils"],
};

export default nextConfig;
