#!/bin/bash

# Deploy to Staging Environment
echo "🚀 Deploying to Staging Environment..."

# Check if we're on the right branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "staging" ]; then
    echo "⚠️  Warning: You're not on the staging branch. Current branch: $CURRENT_BRANCH"
    read -p "Continue with deployment? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelled"
        exit 1
    fi
fi

# Ensure we have staging environment config
if [ ! -f ".env.staging" ]; then
    echo "❌ .env.staging file not found. Please copy from .env.staging.example and configure."
    exit 1
fi

# Set environment for build
export NODE_ENV=staging
export VITE_ENVIRONMENT=staging

echo "📦 Building for staging..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
    
    # Deploy to staging platform (adjust based on your hosting)
    echo "🌐 Deploying to staging environment..."
    
    # Example for Render/Vercel/Netlify
    # npm run deploy:staging
    
    echo "✅ Staging deployment complete!"
    echo "🔗 Staging URL: https://staging.voxxypresents.com"
else
    echo "❌ Build failed"
    exit 1
fi