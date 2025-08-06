#!/bin/sh
set -e

echo "Starting Convex development setup..."

# Install dependencies
echo "Installing dependencies..."
npm install --silent

# Check if we have a valid Convex deployment
if [ -n "$CONVEX_DEPLOYMENT" ] && [ -n "$CONVEX_URL" ]; then
    echo "Using Convex deployment: $CONVEX_DEPLOYMENT"
    echo "Convex URL: $CONVEX_URL"
    
    # Check if auth is available
    if [ -f "/root/.convex/config.json" ]; then
        echo "Found Convex authentication"
    else
        echo "================================"
        echo "Convex authentication required!"
        echo "================================"
        echo ""
        echo "To authenticate Convex:"
        echo ""
        echo "1. Run this command on your host machine:"
        echo "   npx convex login"
        echo ""
        echo "2. Then restart the Docker containers:"
        echo "   make down && make dev"
        echo ""
        echo "================================"
    fi
    
    # Run convex dev
    echo "Starting Convex dev server..."
    exec npx convex dev
else
    echo "ERROR: CONVEX_DEPLOYMENT and CONVEX_URL must be set"
    exit 1
fi