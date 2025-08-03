#!/bin/bash

# Environment Setup Script
echo "🔧 Setting up Voxxy Presents development environment..."

# Function to copy env file if it doesn't exist
setup_env_file() {
    local env_name=$1
    local env_file=".env.$env_name"
    local example_file=".env.$env_name.example"
    
    if [ ! -f "$env_file" ]; then
        if [ -f "$example_file" ]; then
            cp "$example_file" "$env_file"
            echo "✅ Created $env_file from example"
        else
            echo "⚠️  Warning: $example_file not found"
        fi
    else
        echo "ℹ️  $env_file already exists"
    fi
}

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Set up environment files
echo "🌍 Setting up environment files..."
setup_env_file "development"
setup_env_file "staging" 
setup_env_file "production"
setup_env_file "sandbox"

# Copy development to local for immediate use
if [ ! -f ".env.local" ]; then
    cp ".env.development" ".env.local"
    echo "✅ Created .env.local from development config"
fi

# Make deployment scripts executable
echo "🔨 Making deployment scripts executable..."
chmod +x scripts/deploy-*.sh
chmod +x scripts/setup-environment.sh

# Set up git hooks (if you have them)
if [ -d ".git" ]; then
    echo "🔗 Setting up git hooks..."
    # Add any git hook setup here
fi

echo ""
echo "✅ Environment setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Review and update .env files with your specific configuration"
echo "2. Run 'npm run dev' to start development server"
echo "3. Run 'npm run seed:dev' to populate development data"
echo ""
echo "🌍 Environment files created:"
echo "  - .env.local (for immediate development)"
echo "  - .env.development (for dev environment)"
echo "  - .env.staging (for staging environment)"
echo "  - .env.production (for production environment)"  
echo "  - .env.sandbox (for experimental environment)"
echo ""
echo "🚀 Deployment commands:"
echo "  - ./scripts/deploy-staging.sh (deploy to staging)"
echo "  - ./scripts/deploy-production.sh (deploy to production)"