# Quick Start Guide - Local Development

## 🚀 Getting Started in 2 Minutes

### 1. Initial Setup (One time only)
```bash
# Clone and install
git clone <your-repo>
cd productivity-app
npm install

# Copy environment file
cp .env.local.example .env.local
# Edit .env.local with your Convex URL (keep DEV_MODE=true for local testing)
```

### 2. Start Development Server
```bash
# Option 1: Start everything at once
npm run dev

# Option 2: Start separately
# Terminal 1:
npx convex dev

# Terminal 2:
npm start
```

Your app is now running at http://localhost:3000 with:
- ✅ Hot reloading
- ✅ Mock data (no auth required)
- ✅ Dev tools in browser console

## 🛠️ Development Workflow

### Making UI Changes
1. Edit your components - changes appear instantly
2. Use browser DevTools (F12) for responsive testing
3. Toggle theme: `devTools.toggleTheme()` in console

### Testing Different Scenarios
```bash
# Test with production-like settings
npm run dev:prod-like

# Build and preview production build
npm run serve:preview
# Opens at http://localhost:3001
```

### Before Pushing Code
```bash
# Run all checks
npm run verify

# Or manually:
npm run typecheck
npm run lint
npm test
```

## 📱 Testing Responsive Design

### In Browser Console:
```javascript
// Test mobile view
devTools.setViewport('mobile')

// Test tablet view  
devTools.setViewport('tablet')

// Check current breakpoint
devTools.getCurrentBreakpoint()

// Toggle grid overlay (or press Ctrl+G)
document.querySelector('#grid-overlay').style.display = 'block'
```

### Chrome DevTools:
1. Press F12
2. Click device toolbar icon (Ctrl+Shift+M)
3. Select device or responsive mode

## 🚢 Deployment Workflow

### Preview Deployments (Automatic)
1. Push to any branch
2. Vercel creates preview URL automatically
3. Check PR comments for preview link

### Manual Preview
```bash
# Build and test locally first
npm run build
npm run serve:preview

# Deploy preview to Vercel
vercel

# Deploy to production
vercel --prod
```

## 🐛 Troubleshooting

### "Loading tasks..." showing?
- Check browser console for errors
- Ensure `REACT_APP_DEV_MODE=true` in .env.local
- Restart dev server

### Port 3000 already in use?
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Changes not appearing?
1. Check browser console for errors
2. Hard refresh: Ctrl+Shift+R (Cmd+Shift+R on Mac)
3. Clear cache: `devTools.clearStorage()` in console

## 📊 Performance Testing

```bash
# Check bundle size
npm run analyze

# Lighthouse audit (while app is running)
npm install -g lighthouse
lighthouse http://localhost:3000 --view
```

## 🔧 VS Code Setup

1. Install recommended extensions:
   - Open VS Code in project
   - Click "Install" on extension recommendations popup

2. Format on save is already configured

## 📚 More Resources

- Full guide: See `LOCAL_DEV_SETUP.md`
- Mock data: Edit `src/data/mockData.ts`
- Environment variables: See `.env.local.example`

---

**Pro Tips:**
- Keep browser console open for dev tools
- Use `npm run dev` to start everything at once
- Check responsive indicator in bottom-right corner
- Press Ctrl+G to toggle design grid overlay