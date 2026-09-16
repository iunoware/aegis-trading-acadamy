import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    proxyClientMaxBodySize: "2gb",
  },

  // images: {
  //   remotePatterns: [
  //     {
  //       protocol: "https",
  //       hostname: "aegis-s3-demo-bucket.s3.ap-southeast-2.amazonaws.com",
  //     },
  //   ],
  // },
};

export default nextConfig;
