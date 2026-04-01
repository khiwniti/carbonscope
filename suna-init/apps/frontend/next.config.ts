import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '../../'),
  reactStrictMode: false,
  poweredByHeader: false,
  compress: true,
  transpilePackages: ['@agentpress/shared'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Resolve workspace dependencies properly in monorepo
    config.resolve.alias = {
      ...config.resolve.alias,
      '@agentpress/shared': path.resolve(__dirname, '../../packages/shared'),
    };

    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        react: path.resolve(__dirname, '../../node_modules/react'),
        'react-dom': path.resolve(__dirname, '../../node_modules/react-dom'),
      };
    }
    return config;
  },
};

export default nextConfig;
