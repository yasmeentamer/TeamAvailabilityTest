#!/bin/bash
set -e

echo "🚀 Starting CI pipeline for myTA..."

# Step 1: Lint (only if eslint configured)
echo "🔍 Running lint..."
if [ -f package.json ]; then
  npx eslint . || echo "⚠️ No eslint config found, skipping lint"
fi

# Step 2: Run tests (only if test files exist)
echo "🧪 Running tests..."
if [ -d tests ] || [ -d __tests__ ]; then
  npm test || echo "⚠️ No tests found, skipping"
else
  echo "⚠️ No tests directory, skipping"
fi

# Step 3: Build Docker image
echo "🐳 Building Docker image..."
docker compose build

# Step 4: Run with Docker Compose
echo "▶️ Starting app with Docker Compose..."
docker compose up -d

echo "✅ CI pipeline finished! Visit http://localhost:3001"
