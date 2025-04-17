#!/bin/bash

# Clean everything
rm -rf .next
rm -rf node_modules
rm -rf package-lock.json
rm -rf .vercel
rm -rf .git

# Force Node.js version
export NODE_VERSION=18.17.0

# Install dependencies fresh
npm install --no-package-lock --force

# Force Next.js version and dependencies
npm install next@14.1.0 --save-exact --force
npm install @next/bundle-analyzer@14.1.0 --save-exact --force

# Create fresh next.config.mjs
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
};

export default withBundleAnalyzer(nextConfig);
EOL

# Build
NODE_ENV=production next build 