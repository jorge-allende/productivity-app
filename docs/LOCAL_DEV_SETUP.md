# Local Development Environment Setup Guide

This guide will help you set up a professional local development environment that mirrors production, with hot reloading, staging environments, and proper testing tools.

## Table of Contents
1. [Current Setup Overview](#current-setup-overview)
2. [Local Development Server](#local-development-server)
3. [Hot Reloading Configuration](#hot-reloading-configuration)
4. [Staging & Preview Deployments](#staging--preview-deployments)
5. [Testing Tools & Workflows](#testing-tools--workflows)
6. [Realistic Data Testing](#realistic-data-testing)
7. [Development Workflow](#development-workflow)

---

## 1. Current Setup Overview

Your app is built with:
- React 19 + TypeScript
- Convex for backend
- TailwindCSS for styling
- Auth0 for authentication
- Vercel for production hosting

## 2. Local Development Server

### Initial Setup

```bash
# Install dependencies
npm install

# Create environment files
cp .env.local.example .env.local
cp .env.local .env.development.local
```

### Environment Configuration

Create `.env.local.example` for team members:
```env
# Convex Configuration
REACT_APP_CONVEX_URL=your_convex_url_here

# Auth0 Configuration
REACT_APP_AUTH0_DOMAIN=your_auth0_domain
REACT_APP_AUTH0_CLIENT_ID=your_client_id
REACT_APP_AUTH0_AUDIENCE=your_audience

# Development Mode
REACT_APP_DEV_MODE=true
REACT_APP_BYPASS_AUTH=true
```

### Running the Development Server

```bash
# Start Convex backend (in one terminal)
npx convex dev

# Start React app (in another terminal)
npm start
```

The app will run at `http://localhost:3000` with:
- Hot reloading enabled
- Mock data in dev mode
- Auth bypass for easier testing

## 3. Hot Reloading Configuration

Hot reloading is already enabled with Create React App. To enhance it:

### VS Code Settings
Create `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

### Browser DevTools
1. Install React Developer Tools extension
2. Enable "Fast Refresh" in React DevTools
3. Use Chrome DevTools for:
   - Device emulation
   - Network throttling
   - Performance profiling

## 4. Staging & Preview Deployments

### Option 1: Vercel Preview Deployments (Recommended)

1. **Connect GitHub to Vercel**:
   ```bash
   npm i -g vercel
   vercel login
   vercel link
   ```

2. **Configure `vercel.json`**:
   ```json
   {
     "env": {
       "REACT_APP_CONVEX_URL": "@convex-url",
       "REACT_APP_AUTH0_DOMAIN": "@auth0-domain",
       "REACT_APP_AUTH0_CLIENT_ID": "@auth0-client-id"
     },
     "build": {
       "env": {
         "REACT_APP_DEV_MODE": "false",
         "REACT_APP_BYPASS_AUTH": "false"
       }
     }
   }
   ```

3. **Automatic Preview URLs**:
   - Every push to a branch creates a preview URL
   - Comments on PRs with preview links
   - Environment variables per branch

### Option 2: Local Staging Environment

Create `package.json` scripts:
```json
{
  "scripts": {
    "start": "react-scripts start",
    "start:staging": "REACT_APP_ENV=staging react-scripts start",
    "build:staging": "REACT_APP_ENV=staging react-scripts build",
    "serve:staging": "serve -s build -l 3001"
  }
}
```

### Option 3: Docker Setup

Create `Dockerfile.dev`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

And `docker-compose.yml`:
```yaml
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - CHOKIDAR_USEPOLLING=true
```

## 5. Testing Tools & Workflows

### Responsive Design Testing

1. **Browser DevTools**:
   ```javascript
   // Add to src/utils/devTools.ts
   export const deviceSizes = {
     mobile: '375px',
     tablet: '768px',
     desktop: '1024px',
     wide: '1440px'
   };
   ```

2. **Responsive Viewer Extension**:
   - Install "Responsive Viewer" Chrome extension
   - Test multiple viewports simultaneously

3. **BrowserStack Local** (for cross-browser testing):
   ```bash
   npm install -g browserstack-local
   BrowserStackLocal --key YOUR_ACCESS_KEY
   ```

### Visual Regression Testing

Install and configure:
```bash
npm install --save-dev @playwright/test
```

Create `playwright.config.ts`:
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],
});
```

### Performance Testing

Add to `package.json`:
```json
{
  "scripts": {
    "analyze": "source-map-explorer 'build/static/js/*.js'",
    "lighthouse": "lighthouse http://localhost:3000 --view"
  }
}
```

## 6. Realistic Data Testing

### Enhanced Mock Data System

Your `src/data/mockData.ts` already provides realistic data. To enhance it:

1. **Dynamic Data Generation**:
   ```typescript
   // src/data/mockDataGenerator.ts
   import { faker } from '@faker-js/faker';
   
   export const generateTasks = (count: number) => {
     return Array.from({ length: count }, (_, i) => ({
       _id: `task_${i}`,
       title: faker.hacker.phrase(),
       description: faker.lorem.paragraph(),
       // ... more fields
     }));
   };
   ```

2. **Scenario Testing**:
   ```typescript
   // src/data/testScenarios.ts
   export const scenarios = {
     empty: { tasks: [] },
     minimal: { tasks: mockTasks.slice(0, 3) },
     normal: { tasks: mockTasks },
     stress: { tasks: generateTasks(500) }
   };
   ```

3. **User Simulation**:
   ```typescript
   // src/utils/devSimulation.ts
   export const simulateUserActivity = () => {
     if (process.env.REACT_APP_DEV_MODE === 'true') {
       setInterval(() => {
         // Simulate task updates
         console.log('Simulating user activity...');
       }, 5000);
     }
   };
   ```

## 7. Development Workflow

### Recommended Git Workflow

1. **Feature Branch Development**:
   ```bash
   # Create feature branch
   git checkout -b feature/new-ui-component
   
   # Make changes with hot reload
   # Test locally at localhost:3000
   
   # Push for preview deployment
   git push origin feature/new-ui-component
   ```

2. **Pre-commit Hooks**:
   ```bash
   npm install --save-dev husky lint-staged
   npx husky install
   ```

   Add to `package.json`:
   ```json
   {
     "lint-staged": {
       "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
       "*.{css,scss}": ["prettier --write"]
     }
   }
   ```

3. **Testing Checklist**:
   ```markdown
   - [ ] Desktop (Chrome, Firefox, Safari)
   - [ ] Tablet (iPad, Android Tablet)
   - [ ] Mobile (iPhone, Android)
   - [ ] Dark/Light theme
   - [ ] Different data scenarios
   - [ ] Performance (Lighthouse score > 90)
   ```

### VS Code Extensions for Better DX

1. **Essential Extensions**:
   - ESLint
   - Prettier
   - Tailwind CSS IntelliSense
   - React Snippets
   - GitLens

2. **Recommended Extensions**:
   - Thunder Client (API testing)
   - Live Share (pair programming)
   - Error Lens (inline errors)
   - TODO Highlight

### Development Scripts

Add these helpful scripts to `package.json`:
```json
{
  "scripts": {
    "dev": "concurrently \"npx convex dev\" \"npm start\"",
    "dev:staging": "REACT_APP_ENV=staging npm run dev",
    "test:ui": "playwright test",
    "test:responsive": "playwright test --project='Mobile Chrome' --project='Mobile Safari'",
    "bundle-analyze": "npm run build && npm run analyze",
    "clean": "rm -rf node_modules build && npm install"
  }
}
```

### Quick Commands Cheatsheet

```bash
# Start development
npm run dev

# Test specific viewport
npm start -- --viewport=mobile

# Run visual tests
npm run test:ui

# Check bundle size
npm run bundle-analyze

# Clean install
npm run clean
```

## Troubleshooting

### Common Issues

1. **Port already in use**:
   ```bash
   lsof -ti:3000 | xargs kill -9
   ```

2. **Hot reload not working**:
   - Check `CHOKIDAR_USEPOLLING=true` in .env
   - Restart VS Code
   - Clear browser cache

3. **Convex connection issues**:
   - Run `npx convex dev --once` to reinitialize
   - Check network tab for WebSocket errors

---

## Next Steps

1. Set up Vercel preview deployments
2. Install recommended VS Code extensions
3. Configure pre-commit hooks
4. Test the complete workflow with a sample feature

This setup will dramatically improve your development efficiency by allowing you to:
- See changes instantly with hot reload
- Test on multiple devices/browsers locally
- Get automatic preview URLs for branches
- Work with realistic data
- Catch issues before production