#!/bin/bash

echo "🔍 Running type checks..."
npm run type-check || { echo "❌ Type check failed"; exit 1; }

echo "🧪 Running tests..."
npm run test || { echo "❌ Tests failed"; exit 1; }

echo "🧹 Cleaning up build artifacts..."
rm -rf .next
rm -rf tsconfig.tsbuildinfo

echo "📦 Installing dependencies..."
npm install || { echo "❌ Dependencies installation failed"; exit 1; }

echo "🏗️ Building project..."
npm run build || { echo "❌ Build failed"; exit 1; }

echo "🚀 Deploying to Vercel..."
git add .
git commit -m "build: production deployment $(date +%Y-%m-%d)"
git push

echo "✨ Deployment triggered! Check your Vercel dashboard for status."
echo "🌐 Dashboard URL: https://vercel.com/dashboard" 