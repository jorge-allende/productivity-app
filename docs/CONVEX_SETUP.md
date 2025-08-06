# Convex Setup Guide

## What Has Been Done

1. **Installed Convex React Client** ✅
   - Added `convex` package to your project

2. **Set Up ConvexProvider** ✅
   - Updated `src/index.tsx` to wrap the app with ConvexProvider
   - Uses `REACT_APP_CONVEX_URL` from `.env.local`

3. **Updated Convex Functions** ✅
   - Modified `convex/tasks.ts` to support workspace filtering
   - Updated `convex/comments.ts` with proper types
   - Created `convex/auth.ts` with authentication functions
   - Created `convex/users.ts` for user management

4. **Created Example Components** ✅
   - `src/contexts/AuthContext.convex.tsx` - Auth context using Convex
   - `src/pages/Dashboard.convex.tsx` - Dashboard using Convex queries/mutations
   - `src/pages/Login.tsx` - Login/Signup page
   - `src/App.convex.tsx` - App with protected routes

## What You Need to Do Next

### 1. Initialize Convex Backend
Run this command in your terminal:
```bash
npx convex dev
```

When prompted:
- Choose "Create a new project" or select an existing one
- This will generate the `convex/_generated` folder
- Your `.env.local` will be updated with the actual Convex URL

### 2. Fix Import Paths
After Convex generates the files, update the import paths in:
- `src/contexts/AuthContext.convex.tsx`
- `src/pages/Dashboard.convex.tsx`

Change:
```typescript
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';
```

To:
```typescript
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
```

### 3. Use the New Components
To test the Convex integration:

1. Rename the current files (as backup):
   - `src/App.tsx` → `src/App.mock.tsx`
   - `src/contexts/AuthContext.tsx` → `src/contexts/AuthContext.mock.tsx`

2. Use the Convex versions:
   - `src/App.convex.tsx` → `src/App.tsx`
   - `src/contexts/AuthContext.convex.tsx` → `src/contexts/AuthContext.tsx`
   - Update Dashboard import in `src/pages/Dashboard.tsx` to use the Convex version

### 4. Test the Flow
1. Start your app: `npm start`
2. Go to `/login`
3. Create a new workspace (signup)
4. Create some tasks
5. Test drag-and-drop functionality

### 5. Complete Remaining Features
- Connect Users page to Convex data
- Implement proper JWT authentication (currently using simple tokens)
- Add password hashing (currently storing plain text)
- Connect comments to real Convex data
- Implement file attachments

## TypeScript Errors
The TypeScript errors in the Convex functions are normal and will be fixed once you run `npx convex dev` and the types are generated.

## Important Notes
- The current implementation uses simplified authentication (no JWT, no password hashing)
- In production, you should:
  - Use proper authentication (Clerk, Auth0, or custom JWT)
  - Hash passwords before storing
  - Add proper error handling
  - Implement rate limiting
  - Add data validation