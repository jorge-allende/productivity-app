#!/bin/bash

echo "🚀 Setting up local development environment..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from template..."
    cp .env.local.example .env.local
    echo "⚠️  Please edit .env.local with your Convex URL"
else
    echo "✅ .env.local already exists"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

# Create necessary directories
mkdir -p .vscode
mkdir -p src/convex/_generated

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start development:"
echo "  npm run dev"
echo ""
echo "Or start services separately:"
echo "  Terminal 1: npx convex dev"
echo "  Terminal 2: npm start"
echo ""
echo "Visit http://localhost:3000 to see your app"
echo "Check the browser console for dev tools!"