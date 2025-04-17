#!/bin/bash

# Exit on error
set -e

echo "🔍 Running type checks..."
npm run type-check

echo "🧪 Running tests..."
npm run test

echo "🧹 Cleaning up build artifacts..."
rm -rf .next
rm -f tsconfig.tsbuildinfo

echo "📦 Installing dependencies..."
npm ci

echo "🏗️ Building project..."
npm run build

echo "🚀 Deploying to Vercel..."
git add .
git commit -m "build: production deployment $(date +%Y-%m-%d)"
git push

echo "✨ Deployment triggered! Check your Vercel dashboard for status."
echo "🌐 Dashboard URL: https://vercel.com/dashboard" 