import type { NextConfig } from "next";
import path from "node:path";
const loaderPath = require.resolve('orchids-visual-edits/loader.js');

const nextConfig: NextConfig = {
  experimental: {
      serverActions: {
          allowedOrigins: [
            '3000-170c73d7-e1d1-480e-a496-18cab0a1d255.orchids.cloud',
            '3000-170c73d7-e1d1-480e-a496-18cab0a1d255.proxy.daytona.works',
            '*.orchids.cloud',
            '*.proxy.daytona.works',
            'orchids.cloud',
            'proxy.daytona.works'
          ],
      },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  turbopack: {
    rules: {
      "*.{jsx,tsx}": {
        loaders: [loaderPath]
      }
    }
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
// Orchids restart: 1769629351632// Force restart Thu Jan 29 12:46:19 UTC 2026
