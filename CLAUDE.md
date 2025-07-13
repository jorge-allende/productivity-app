# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A productivity app featuring a Kanban board and calendar integration built with React 19, TypeScript, and Convex. The app replicates a specific design reference with drag-and-drop functionality, custom theming, and real-time collaboration capabilities.

## Development Commands

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Start Convex backend (when ready for real data)
npx convex dev
```

## Tech Stack Integration

**Frontend Architecture:**
- React 19 + TypeScript with Create React App
- Zustand for client-side state management (theme persistence only)
- @dnd-kit for sophisticated drag-and-drop with collision detection
- React Router 7 for navigation between Dashboard and Calendar pages
- TailwindCSS with custom design system and class-based dark mode

**Backend Ready:**
- Convex schemas and functions defined but not yet connected to frontend
- Currently uses mock data for development; ready for seamless Convex integration

## Component Architecture

**Key Architectural Patterns:**
- Shared `Task` interface in `src/types/Task.ts` used across all components
- Layout wrapper pattern with persistent sidebar navigation
- Modal-based task creation with shared state management
- Dual data presentation: Kanban cards + Calendar indicators

**Component Hierarchy:**
```
Layout (persistent sidebar + theme)
├── Dashboard Page
│   ├── KanbanBoard (drag-and-drop container)
│   │   ├── KanbanColumn (droppable areas)
│   │   └── TaskCard (draggable items)
│   └── CalendarWidget (sidebar integration)
└── Calendar Page (full calendar view with day popups)
```

## Drag-and-Drop Implementation

Uses @dnd-kit with sophisticated reordering logic:
- `closestCorners` collision detection for smooth dropping
- Order calculation uses fractional numbers (e.g., `order + 0.5`) for insertion between items
- DragOverlay provides visual feedback during dragging
- Separate handling for column drops vs. task position drops

## State Management Strategy

**Zustand Usage:**
- Only for theme persistence (`useThemeStore`) with localStorage middleware
- Theme automatically applies/removes `dark` class on `document.documentElement`

**Local State Pattern:**
- Mock data defined in page components (Dashboard.tsx, Calendar.tsx)
- Task state managed via React useState with update functions
- No global task state - ready for Convex real-time subscriptions

## Convex Backend Design

**Schema Structure:**
- `tasks` table with status enum, priority levels, and order fields
- `comments` table linked to tasks via taskId
- `users` table for assignment functionality
- Prepared mutation functions for CRUD operations and reordering

**Integration Pattern:**
- Functions ready in `convex/tasks.ts` and `convex/comments.ts`
- Frontend components designed to easily swap mock data for `useQuery`/`useMutation` hooks
- Real-time updates will work automatically once connected

## Styling System

**TailwindCSS Configuration:**
- Custom primary color palette (blue-based)
- Class-based dark mode (`darkMode: 'class'`)
- Custom line-clamp utility for text truncation
- Design system matches provided reference screenshot

**Theming Implementation:**
- `cn()` utility combining clsx + tailwind-merge for dynamic classes
- Consistent dark/light mode support across all components
- Theme toggle in Layout header affects entire application

## Key Implementation Details

**Task Card Design:**
- Color-coded tags with user-selectable colors
- Priority indicators with predefined color mapping
- User assignment avatars with overflow handling
- Attachment and comment count indicators

**Calendar Integration:**
- Priority-based colored dots for task indicators
- Date-based task filtering with `isSameDay` from date-fns
- Click interaction opens modal with detailed task list
- Shared between widget (Dashboard) and full page (Calendar)

**Development vs. Production Data:**
- Mock data provides full feature demonstration
- Convex integration requires only updating `.env.local` and connecting hooks
- No architectural changes needed for real data integration