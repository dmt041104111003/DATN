import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@meshsdk/core",
    "@cardano-sdk/crypto",
    "libsodium-wrappers-sumo",
    "libsodium-sumo",
  ],
};

export default nextConfig;
