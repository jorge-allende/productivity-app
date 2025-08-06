# Environment Configuration Guide

## Overview

This app uses separate Convex deployments for development and production:
- **Development**: `affable-husky-54` (https://affable-husky-54.convex.cloud)
- **Production**: `flippant-crow-396` (https://flippant-crow-396.convex.cloud)

## Local Development Setup

### 1. Environment Files

- `.env.local` - Used for local development (ignored by git)
- `.env` - Legacy file (can be removed if using .env.local)

Your `.env.local` should contain:
```bash
# Development Convex deployment
REACT_APP_CONVEX_URL=https://affable-husky-54.convex.cloud
CONVEX_DEPLOYMENT=dev:affable-husky-54
CONVEX_URL=https://affable-husky-54.convex.cloud

# Auth0 Configuration
REACT_APP_AUTH0_DOMAIN=dev-1jkc3h5f7fndyudn.us.auth0.com
REACT_APP_AUTH0_CLIENT_ID=G46sqObSi0h8D98XsUGgtNXkghIlft2P
REACT_APP_AUTH0_AUDIENCE=https://productivity-app-one-opal.vercel.app/api
REACT_APP_AUTH0_REDIRECT_URI=http://localhost:3000/callback
REACT_APP_AUTH0_DB_CONNECTION=Username-Password-Authentication

# Development flags
REACT_APP_BYPASS_AUTH=true
REACT_APP_DEV_MODE=true
```

### 2. Docker Development

Docker automatically uses `.env.local` and is isolated to development:
```bash
make dev  # Starts development environment
```

## Production Setup (Vercel)

### 1. Environment Variables in Vercel

Go to your Vercel project settings and set these environment variables:

```bash
# Production Convex deployment
REACT_APP_CONVEX_URL=https://flippant-crow-396.convex.cloud

# Auth0 Configuration (production values)
REACT_APP_AUTH0_DOMAIN=dev-1jkc3h5f7fndyudn.us.auth0.com
REACT_APP_AUTH0_CLIENT_ID=G46sqObSi0h8D98XsUGgtNXkghIlft2P
REACT_APP_AUTH0_AUDIENCE=https://productivity-app-one-opal.vercel.app/api
REACT_APP_AUTH0_REDIRECT_URI=https://productivity-app-one-opal.vercel.app/callback
REACT_APP_AUTH0_DB_CONNECTION=Username-Password-Authentication

# Production flags
REACT_APP_BYPASS_AUTH=false
REACT_APP_DEV_MODE=false
```

### 2. Deploy to Production Convex

To deploy functions to production:
```bash
npx convex deploy --prod
```

## Important Notes

1. **Never commit `.env.local`** - It contains development secrets
2. **Docker isolation** - Docker only reads `.env.local`, ensuring it never affects production
3. **Production deployment** - Always use `npx convex deploy --prod` for production updates
4. **Environment validation** - The app shows connection status in the UI

## Troubleshooting

### Issue: Production using wrong Convex deployment
1. Check Vercel environment variables
2. Ensure `REACT_APP_CONVEX_URL` is set to production URL
3. Redeploy on Vercel after changing environment variables

### Issue: Tasks not saving in production
1. Verify production Convex URL in Vercel
2. Run `npx convex deploy --prod` to sync functions
3. Check Convex dashboard for production deployment status