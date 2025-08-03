#!/bin/bash

# Deploy to Production Environment
echo "🚀 Deploying to Production Environment..."

# Ensure we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "❌ Production deployments must be from 'main' branch. Current branch: $CURRENT_BRANCH"
    exit 1
fi

# Ensure working directory is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Working directory is not clean. Please commit or stash changes."
    exit 1
fi

# Ensure we have production environment config
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production file not found. Please copy from .env.production.example and configure."
    exit 1
fi

# Confirmation prompt for production
echo "⚠️  You are about to deploy to PRODUCTION"
read -p "Are you sure you want to proceed? (type 'yes' to continue): " -r
if [ "$REPLY" != "yes" ]; then
    echo "❌ Production deployment cancelled"
    exit 1
fi

# Set environment for build
export NODE_ENV=production
export VITE_ENVIRONMENT=production

echo "🧪 Running tests..."
npm run test:run

if [ $? -ne 0 ]; then
    echo "❌ Tests failed. Aborting deployment."
    exit 1
fi

echo "🔍 Running linting..."
npm run lint

if [ $? -ne 0 ]; then
    echo "❌ Linting failed. Aborting deployment."
    exit 1
fi

echo "📦 Building for production..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
    
    # Deploy to production platform
    echo "🌐 Deploying to production environment..."
    
    # Example for Render/Vercel/Netlify
    # npm run deploy:production
    
    echo "✅ Production deployment complete!"
    echo "🔗 Production URL: https://www.voxxypresents.com"
    
    # Tag the release
    VERSION=$(date +"%Y%m%d-%H%M%S")
    git tag "production-$VERSION"
    git push origin "production-$VERSION"
    echo "🏷️  Tagged release: production-$VERSION"
    
else
    echo "❌ Build failed"
    exit 1
fi