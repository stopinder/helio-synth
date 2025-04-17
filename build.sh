#!/bin/bash

# Clean everything
rm -rf .next
rm -rf node_modules
rm -rf package-lock.json
rm -rf .vercel
rm -rf .git
rm -rf next.config.js
rm -rf next.config.mjs

# Force Node.js version
export NODE_VERSION=18.17.0

# Install dependencies fresh
npm cache clean --force
npm install --no-package-lock --force --legacy-peer-deps

# Force Next.js version and dependencies
npm install next@14.1.0 --save-exact --force --legacy-peer-deps
npm install @next/bundle-analyzer@14.1.0 --save-exact --force --legacy-peer-deps

# Create fresh next.config.mjs with Windows-compatible paths
cat > next.config.mjs << 'EOL'
import createNextBundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = createNextBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverActions: true,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    return config;
  },
};

export default withBundleAnalyzer(nextConfig);
EOL

# Build with explicit Node.js version
NODE_ENV=production NODE_VERSION=18.17.0 next build 