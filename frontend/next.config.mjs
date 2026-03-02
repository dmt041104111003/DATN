/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
  images: {
    qualities: [75, 90],
  },
  webpack: (config, { isServer }) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };
    config.module.rules.push({
      test: /\.json$/,
      type: 'json',
    });
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource',
    });
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    } else if (config.resolve.fallback) {
      delete config.resolve.fallback.fs;
      delete config.resolve.fallback.net;
      delete config.resolve.fallback.tls;
    }
    return config;
  },
};

export default nextConfig;
