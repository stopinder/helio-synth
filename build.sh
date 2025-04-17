#!/bin/bash

# Clean everything
rm -rf .next
rm -rf node_modules
rm -rf package-lock.json

# Install dependencies fresh
npm install --no-package-lock

# Force Next.js version
npm install next@14.1.0 --save-exact

# Build
NODE_ENV=production next build 