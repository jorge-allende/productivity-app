#!/bin/bash

echo "================================"
echo "Convex Production Deployment"
echo "================================"
echo ""
echo "This script will deploy your Convex functions to production."
echo "Production URL: https://flippant-crow-396.convex.cloud"
echo ""

# Check if we're authenticated
if ! npx convex whoami > /dev/null 2>&1; then
    echo "Error: Not authenticated with Convex"
    echo "Please run: npx convex login"
    exit 1
fi

echo "Current branch: $(git branch --show-current)"
echo ""
read -p "Are you sure you want to deploy to PRODUCTION? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Deployment cancelled"
    exit 0
fi

echo ""
echo "Deploying to production..."

# Deploy to production
CONVEX_DEPLOYMENT=prod:flippant-crow-396 npx convex deploy --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Production deployment successful!"
    echo ""
    echo "Next steps:"
    echo "1. Verify in Convex dashboard: https://dashboard.convex.dev/d/flippant-crow-396"
    echo "2. Test your production site: https://productivity-app-one-opal.vercel.app"
    echo "3. Ensure Vercel has the correct environment variables"
else
    echo ""
    echo "❌ Deployment failed!"
    echo "Please check the error messages above"
fi