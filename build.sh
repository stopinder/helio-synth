#!/bin/bash

# Clean everything
rm -rf .next
rm -rf node_modules
rm -rf package-lock.json
rm -rf .vercel
rm -rf .git
rm -rf next.config.mjs

# Force Node.js version
export NODE_VERSION=18.17.0

# Install dependencies fresh
npm cache clean --force
npm install --no-package-lock --force --legacy-peer-deps

# Force Next.js version
npm install next@14.1.0 --save-exact --force --legacy-peer-deps

# Create next.config.js if it doesn't exist
if [ ! -f next.config.js ]; then
  cat > next.config.js << 'EOL'
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

module.exports = nextConfig;
EOL
fi

# Build with explicit Node.js version
NODE_ENV=production NODE_VERSION=18.17.0 next build 