#!/bin/bash
# Vercel build script - handles npm install and build

set -e

echo "Installing dependencies with legacy peer deps..."
npm install --legacy-peer-deps --prefer-offline --no-fund --no-audit

echo "Building Next.js project..."
npm run build

echo "Build complete!"
