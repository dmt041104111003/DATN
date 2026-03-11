import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      "@meshsdk/core",
      "@cardano-sdk/crypto",
      "libsodium-wrappers-sumo",
      "libsodium-sumo",
    ],
  },
};

export default nextConfig;
