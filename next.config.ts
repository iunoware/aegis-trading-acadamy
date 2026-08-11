import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // middlewareClientMaxBodySize: "2gb",
    proxyClientMaxBodySize: "2gb",
  },
};

export default nextConfig;
