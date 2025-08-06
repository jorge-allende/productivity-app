#!/bin/bash

# Docker Development Environment Setup Script

set -e

echo "🐳 Setting up Docker development environment for Productivity App..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop first."
    echo "Visit: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose."
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

# Check for .env.local file
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "⚠️  Please edit .env.local with your Convex and Auth0 credentials"
    echo "   Required variables:"
    echo "   - REACT_APP_CONVEX_URL"
    echo "   - REACT_APP_AUTH0_DOMAIN"
    echo "   - REACT_APP_AUTH0_CLIENT_ID"
    echo "   - REACT_APP_AUTH0_AUDIENCE"
    echo "   - REACT_APP_AUTH0_REDIRECT_URI"
    echo "   - REACT_APP_AUTH0_DB_CONNECTION"
    echo ""
    read -p "Press Enter after updating .env.local to continue..."
fi

# Build Docker images
echo "🔨 Building Docker images..."
docker-compose build

# Start services
echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check service status
docker-compose ps

echo ""
echo "✅ Docker development environment is ready!"
echo ""
echo "📱 Access points:"
echo "   - React App: http://localhost:3000"
echo "   - Production Preview: http://localhost:8080 (run 'make prod' to start)"
echo ""
echo "🛠  Useful commands:"
echo "   - make dev          Start development environment"
echo "   - make logs         View container logs"
echo "   - make shell        Open shell in frontend container"
echo "   - make test         Run tests"
echo "   - make down         Stop all containers"
echo "   - make help         Show all available commands"
echo ""
echo "📚 For more information, see the Docker setup documentation."

# Make the script executable
chmod +x docker-setup.sh