#!/bin/bash

# VPS Build Script - Optimized for 1vCPU + 2GB RAM
# This script builds the Next.js application with memory constraints

echo "🚀 Starting VPS-optimized build..."
echo "📊 System Info:"
echo "   CPU: $(nproc) cores"
echo "   RAM: $(free -h | awk '/^Mem:/ {print $2}')"
echo ""

# Set memory limit for Node.js (1.5GB max)
export NODE_OPTIONS="--max-old-space-size=1536"

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf .next
rm -rf node_modules/.cache

# Install dependencies (production only for smaller footprint)
echo "📦 Installing dependencies..."
npm ci --production=false --prefer-offline

# Run build with progress
echo "🔨 Building application..."
npm run build

# Check build status
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Prune dev dependencies to save space
    echo "🗑️  Removing dev dependencies..."
    npm prune --production
    
    # Show build size
    echo ""
    echo "📊 Build Statistics:"
    echo "   .next size: $(du -sh .next | cut -f1)"
    echo "   node_modules size: $(du -sh node_modules | cut -f1)"
    echo ""
    echo "✨ Ready for deployment!"
else
    echo "❌ Build failed!"
    exit 1
fi
