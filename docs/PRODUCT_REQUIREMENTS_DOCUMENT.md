# Product Requirements Document (PRD)
# Productivity App - Next Development Phase

## Executive Summary

This document outlines the comprehensive product requirements for the next development phase of the React 19 + TypeScript + Convex productivity application. The app currently features a functional Kanban board with drag-and-drop capabilities, calendar integration, and real-time data synchronization through Convex. This PRD defines the roadmap for transforming the current MVP into a professional-grade productivity platform.

### Document Structure
1. Current State Analysis
2. Feature Roadmap
3. UI/UX Component Tree
4. Convex Integration Plan
5. Performance Optimization Strategy
6. Sub-Agent Implementation Guide
7. Technical Specifications
8. Success Metrics

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Feature Roadmap](#feature-roadmap)
3. [UI/UX Component Tree](#uiux-component-tree)
4. [Convex Integration Plan](#convex-integration-plan)
5. [Performance Optimization Strategy](#performance-optimization-strategy)
6. [Sub-Agent Implementation Guide](#sub-agent-implementation-guide)
7. [Technical Specifications](#technical-specifications)
8. [Implementation Timeline](#implementation-timeline)
9. [Success Metrics](#success-metrics)
10. [Risk Management](#risk-management)

---

## 1. Current State Analysis

### 1.1 Architecture Overview

**Frontend Stack:**
- React 19.1.0 with TypeScript 4.9.5
- Create React App build system
- @dnd-kit for drag-and-drop functionality
- Zustand for theme persistence
- TailwindCSS for styling
- React Router 6 for navigation
- Auth0 for authentication

**Backend Stack:**
- Convex for real-time database and serverless functions
- Schema-driven development with TypeScript
- Real-time subscriptions for live updates
- Workspace-based multi-tenancy

**Current Features:**
1. **Authentication & Authorization**
   - Auth0 integration with email/password and social login
   - Workspace creation on signup
   - Protected routes and role-based access (Admin/Manager)

2. **Task Management**
   - CRUD operations for tasks
   - Drag-and-drop between columns
   - Priority levels (low/medium/high)
   - Tag system with custom colors
   - Due dates and assignments
   - Attachment support (metadata only)

3. **Views & Navigation**
   - Kanban board view
   - Calendar view with month/agenda modes
   - Dashboard with calendar widget
   - Settings page (UI only)
   - Users management page

4. **UI/UX Features**
   - Dark/light theme toggle
   - Responsive layout (partial)
   - Custom modals for task creation/editing
   - Basic filtering on calendar view

### 1.2 Current Limitations & Gaps

**Technical Debt:**
1. **UI Component Quality**
   - No professional UI component library (shadcn/ui not installed)
   - Basic modal implementations without proper accessibility
   - No loading states or skeleton screens
   - Missing toast notifications for user feedback
   - No keyboard navigation support

2. **Feature Gaps**
   - Comments system not exposed in UI
   - No real-time collaboration indicators
   - Search functionality missing
   - No command palette or keyboard shortcuts
   - Settings page non-functional
   - No analytics or reporting
   - Limited mobile responsiveness
   - No onboarding flow

3. **Performance Issues**
   - No virtualization for large task lists
   - Unoptimized re-renders during drag operations
   - No code splitting
   - Missing optimistic updates for some mutations
   - No offline support

4. **Integration Gaps**
   - File uploads not implemented
   - No email notifications
   - No webhook integrations
   - No API for external access
   - No export functionality

### 1.3 Code Quality Assessment

**Strengths:**
- Clean component architecture
- Proper TypeScript typing
- Consistent code style
- Good separation of concerns
- Convex integration properly structured

**Areas for Improvement:**
- Limited test coverage
- No E2E tests
- Missing error boundaries
- Insufficient logging and monitoring
- No performance monitoring

---

## 2. Feature Roadmap

### Phase 1: UI/UX Enhancement (Weeks 1-3)

#### 2.1.1 shadcn/ui Component Integration
**Priority: Critical**
**Components to Install:**
```bash
bunx shadcn-ui@latest add dialog
bunx shadcn-ui@latest add dropdown-menu
bunx shadcn-ui@latest add toast
bunx shadcn-ui@latest add command
bunx shadcn-ui@latest add popover
bunx shadcn-ui@latest add sheet
bunx shadcn-ui@latest add badge
bunx shadcn-ui@latest add tooltip
bunx shadcn-ui@latest add avatar
bunx shadcn-ui@latest add calendar
bunx shadcn-ui@latest add skeleton
bunx shadcn-ui@latest add alert-dialog
bunx shadcn-ui@latest add context-menu
bunx shadcn-ui@latest add select
bunx shadcn-ui@latest add tabs
bunx shadcn-ui@latest add textarea
bunx shadcn-ui@latest add switch
bunx shadcn-ui@latest add slider
bunx shadcn-ui@latest add progress
```

#### 2.1.2 Component Replacements
1. **Task Modals → shadcn Dialog**
   - Replace TaskModal with Dialog component
   - Add proper focus management
   - Implement keyboard shortcuts (Esc to close)
   - Add animation transitions

2. **Notifications → Toast System**
   - Implement toast provider
   - Success/error/warning/info variants
   - Auto-dismiss with action buttons
   - Queue management for multiple toasts

3. **Task Actions → Dropdown Menu**
   - Context menus for task cards
   - Bulk action menus
   - User profile dropdown
   - Column action menus

4. **Global Search → Command Palette**
   - Cmd/Ctrl+K activation
   - Fuzzy search across tasks
   - Quick actions (create task, navigate)
   - Recent items section

#### 2.1.3 New UI Features
1. **Loading States**
   - Skeleton loaders for initial data fetch
   - Optimistic UI updates
   - Progress indicators for long operations
   - Shimmer effects for cards

2. **Empty States**
   - Illustrated empty states for columns
   - Onboarding prompts
   - Action buttons to create first items
   - Tips and suggestions

3. **Mobile Responsive Design**
   - Sheet component for mobile navigation
   - Touch-optimized task cards
   - Swipe gestures for task actions
   - Responsive grid layouts

### Phase 2: Collaboration Features (Weeks 4-6)

#### 2.2.1 Comments System
**Implementation Requirements:**
1. **UI Components**
   - Comment thread in task detail view
   - Real-time comment updates
   - Mention system with @ notation
   - Edit/delete comment functionality
   - Rich text editor (markdown support)

2. **Backend Integration**
   - Connect to existing comments table
   - Real-time subscriptions
   - Mention notifications
   - Comment activity feed

#### 2.2.2 Real-time Collaboration
1. **Presence System**
   - Show active users in workspace
   - Cursor tracking on Kanban board
   - "User is typing" indicators
   - Live task lock when editing

2. **Activity Feed**
   - Workspace activity timeline
   - Task change history
   - User action logs
   - Filter by user/task/date

3. **Notifications**
   - In-app notification center
   - Email notifications (via webhook)
   - Push notifications (PWA)
   - Notification preferences

### Phase 3: Advanced Task Management (Weeks 7-9)

#### 2.3.1 Task Dependencies
1. **Dependency Types**
   - Blocks/blocked by relationships
   - Parent/child tasks (subtasks)
   - Related tasks linking
   - Milestone dependencies

2. **Visualization**
   - Dependency indicators on cards
   - Gantt chart view
   - Critical path highlighting
   - Dependency validation

#### 2.3.2 Advanced Filtering & Views
1. **Smart Filters**
   - Save custom filter combinations
   - Quick filter presets
   - Advanced query builder
   - Filter sharing across team

2. **Custom Views**
   - Table view with inline editing
   - Timeline/Gantt view
   - List view with grouping
   - Board view customization

3. **Saved Views**
   - Personal view preferences
   - Shared team views
   - Default view per user
   - View templates

#### 2.3.3 Automation & Templates
1. **Task Templates**
   - Create from existing tasks
   - Template library
   - Variable substitution
   - Recurring task patterns

2. **Workflow Automation**
   - Auto-assign based on rules
   - Status change triggers
   - Due date automation
   - Notification rules

### Phase 4: Analytics & Reporting (Weeks 10-11)

#### 2.4.1 Dashboard Analytics
1. **Key Metrics**
   - Task completion rate
   - Average cycle time
   - Team velocity
   - Workload distribution

2. **Visualizations**
   - Chart.js integration
   - Interactive charts
   - Real-time updates
   - Export capabilities

#### 2.4.2 Reports
1. **Standard Reports**
   - Sprint/period summaries
   - User productivity reports
   - Project status reports
   - Time tracking reports

2. **Custom Reports**
   - Report builder interface
   - Scheduled reports
   - Email delivery
   - PDF/CSV export

### Phase 5: Integrations & API (Weeks 12-13)

#### 2.5.1 Third-party Integrations
1. **Communication Tools**
   - Slack notifications
   - Microsoft Teams
   - Discord webhooks
   - Email integration

2. **Development Tools**
   - GitHub integration
   - GitLab integration
   - Jira import/export
   - Linear migration

3. **File Storage**
   - Google Drive
   - Dropbox
   - OneDrive
   - S3 compatible

#### 2.5.2 Public API
1. **REST API**
   - OAuth2 authentication
   - Rate limiting
   - Webhook management
   - API documentation

2. **GraphQL API**
   - Schema definition
   - Subscription support
   - Batch operations
   - API playground

### Phase 6: Performance & Scale (Weeks 14-15)

#### 2.6.1 Performance Optimizations
1. **Frontend Optimizations**
   - React.lazy code splitting
   - Virtual scrolling
   - Image lazy loading
   - Bundle size optimization

2. **Data Management**
   - Pagination strategies
   - Cursor-based pagination
   - Incremental data loading
   - Cache management

#### 2.6.2 Offline Support
1. **PWA Features**
   - Service worker
   - Offline task creation
   - Sync on reconnect
   - Conflict resolution

2. **Local Storage**
   - IndexedDB integration
   - Optimistic updates
   - Queue management
   - Data compression

---

## 3. UI/UX Component Tree

### 3.1 Component Architecture

```
App
├── Providers
│   ├── ConvexProvider
│   ├── AuthProvider
│   ├── WorkspaceProvider
│   ├── ThemeProvider
│   └── ToastProvider (new)
│
├── Layout
│   ├── Header
│   │   ├── Logo
│   │   ├── WorkspaceSelector (new)
│   │   ├── GlobalSearch (new)
│   │   ├── NotificationBell (new)
│   │   ├── UserMenu
│   │   └── ThemeToggle
│   │
│   ├── Sidebar
│   │   ├── Navigation
│   │   ├── WorkspaceInfo (new)
│   │   ├── QuickActions (new)
│   │   └── CalendarWidget
│   │
│   └── MainContent
│       ├── Breadcrumbs (new)
│       ├── PageHeader (new)
│       └── {children}
│
├── Pages
│   ├── Dashboard
│   │   ├── KanbanBoard
│   │   │   ├── BoardHeader
│   │   │   ├── BoardFilters (new)
│   │   │   ├── BoardActions (new)
│   │   │   └── Columns[]
│   │   │       ├── ColumnHeader
│   │   │       ├── TaskCards[]
│   │   │       └── AddTaskButton
│   │   │
│   │   └── DashboardWidgets (new)
│   │       ├── StatsCards
│   │       ├── ActivityFeed
│   │       └── UpcomingTasks
│   │
│   ├── Calendar
│   │   ├── CalendarHeader
│   │   ├── CalendarFilters
│   │   ├── ViewToggle
│   │   ├── MonthView
│   │   ├── WeekView (new)
│   │   ├── DayView (new)
│   │   └── AgendaView
│   │
│   ├── Tasks (new)
│   │   ├── TaskTable
│   │   ├── TaskFilters
│   │   ├── BulkActions
│   │   └── TaskDetail
│   │
│   ├── Analytics (new)
│   │   ├── MetricsOverview
│   │   ├── Charts
│   │   ├── Reports
│   │   └── Export
│   │
│   ├── Settings
│   │   ├── SettingsSidebar
│   │   └── SettingsPanels
│   │       ├── ProfileSettings
│   │       ├── NotificationSettings
│   │       ├── SecuritySettings
│   │       ├── IntegrationSettings
│   │       └── WorkspaceSettings
│   │
│   └── Users
│       ├── UsersList
│       ├── UserInvite
│       ├── RoleManagement
│       └── UserActivity
│
└── Components
    ├── ui (shadcn)
    │   ├── dialog
    │   ├── dropdown-menu
    │   ├── command
    │   ├── toast
    │   ├── sheet
    │   ├── popover
    │   ├── tooltip
    │   ├── badge
    │   ├── avatar
    │   ├── skeleton
    │   └── [more components]
    │
    ├── task
    │   ├── TaskCard
    │   ├── TaskDetail
    │   ├── TaskForm
    │   ├── TaskComments (new)
    │   ├── TaskActivity (new)
    │   ├── TaskDependencies (new)
    │   └── TaskAttachments (new)
    │
    ├── common
    │   ├── EmptyState (new)
    │   ├── ErrorBoundary (new)
    │   ├── LoadingSpinner
    │   ├── ConfirmDialog (new)
    │   ├── SearchInput (new)
    │   └── DataTable (new)
    │
    └── charts (new)
        ├── BarChart
        ├── LineChart
        ├── PieChart
        └── GanttChart
```

### 3.2 shadcn/ui Component Mapping

#### 3.2.1 Core UI Replacements

| Current Component | shadcn/ui Replacement | Features Added |
|------------------|----------------------|----------------|
| TaskModal | Dialog + Form | Keyboard navigation, focus trap, animations |
| Custom dropdowns | DropdownMenu | Keyboard support, sub-menus, icons |
| Alert messages | Toast | Queue system, actions, variants |
| Basic inputs | Input + Label | Validation states, helper text |
| Task badges | Badge | Variants, sizes, removable |
| User avatars | Avatar | Fallbacks, groups, status indicators |
| Loading states | Skeleton | Shimmer effect, shapes |
| Date inputs | Calendar + Popover | Date ranges, presets |
| Tooltips | Tooltip | Delayed show, arrow positioning |
| Mobile menu | Sheet | Swipe gestures, positions |

#### 3.2.2 New Complex Components

**1. Command Palette**
```typescript
// Implementation using shadcn Command
interface CommandPaletteProps {
  onTaskCreate: () => void;
  onTaskSearch: (query: string) => void;
  onNavigate: (path: string) => void;
  recentTasks: Task[];
}

Features:
- Fuzzy search
- Grouped results
- Keyboard shortcuts display
- Recent items section
- Quick actions
```

**2. Data Table**
```typescript
// Implementation using shadcn Table + tanstack-table
interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  pagination?: boolean;
  sorting?: boolean;
  filtering?: boolean;
  selection?: boolean;
}

Features:
- Column sorting
- Row selection
- Pagination
- Column visibility
- Export functionality
```

**3. Task Comments Thread**
```typescript
// Custom implementation with shadcn components
interface CommentThreadProps {
  taskId: string;
  comments: Comment[];
  onCommentAdd: (text: string) => void;
  onCommentEdit: (id: string, text: string) => void;
  onCommentDelete: (id: string) => void;
}

Features:
- Nested replies
- Markdown support
- Mention autocomplete
- Edit history
- Real-time updates
```

### 3.3 Design System Specifications

#### 3.3.1 Color Palette
```css
/* Extending current theme with semantic colors */
:root {
  /* Status Colors */
  --color-status-todo: 220 13% 69%;
  --color-status-progress: 217 91% 60%;
  --color-status-done: 142 71% 45%;
  --color-status-blocked: 0 84% 60%;
  
  /* Priority Colors */
  --color-priority-low: 142 71% 45%;
  --color-priority-medium: 38 92% 50%;
  --color-priority-high: 0 84% 60%;
  --color-priority-urgent: 346 87% 43%;
  
  /* Semantic Colors */
  --color-success: 142 71% 45%;
  --color-warning: 38 92% 50%;
  --color-error: 0 84% 60%;
  --color-info: 217 91% 60%;
}
```

#### 3.3.2 Typography Scale
```css
/* Consistent typography system */
.text-xs { font-size: 0.75rem; line-height: 1rem; }
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }
.text-base { font-size: 1rem; line-height: 1.5rem; }
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }
.text-2xl { font-size: 1.5rem; line-height: 2rem; }
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
```

#### 3.3.3 Spacing System
```css
/* 4px base unit spacing */
--spacing-1: 0.25rem; /* 4px */
--spacing-2: 0.5rem;  /* 8px */
--spacing-3: 0.75rem; /* 12px */
--spacing-4: 1rem;    /* 16px */
--spacing-5: 1.25rem; /* 20px */
--spacing-6: 1.5rem;  /* 24px */
--spacing-8: 2rem;    /* 32px */
--spacing-10: 2.5rem; /* 40px */
--spacing-12: 3rem;   /* 48px */
--spacing-16: 4rem;   /* 64px */
```

### 3.4 Responsive Design Strategy

#### 3.4.1 Breakpoints
```typescript
const breakpoints = {
  xs: '475px',   // Mobile portrait
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet portrait
  lg: '1024px',  // Tablet landscape / Small desktop
  xl: '1280px',  // Desktop
  '2xl': '1536px' // Large desktop
};
```

#### 3.4.2 Mobile-First Components

**1. Responsive Navigation**
```typescript
// Desktop: Sidebar
// Tablet: Collapsible sidebar
// Mobile: Sheet drawer

const Navigation = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  if (isMobile) {
    return <Sheet>...</Sheet>;
  }
  
  return <Sidebar>...</Sidebar>;
};
```

**2. Responsive Task Views**
```typescript
// Desktop: Kanban columns
// Tablet: Horizontal scroll
// Mobile: Stacked cards with swipe

const TaskView = () => {
  const viewport = useViewport();
  
  switch(viewport) {
    case 'mobile':
      return <StackedCards />;
    case 'tablet':
      return <ScrollableKanban />;
    default:
      return <StandardKanban />;
  }
};
```

### 3.5 Accessibility Requirements

#### 3.5.1 WCAG 2.1 AA Compliance
1. **Color Contrast**
   - Text: 4.5:1 minimum
   - Large text: 3:1 minimum
   - Interactive elements: 3:1 minimum

2. **Keyboard Navigation**
   - All interactive elements focusable
   - Visible focus indicators
   - Logical tab order
   - Skip links

3. **Screen Reader Support**
   - Semantic HTML
   - ARIA labels
   - Live regions for updates
   - Descriptive link text

#### 3.5.2 Component Accessibility

**1. Task Card**
```typescript
<article
  role="article"
  aria-label={`Task: ${task.title}`}
  tabIndex={0}
  onKeyDown={handleKeyboardInteraction}
>
  <h3 id={`task-${task.id}-title`}>{task.title}</h3>
  <div aria-describedby={`task-${task.id}-title`}>
    {/* Task content */}
  </div>
</article>
```

**2. Drag and Drop**
```typescript
// Keyboard alternatives for all drag operations
const handleKeyboardDrag = (e: KeyboardEvent) => {
  switch(e.key) {
    case 'Space':
      startDrag();
      break;
    case 'ArrowUp':
    case 'ArrowDown':
      navigateTasks(e.key);
      break;
    case 'Enter':
      dropTask();
      break;
  }
};
```

---

## 4. Convex Integration Plan

### 4.1 Current Integration Status

#### 4.1.1 Implemented Features
- Basic CRUD operations for tasks
- Real-time updates via subscriptions
- Workspace-based data isolation
- User authentication sync with Auth0
- Comment storage structure

#### 4.1.2 Migration Completed
- Dashboard page using Convex queries
- Calendar page with live data
- Task mutations (create, update, reorder)
- User and workspace management

### 4.2 Enhanced Convex Integration

#### 4.2.1 Optimistic Updates Implementation

**1. Task Mutations with Optimistic UI**
```typescript
// Enhanced task update with optimistic updates
const useOptimisticTaskUpdate = () => {
  const updateTask = useMutation(api.tasks.updateTask);
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updates: TaskUpdate) => {
      return updateTask(updates);
    },
    onMutate: async (updates) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries(['tasks']);
      
      // Snapshot previous value
      const previousTasks = queryClient.getQueryData(['tasks']);
      
      // Optimistically update
      queryClient.setQueryData(['tasks'], (old) => {
        return updateTaskInList(old, updates);
      });
      
      return { previousTasks };
    },
    onError: (err, updates, context) => {
      // Rollback on error
      queryClient.setQueryData(['tasks'], context.previousTasks);
      toast.error('Failed to update task');
    },
    onSettled: () => {
      // Refetch after error or success
      queryClient.invalidateQueries(['tasks']);
    }
  });
};
```

**2. Bulk Operations**
```typescript
// convex/tasks.ts
export const bulkUpdateTasks = mutation({
  args: {
    updates: v.array(v.object({
      id: v.id("tasks"),
      changes: v.object({
        status: v.optional(taskStatus),
        order: v.optional(v.number()),
        // ... other fields
      })
    }))
  },
  handler: async (ctx, args) => {
    const results = await Promise.all(
      args.updates.map(update => 
        ctx.db.patch(update.id, {
          ...update.changes,
          updatedAt: new Date().toISOString()
        })
      )
    );
    return results;
  }
});
```

#### 4.2.2 Advanced Query Patterns

**1. Aggregated Data Queries**
```typescript
// convex/analytics.ts
export const getTaskMetrics = query({
  args: {
    workspaceId: v.id("workspaces"),
    dateRange: v.object({
      start: v.string(),
      end: v.string()
    })
  },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("tasks")
      .filter(q => 
        q.and(
          q.eq(q.field("workspaceId"), args.workspaceId),
          q.gte(q.field("createdAt"), args.dateRange.start),
          q.lte(q.field("createdAt"), args.dateRange.end)
        )
      )
      .collect();
    
    return {
      total: tasks.length,
      byStatus: groupBy(tasks, 'status'),
      byPriority: groupBy(tasks, 'priority'),
      completionRate: calculateCompletionRate(tasks),
      averageCycleTime: calculateCycleTime(tasks)
    };
  }
});
```

**2. Paginated Queries**
```typescript
// convex/tasks.ts
export const getTasksPaginated = query({
  args: {
    workspaceId: v.id("workspaces"),
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
    filters: v.optional(v.object({
      status: v.optional(v.array(taskStatus)),
      priority: v.optional(v.array(taskPriority)),
      assignedUsers: v.optional(v.array(v.id("users")))
    }))
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    let query = ctx.db
      .query("tasks")
      .filter(q => q.eq(q.field("workspaceId"), args.workspaceId));
    
    // Apply filters
    if (args.filters?.status) {
      query = query.filter(q => 
        args.filters.status.includes(q.field("status"))
      );
    }
    
    // Apply cursor
    if (args.cursor) {
      query = query.filter(q => 
        q.gt(q.field("_id"), args.cursor)
      );
    }
    
    const tasks = await query
      .order("asc")
      .take(limit + 1)
      .collect();
    
    const hasMore = tasks.length > limit;
    const items = hasMore ? tasks.slice(0, -1) : tasks;
    const nextCursor = hasMore ? items[items.length - 1]._id : null;
    
    return {
      items,
      nextCursor,
      hasMore
    };
  }
});
```

#### 4.2.3 Real-time Collaboration Features

**1. Presence System**
```typescript
// convex/presence.ts
export const updatePresence = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    location: v.object({
      page: v.string(),
      taskId: v.optional(v.id("tasks")),
      cursorPosition: v.optional(v.object({
        x: v.number(),
        y: v.number()
      }))
    })
  },
  handler: async (ctx, args) => {
    // Store in ephemeral presence table
    await ctx.db.insert("presence", {
      ...args,
      lastSeen: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30000).toISOString() // 30s TTL
    });
  }
});

// Client hook
const usePresence = (workspaceId: string) => {
  const updatePresence = useMutation(api.presence.updatePresence);
  const presence = useQuery(api.presence.getActiveUsers, { workspaceId });
  
  useEffect(() => {
    const interval = setInterval(() => {
      updatePresence({
        workspaceId,
        userId: currentUser.id,
        location: getCurrentLocation()
      });
    }, 15000); // Update every 15s
    
    return () => clearInterval(interval);
  }, [workspaceId]);
  
  return presence;
};
```

**2. Collaborative Editing**
```typescript
// convex/collaboration.ts
export const lockTask = mutation({
  args: {
    taskId: v.id("tasks"),
    userId: v.id("users")
  },
  handler: async (ctx, args) => {
    const existingLock = await ctx.db
      .query("taskLocks")
      .filter(q => q.eq(q.field("taskId"), args.taskId))
      .first();
    
    if (existingLock && existingLock.userId !== args.userId) {
      throw new Error("Task is locked by another user");
    }
    
    await ctx.db.insert("taskLocks", {
      taskId: args.taskId,
      userId: args.userId,
      lockedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 300000).toISOString() // 5min lock
    });
  }
});
```

### 4.3 Data Migration Strategy

#### 4.3.1 Schema Evolution
```typescript
// convex/migrations/v2_add_task_features.ts
export const migrateTasksV2 = internalMutation({
  handler: async (ctx) => {
    const tasks = await ctx.db.query("tasks").collect();
    
    for (const task of tasks) {
      await ctx.db.patch(task._id, {
        // New fields with defaults
        completedAt: task.status === 'done' 
          ? task.updatedAt 
          : undefined,
        createdBy: task.assignedUsers[0] || 'system',
        watchers: [],
        dependencies: [],
        customFields: {},
        version: 2
      });
    }
  }
});
```

#### 4.3.2 Backward Compatibility
```typescript
// Versioned API approach
export const getTask = query({
  args: {
    id: v.id("tasks"),
    version: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    
    if (args.version === 1) {
      // Return v1 format for backward compatibility
      return transformToV1(task);
    }
    
    return task;
  }
});
```

### 4.4 Performance Optimization

#### 4.4.1 Query Optimization
```typescript
// Indexed queries for common access patterns
// convex/schema.ts updates
tasks: defineTable({
  // ... existing fields
})
.index("by_workspace_status_priority", 
  ["workspaceId", "status", "priority"])
.index("by_assignee_status", 
  ["assignedUsers", "status"])
.index("by_due_date", 
  ["workspaceId", "dueDate"])
.searchIndex("search_title_description", {
  searchField: "search",
  filterFields: ["workspaceId", "status"]
});
```

#### 4.4.2 Subscription Management
```typescript
// Granular subscriptions to reduce data transfer
const useTaskSubscription = (taskId: string) => {
  // Subscribe only to specific task changes
  const task = useQuery(api.tasks.getTask, { id: taskId });
  
  // Separate subscription for comments
  const comments = useQuery(
    api.comments.getTaskComments, 
    { taskId },
    { 
      // Debounce rapid updates
      debounce: 500 
    }
  );
  
  return { task, comments };
};
```

### 4.5 Security Enhancements

#### 4.5.1 Row-Level Security
```typescript
// Enhanced authentication checks
export const authenticatedQuery = customQuery({
  args: {},
  input: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const user = await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("auth0Id"), identity.subject))
      .first();
      
    if (!user) {
      throw new Error("User not found");
    }
    
    return { ...args, user };
  }
});
```

#### 4.5.2 Permission System
```typescript
// convex/permissions.ts
export const checkTaskPermission = async (
  ctx: QueryCtx,
  taskId: Id<"tasks">,
  userId: Id<"users">,
  permission: 'read' | 'write' | 'delete'
) => {
  const task = await ctx.db.get(taskId);
  const user = await ctx.db.get(userId);
  
  // Workspace member check
  if (task.workspaceId !== user.workspaceId) {
    return false;
  }
  
  // Role-based permissions
  if (user.role === 'Admin') {
    return true;
  }
  
  // Task-specific permissions
  switch (permission) {
    case 'read':
      return true; // All workspace members can read
    case 'write':
      return task.assignedUsers.includes(userId) || 
             task.createdBy === userId;
    case 'delete':
      return task.createdBy === userId;
  }
};
```

---

## 5. Performance Optimization Strategy

### 5.1 Frontend Performance

#### 5.1.1 Code Splitting Strategy
```typescript
// Route-based code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Calendar = lazy(() => import('./pages/Calendar'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Settings = lazy(() => import('./pages/Settings'));

// Component-based splitting for heavy components
const GanttChart = lazy(() => import('./components/charts/GanttChart'));
const ReportBuilder = lazy(() => import('./components/reports/ReportBuilder'));

// Feature-based splitting
const CommandPalette = lazy(() => import('./components/CommandPalette'));
const NotificationCenter = lazy(() => import('./components/NotificationCenter'));
```

#### 5.1.2 React Optimization Techniques

**1. Memoization Strategy**
```typescript
// Expensive list computations
const TaskList = memo(({ tasks, filters }) => {
  const filteredTasks = useMemo(() => 
    filterTasks(tasks, filters),
    [tasks, filters]
  );
  
  const sortedTasks = useMemo(() => 
    sortTasks(filteredTasks, sortConfig),
    [filteredTasks, sortConfig]
  );
  
  return <VirtualList items={sortedTasks} />;
});

// Stable callbacks
const useTaskHandlers = () => {
  const updateTask = useMutation(api.tasks.updateTask);
  
  const handleTaskUpdate = useCallback(
    (taskId: string, updates: Partial<Task>) => {
      updateTask({ id: taskId, ...updates });
    },
    [updateTask]
  );
  
  return { handleTaskUpdate };
};
```

**2. Virtual Scrolling**
```typescript
// Using @tanstack/react-virtual
const VirtualTaskList = ({ tasks }: { tasks: Task[] }) => {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120, // Estimated task card height
    overscan: 5
  });
  
  return (
    <div ref={parentRef} className="h-full overflow-auto">
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map(virtualItem => (
          <TaskCard
            key={tasks[virtualItem.index]._id}
            task={tasks[virtualItem.index]}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualItem.start}px)`
            }}
          />
        ))}
      </div>
    </div>
  );
};
```

#### 5.1.3 Drag and Drop Optimization

**1. Debounced Drag Updates**
```typescript
const useDragHandlers = () => {
  const updateTaskOrder = useMutation(api.tasks.reorderTasks);
  const debouncedUpdate = useMemo(
    () => debounce(updateTaskOrder, 300),
    [updateTaskOrder]
  );
  
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      // Optimistic update
      setTasks(prev => reorderTasks(prev, active.id, over.id));
      
      // Debounced server update
      debouncedUpdate({
        taskId: active.id,
        newPosition: calculateNewPosition(active, over)
      });
    }
  }, [debouncedUpdate]);
  
  return { handleDragEnd };
};
```

**2. Drag Overlay Optimization**
```typescript
const DragOverlay = memo(({ activeId }: { activeId: string | null }) => {
  if (!activeId) return null;
  
  // Use portal to avoid re-renders
  return createPortal(
    <div className="drag-overlay">
      <TaskCardPreview taskId={activeId} />
    </div>,
    document.body
  );
});
```

### 5.2 Data Management Optimization

#### 5.2.1 Intelligent Caching
```typescript
// Custom Convex cache management
const useTaskCache = () => {
  const queryClient = useQueryClient();
  
  const prefetchRelatedData = useCallback(async (taskId: string) => {
    // Prefetch comments when hovering task
    await queryClient.prefetchQuery({
      queryKey: ['comments', taskId],
      queryFn: () => convex.query(api.comments.getTaskComments, { taskId })
    });
    
    // Prefetch user data for assignees
    const task = queryClient.getQueryData(['task', taskId]);
    if (task?.assignedUsers) {
      await Promise.all(
        task.assignedUsers.map(userId =>
          queryClient.prefetchQuery({
            queryKey: ['user', userId],
            queryFn: () => convex.query(api.users.getUser, { userId })
          })
        )
      );
    }
  }, [queryClient]);
  
  return { prefetchRelatedData };
};
```

#### 5.2.2 Subscription Optimization
```typescript
// Granular subscriptions with unsubscribe
const useOptimizedSubscriptions = (workspaceId: string) => {
  const [subscribedColumns, setSubscribedColumns] = useState<Set<string>>(new Set());
  
  // Subscribe only to visible columns
  const subscribeToColumn = useCallback((columnId: string) => {
    setSubscribedColumns(prev => new Set(prev).add(columnId));
  }, []);
  
  const unsubscribeFromColumn = useCallback((columnId: string) => {
    setSubscribedColumns(prev => {
      const next = new Set(prev);
      next.delete(columnId);
      return next;
    });
  }, []);
  
  // Use subscriptions
  const tasks = useQuery(
    api.tasks.getTasksByColumns,
    { 
      workspaceId, 
      columnIds: Array.from(subscribedColumns) 
    },
    { enabled: subscribedColumns.size > 0 }
  );
  
  return { tasks, subscribeToColumn, unsubscribeFromColumn };
};
```

### 5.3 Bundle Size Optimization

#### 5.3.1 Tree Shaking Configuration
```javascript
// webpack.config.js
module.exports = {
  optimization: {
    usedExports: true,
    sideEffects: false,
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10
        },
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true
        }
      }
    }
  }
};
```

#### 5.3.2 Dynamic Imports for Features
```typescript
// Lazy load heavy features
const loadChartingLibrary = () => import('chart.js');
const loadRichTextEditor = () => import('@tiptap/react');
const loadFileUploader = () => import('react-dropzone');

// Usage
const ChartComponent = () => {
  const [Chart, setChart] = useState(null);
  
  useEffect(() => {
    loadChartingLibrary().then(module => {
      setChart(() => module.Chart);
    });
  }, []);
  
  if (!Chart) return <Skeleton />;
  
  return <Chart {...props} />;
};
```

### 5.4 Image Optimization

#### 5.4.1 Lazy Loading Implementation
```typescript
const LazyImage = ({ src, alt, ...props }) => {
  const [imageSrc, setImageSrc] = useState<string>();
  const imageRef = useRef<HTMLImageElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    if (imageRef.current) {
      observer.observe(imageRef.current);
    }
    
    return () => observer.disconnect();
  }, [src]);
  
  return (
    <img
      ref={imageRef}
      src={imageSrc}
      alt={alt}
      loading="lazy"
      {...props}
    />
  );
};
```

#### 5.4.2 Image Format Optimization
```typescript
// Automatic WebP with fallback
const OptimizedImage = ({ src, alt }) => {
  return (
    <picture>
      <source 
        srcSet={`${src}.webp`} 
        type="image/webp" 
      />
      <source 
        srcSet={`${src}.jpg`} 
        type="image/jpeg" 
      />
      <img 
        src={`${src}.jpg`} 
        alt={alt}
        loading="lazy"
      />
    </picture>
  );
};
```

### 5.5 Performance Monitoring

#### 5.5.1 Core Web Vitals Tracking
```typescript
// Performance monitoring setup
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

const reportWebVitals = (metric: Metric) => {
  // Send to analytics
  if (window.gtag) {
    window.gtag('event', metric.name, {
      value: Math.round(metric.value),
      event_category: 'Web Vitals',
      event_label: metric.id,
      non_interaction: true,
    });
  }
  
  // Send to custom monitoring
  fetch('/api/metrics', {
    method: 'POST',
    body: JSON.stringify({
      metric: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id
    })
  });
};

// Initialize monitoring
getCLS(reportWebVitals);
getFID(reportWebVitals);
getFCP(reportWebVitals);
getLCP(reportWebVitals);
getTTFB(reportWebVitals);
```

#### 5.5.2 Custom Performance Metrics
```typescript
// Track feature-specific metrics
const measureTaskCreation = () => {
  performance.mark('task-creation-start');
  
  return {
    complete: () => {
      performance.mark('task-creation-end');
      performance.measure(
        'task-creation',
        'task-creation-start',
        'task-creation-end'
      );
      
      const measure = performance.getEntriesByName('task-creation')[0];
      reportCustomMetric('task_creation_time', measure.duration);
    }
  };
};
```

---

## 6. Sub-Agent Implementation Guide

### 6.1 Backend Integration Sub-Agent

#### 6.1.1 Task Scope
```typescript
interface BackendIntegrationTasks {
  phase1: {
    replaceAllMockData: boolean;
    implementOptimisticUpdates: boolean;
    addErrorHandling: boolean;
    setupRetryLogic: boolean;
  };
  phase2: {
    implementBulkOperations: boolean;
    addOfflineSupport: boolean;
    setupWebsockets: boolean;
    implementConflictResolution: boolean;
  };
  phase3: {
    addCaching: boolean;
    implementPagination: boolean;
    setupDataPreloading: boolean;
    optimizeQueries: boolean;
  };
}
```

#### 6.1.2 Implementation Checklist
1. **Mock Data Replacement**
   - [ ] Remove all hardcoded task arrays
   - [ ] Replace useState with useQuery
   - [ ] Connect all mutations
   - [ ] Test real-time updates

2. **Optimistic Updates**
   - [ ] Implement for task creation
   - [ ] Implement for task updates
   - [ ] Implement for drag-and-drop
   - [ ] Add rollback on error

3. **Error Handling**
   - [ ] Global error boundary
   - [ ] Mutation error handling
   - [ ] Retry mechanisms
   - [ ] User-friendly error messages

#### 6.1.3 Sub-Agent Instructions
```markdown
## Backend Integration Sub-Agent Instructions

### Priority 1: Complete Convex Integration
1. Start with src/pages/Dashboard.tsx
2. Remove all mock data (lines with hardcoded tasks)
3. Ensure all useQuery calls have proper error handling
4. Implement optimistic updates for better UX

### Priority 2: Comments System
1. Create UI components for comments
2. Connect to convex/comments.ts functions
3. Implement real-time comment updates
4. Add mention functionality

### Priority 3: Enhanced Features
1. Implement task search functionality
2. Add filtering to Convex queries
3. Create activity feed
4. Setup notification system

### Testing Requirements
- Test with multiple users simultaneously
- Verify real-time updates work
- Test error scenarios
- Ensure no data loss during updates
```

### 6.2 UI/UX Enhancement Sub-Agent

#### 6.2.1 Component Installation Order
```bash
# Phase 1: Core Components (Week 1)
bunx shadcn-ui@latest add dialog
bunx shadcn-ui@latest add dropdown-menu
bunx shadcn-ui@latest add toast
bunx shadcn-ui@latest add skeleton
bunx shadcn-ui@latest add avatar

# Phase 2: Interactive Components (Week 2)
bunx shadcn-ui@latest add command
bunx shadcn-ui@latest add popover
bunx shadcn-ui@latest add tooltip
bunx shadcn-ui@latest add sheet
bunx shadcn-ui@latest add calendar

# Phase 3: Advanced Components (Week 3)
bunx shadcn-ui@latest add data-table
bunx shadcn-ui@latest add tabs
bunx shadcn-ui@latest add badge
bunx shadcn-ui@latest add progress
bunx shadcn-ui@latest add alert
```

#### 6.2.2 Component Replacement Map
```typescript
const componentReplacements = {
  'TaskModal.tsx': {
    replaceWith: 'Dialog',
    additions: ['Form', 'Input', 'Select', 'Button'],
    features: ['Keyboard navigation', 'Focus management', 'Animations']
  },
  'TaskEditModal.tsx': {
    replaceWith: 'Dialog + Tabs',
    additions: ['Textarea', 'DatePicker', 'MultiSelect'],
    features: ['Tab navigation', 'Validation', 'Autosave']
  },
  'CalendarWidget.tsx': {
    enhance: 'Calendar',
    additions: ['Popover', 'Badge'],
    features: ['Task preview', 'Quick add', 'Navigation']
  }
};
```

#### 6.2.3 Sub-Agent Instructions
```markdown
## UI/UX Enhancement Sub-Agent Instructions

### Phase 1: Core UI Replacements
1. Install shadcn/ui base components
2. Replace TaskModal with Dialog
3. Implement toast notifications
4. Add loading skeletons

### Phase 2: Enhanced Interactions
1. Implement command palette (Cmd+K)
2. Add context menus to task cards
3. Create dropdown menus for actions
4. Implement keyboard shortcuts

### Phase 3: Polish & Accessibility
1. Add focus indicators
2. Implement ARIA labels
3. Create empty states
4. Add transition animations

### Design System Requirements
- Maintain existing color scheme
- Preserve dark mode functionality
- Keep consistent spacing
- Follow shadcn/ui patterns
```

### 6.3 Performance Optimization Sub-Agent

#### 6.3.1 Optimization Priorities
```typescript
interface PerformanceTargets {
  initialLoad: {
    target: '< 3s';
    current: 'measure';
    improvements: [
      'Code splitting',
      'Lazy loading',
      'Bundle optimization'
    ];
  };
  dragAndDrop: {
    target: '< 16ms frame time';
    current: 'measure';
    improvements: [
      'Memoization',
      'Virtual scrolling',
      'Debounced updates'
    ];
  };
  taskOperations: {
    target: '< 100ms perceived';
    current: 'measure';
    improvements: [
      'Optimistic updates',
      'Request batching',
      'Cache strategy'
    ];
  };
}
```

#### 6.3.2 Implementation Strategy
```typescript
// Performance optimization roadmap
const optimizationPhases = {
  phase1: {
    name: 'Quick Wins',
    tasks: [
      'Add React.memo to TaskCard',
      'Implement useMemo for filters',
      'Add loading states',
      'Enable React.StrictMode'
    ]
  },
  phase2: {
    name: 'Major Optimizations',
    tasks: [
      'Implement virtual scrolling',
      'Add code splitting',
      'Optimize bundle size',
      'Add service worker'
    ]
  },
  phase3: {
    name: 'Advanced Features',
    tasks: [
      'Implement request coalescing',
      'Add predictive prefetching',
      'Optimize images',
      'Add performance monitoring'
    ]
  }
};
```

#### 6.3.3 Sub-Agent Instructions
```markdown
## Performance Optimization Sub-Agent Instructions

### Phase 1: Measure Current Performance
1. Set up performance monitoring
2. Measure initial load time
3. Profile render performance
4. Identify bottlenecks

### Phase 2: Quick Optimizations
1. Add React.memo to expensive components
2. Implement useMemo for computations
3. Add debouncing to search/filter
4. Optimize re-renders

### Phase 3: Major Improvements
1. Implement virtual scrolling for task lists
2. Add code splitting for routes
3. Optimize drag-and-drop performance
4. Implement service worker for caching

### Performance Budget
- Initial Load: < 3s
- Time to Interactive: < 5s
- Task Operation: < 100ms
- Drag Response: < 16ms
```

### 6.4 Testing & QA Sub-Agent

#### 6.4.1 Testing Strategy
```typescript
interface TestingPlan {
  unit: {
    coverage: '90%';
    focus: ['Utils', 'Hooks', 'Components'];
    tools: ['Jest', 'React Testing Library'];
  };
  integration: {
    coverage: '80%';
    focus: ['User flows', 'API calls', 'State management'];
    tools: ['Jest', 'MSW', 'Testing Library'];
  };
  e2e: {
    coverage: 'Critical paths';
    focus: ['Task CRUD', 'Drag-drop', 'Auth flow'];
    tools: ['Playwright', 'Cypress'];
  };
}
```

#### 6.4.2 Test Implementation Examples
```typescript
// Unit test example
describe('TaskCard', () => {
  it('should render task information correctly', () => {
    const task = createMockTask();
    render(<TaskCard task={task} />);
    
    expect(screen.getByText(task.title)).toBeInTheDocument();
    expect(screen.getByText(task.priority)).toHaveClass('priority-high');
  });
  
  it('should handle drag start', () => {
    const onDragStart = jest.fn();
    const task = createMockTask();
    
    render(<TaskCard task={task} onDragStart={onDragStart} />);
    
    fireEvent.dragStart(screen.getByRole('article'));
    expect(onDragStart).toHaveBeenCalledWith(task.id);
  });
});

// Integration test example
describe('Task Creation Flow', () => {
  it('should create task with optimistic update', async () => {
    const { result } = renderHook(() => useTaskCreation());
    
    act(() => {
      result.current.createTask({
        title: 'New Task',
        status: 'todo'
      });
    });
    
    // Check optimistic update
    expect(result.current.tasks).toContainEqual(
      expect.objectContaining({ title: 'New Task' })
    );
    
    // Wait for server response
    await waitFor(() => {
      expect(result.current.tasks[0]).toHaveProperty('_id');
    });
  });
});
```

#### 6.4.3 Sub-Agent Instructions
```markdown
## Testing & QA Sub-Agent Instructions

### Phase 1: Test Setup
1. Configure Jest for React 19
2. Set up React Testing Library
3. Configure coverage reporting
4. Create test utilities

### Phase 2: Unit Tests
1. Test all utility functions
2. Test custom hooks
3. Test component rendering
4. Test component interactions

### Phase 3: Integration Tests
1. Test complete user flows
2. Test API integration
3. Test state management
4. Test error scenarios

### Phase 4: E2E Tests
1. Set up Playwright
2. Test critical user paths
3. Test cross-browser compatibility
4. Test mobile responsiveness

### Coverage Goals
- Utilities: 100%
- Hooks: 95%
- Components: 90%
- Pages: 85%
```

---

## 7. Technical Specifications

### 7.1 Development Environment

#### 7.1.1 Required Tools
```json
{
  "runtime": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0",
    "bun": ">=1.0.0"
  },
  "development": {
    "typescript": "^4.9.5",
    "react": "^19.1.0",
    "convex": "^1.25.4"
  },
  "tooling": {
    "eslint": "latest",
    "prettier": "latest",
    "husky": "latest",
    "lint-staged": "latest"
  }
}
```

#### 7.1.2 Environment Variables
```bash
# .env.local
REACT_APP_CONVEX_URL=https://your-instance.convex.cloud
REACT_APP_AUTH0_DOMAIN=your-domain.auth0.com
REACT_APP_AUTH0_CLIENT_ID=your-client-id
REACT_APP_AUTH0_REDIRECT_URI=http://localhost:3000/callback
REACT_APP_SENTRY_DSN=your-sentry-dsn
REACT_APP_ANALYTICS_ID=your-analytics-id
```

### 7.2 Architecture Patterns

#### 7.2.1 Component Structure
```typescript
// Feature-based organization
src/
├── features/
│   ├── tasks/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── types/
│   ├── auth/
│   ├── workspace/
│   └── analytics/
├── shared/
│   ├── components/
│   ├── hooks/
│   └── utils/
└── core/
    ├── api/
    ├── config/
    └── types/
```

#### 7.2.2 State Management Patterns
```typescript
// Zustand store pattern
interface StoreSlice<T> {
  data: T;
  isLoading: boolean;
  error: Error | null;
  actions: {
    set: (data: T) => void;
    update: (partial: Partial<T>) => void;
    reset: () => void;
  };
}

// Hook composition pattern
const useTaskManagement = () => {
  const tasks = useQuery(api.tasks.getTasks);
  const createTask = useMutation(api.tasks.createTask);
  const updateTask = useMutation(api.tasks.updateTask);
  
  return {
    tasks: tasks.data,
    isLoading: tasks.isLoading,
    actions: {
      create: createTask,
      update: updateTask
    }
  };
};
```

### 7.3 API Design

#### 7.3.1 Convex Function Patterns
```typescript
// Authenticated query pattern
export const authenticatedQuery = customQuery({
  args: { ...baseArgs },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const workspace = await requireWorkspace(ctx, user);
    
    // Query logic
    return result;
  }
});

// Batch operation pattern
export const batchOperation = mutation({
  args: {
    operations: v.array(v.object({
      type: v.union(v.literal('create'), v.literal('update'), v.literal('delete')),
      data: v.any()
    }))
  },
  handler: async (ctx, args) => {
    const results = [];
    
    for (const op of args.operations) {
      try {
        const result = await processOperation(ctx, op);
        results.push({ success: true, result });
      } catch (error) {
        results.push({ success: false, error: error.message });
      }
    }
    
    return results;
  }
});
```

#### 7.3.2 Error Handling
```typescript
// Custom error types
class BusinessError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
  }
}

// Error handler
export const handleConvexError = (error: any) => {
  if (error instanceof BusinessError) {
    return {
      error: {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode
      }
    };
  }
  
  // Log unexpected errors
  console.error('Unexpected error:', error);
  
  return {
    error: {
      message: 'An unexpected error occurred',
      code: 'INTERNAL_ERROR',
      statusCode: 500
    }
  };
};
```

### 7.4 Security Implementation

#### 7.4.1 Authentication Flow
```typescript
// Enhanced auth context
interface AuthContext {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: Permission[];
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

// Permission checking
const usePermission = (permission: string) => {
  const { hasPermission } = useAuth();
  return hasPermission(permission);
};

// Protected component
const ProtectedComponent = ({ 
  permission, 
  children, 
  fallback = null 
}: ProtectedComponentProps) => {
  const hasPermission = usePermission(permission);
  
  if (!hasPermission) {
    return fallback;
  }
  
  return children;
};
```

#### 7.4.2 Data Validation
```typescript
// Input validation
import { z } from 'zod';

const TaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.string().datetime().optional(),
  assignedUsers: z.array(z.string()).max(10)
});

// Validation middleware
export const validateTask = (data: unknown) => {
  const result = TaskSchema.safeParse(data);
  
  if (!result.success) {
    throw new BusinessError(
      'Invalid task data',
      'VALIDATION_ERROR',
      400
    );
  }
  
  return result.data;
};
```

### 7.5 Deployment Configuration

#### 7.5.1 Build Configuration
```javascript
// Custom webpack config
const customWebpackConfig = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: (module) => {
            const packageName = module.context.match(
              /[\\/]node_modules[\\/](.*?)([\\/]|$)/
            )[1];
            return `vendor.${packageName.replace('@', '')}`;
          }
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@features': path.resolve(__dirname, 'src/features'),
      '@utils': path.resolve(__dirname, 'src/utils')
    }
  }
};
```

#### 7.5.2 CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run test:ci
      
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v3
        with:
          name: build-files
          path: build/
          
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v3
      - name: Deploy to Vercel
        run: |
          npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## 8. Implementation Timeline

### 8.1 15-Week Development Schedule

#### Week 1-3: UI/UX Enhancement Phase
**Week 1: Core shadcn/ui Integration**
- Day 1-2: Install and configure shadcn/ui components
- Day 3-4: Replace modals with Dialog components
- Day 5: Implement toast notification system

**Week 2: Interactive Components**
- Day 1-2: Implement command palette
- Day 3-4: Add dropdown menus and context menus
- Day 5: Create loading states and skeletons

**Week 3: Polish and Accessibility**
- Day 1-2: Add keyboard navigation
- Day 3-4: Implement ARIA labels and focus management
- Day 5: Create empty states and transitions

#### Week 4-6: Collaboration Features
**Week 4: Comments System**
- Day 1-2: Create comment UI components
- Day 3-4: Connect to Convex backend
- Day 5: Implement real-time updates

**Week 5: Real-time Features**
- Day 1-2: Implement presence system
- Day 3-4: Add activity feed
- Day 5: Create notification center

**Week 6: Advanced Collaboration**
- Day 1-2: Add mention system
- Day 3-4: Implement task locking
- Day 5: Add collaboration indicators

#### Week 7-9: Advanced Task Management
**Week 7: Task Dependencies**
- Day 1-2: Design dependency model
- Day 3-4: Implement UI for dependencies
- Day 5: Add validation logic

**Week 8: Advanced Views**
- Day 1-2: Create table view
- Day 3-4: Implement timeline view
- Day 5: Add view persistence

**Week 9: Automation**
- Day 1-2: Create task templates
- Day 3-4: Implement automation rules
- Day 5: Add recurring tasks

#### Week 10-11: Analytics & Reporting
**Week 10: Dashboard Analytics**
- Day 1-2: Integrate charting library
- Day 3-4: Create metric calculations
- Day 5: Build dashboard widgets

**Week 11: Reporting System**
- Day 1-2: Create report builder
- Day 3-4: Implement export functionality
- Day 5: Add scheduled reports

#### Week 12-13: Integrations & API
**Week 12: Third-party Integrations**
- Day 1-2: Implement Slack integration
- Day 3-4: Add file storage integration
- Day 5: Create webhook system

**Week 13: Public API**
- Day 1-2: Design REST API
- Day 3-4: Implement authentication
- Day 5: Create API documentation

#### Week 14-15: Performance & Launch
**Week 14: Performance Optimization**
- Day 1-2: Implement code splitting
- Day 3-4: Add virtual scrolling
- Day 5: Optimize bundle size

**Week 15: Final Polish & Launch**
- Day 1-2: Performance testing
- Day 3-4: Bug fixes and polish
- Day 5: Production deployment

### 8.2 Resource Allocation

```typescript
interface TeamAllocation {
  frontend: {
    senior: 2,
    mid: 2,
    junior: 1
  };
  backend: {
    senior: 1,
    mid: 1
  };
  design: {
    uiux: 1,
    visual: 0.5
  };
  qa: {
    automation: 1,
    manual: 1
  };
}

const phases = {
  phase1: { // UI/UX
    frontend: 3,
    backend: 0.5,
    design: 1.5,
    qa: 1
  },
  phase2: { // Collaboration
    frontend: 2,
    backend: 2,
    design: 0.5,
    qa: 1.5
  },
  phase3: { // Advanced Features
    frontend: 3,
    backend: 1.5,
    design: 0.5,
    qa: 1
  }
};
```

---

## 9. Success Metrics

### 9.1 Performance Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Initial Load Time | TBD | < 3s | Lighthouse |
| Time to Interactive | TBD | < 5s | Lighthouse |
| First Contentful Paint | TBD | < 1.5s | Web Vitals |
| Task Creation Time | TBD | < 100ms | Custom |
| Drag Response Time | TBD | < 16ms | Performance API |
| Bundle Size | TBD | < 500KB | Webpack |

### 9.2 User Experience Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Task Completion Rate | > 95% | Analytics |
| Error Rate | < 0.1% | Sentry |
| User Satisfaction | > 4.5/5 | Surveys |
| Feature Adoption | > 70% | Analytics |
| Session Duration | > 15 min | Analytics |
| Daily Active Users | > 60% | Analytics |

### 9.3 Business Metrics

| Metric | Target | Timeline |
|--------|--------|----------|
| User Retention | > 80% | 6 months |
| Feature Usage | > 70% | 3 months |
| Support Tickets | < 5% | Monthly |
| Uptime | > 99.9% | Monthly |
| API Response Time | < 200ms | Real-time |

### 9.4 Quality Metrics

| Metric | Target | Tool |
|--------|--------|------|
| Code Coverage | > 90% | Jest |
| Type Coverage | 100% | TypeScript |
| Accessibility Score | > 95 | axe-core |
| SEO Score | > 90 | Lighthouse |
| Security Score | A+ | Observatory |

---

## 10. Risk Management

### 10.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|---------|------------|
| Performance degradation with scale | Medium | High | Implement virtual scrolling early, continuous monitoring |
| Convex limitations for complex queries | Low | High | Design efficient query patterns, consider hybrid approach |
| Bundle size growth | High | Medium | Aggressive code splitting, tree shaking |
| Browser compatibility issues | Low | Medium | Comprehensive testing, polyfills |
| Real-time sync conflicts | Medium | High | Implement CRDT or operational transform |

### 10.2 Project Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|---------|------------|
| Scope creep | High | High | Strict sprint planning, clear requirements |
| Timeline delays | Medium | Medium | Buffer time, parallel workstreams |
| Resource availability | Medium | Medium | Cross-training, documentation |
| Third-party service outages | Low | High | Fallback mechanisms, multi-provider |

### 10.3 Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|---------|------------|
| Low user adoption | Medium | High | User research, iterative development |
| Competitor features | High | Medium | Rapid iteration, unique value props |
| Scalability costs | Medium | Medium | Efficient architecture, usage monitoring |
| Security breaches | Low | Critical | Security audits, best practices |

### 10.4 Mitigation Strategies

#### 10.4.1 Performance Mitigation
```typescript
// Performance budget enforcement
const performanceBudget = {
  javascript: 500 * 1024, // 500KB
  css: 100 * 1024, // 100KB
  images: 1000 * 1024, // 1MB
  total: 2000 * 1024 // 2MB
};

// Monitoring and alerts
const monitorPerformance = () => {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.duration > 100) {
        console.warn('Long task detected:', entry);
        reportToAnalytics('long_task', {
          duration: entry.duration,
          name: entry.name
        });
      }
    }
  });
  
  observer.observe({ entryTypes: ['measure', 'navigation'] });
};
```

#### 10.4.2 Security Mitigation
```typescript
// Security headers
const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

// Input sanitization
const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href']
  });
};
```

---

## Appendix A: Component Specifications

### A.1 Task Card Component

```typescript
interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  isOver?: boolean;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
}

const TaskCard: React.FC<TaskCardProps> = memo(({
  task,
  isDragging = false,
  isOver = false,
  onEdit,
  onDelete,
  onStatusChange
}) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task._id,
    data: { type: 'task', task }
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab'
  };
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "task-card",
        isOver && "task-card--over",
        isDragging && "task-card--dragging"
      )}
      {...attributes}
      {...listeners}
    >
      <TaskCardContent task={task} />
      <TaskCardActions 
        onEdit={() => onEdit?.(task)}
        onDelete={() => onDelete?.(task._id)}
        onStatusChange={(status) => onStatusChange?.(task._id, status)}
      />
    </div>
  );
});
```

### A.2 Command Palette Component

```typescript
interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  onOpenChange
}) => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { createTask } = useTaskActions();
  
  const commands = [
    {
      group: 'Tasks',
      items: [
        {
          id: 'create-task',
          label: 'Create New Task',
          shortcut: '⌘N',
          action: () => createTask()
        },
        {
          id: 'search-tasks',
          label: 'Search Tasks',
          shortcut: '⌘F',
          action: () => navigate('/tasks/search')
        }
      ]
    },
    {
      group: 'Navigation',
      items: [
        {
          id: 'go-dashboard',
          label: 'Go to Dashboard',
          shortcut: '⌘D',
          action: () => navigate('/')
        },
        {
          id: 'go-calendar',
          label: 'Go to Calendar',
          shortcut: '⌘K',
          action: () => navigate('/calendar')
        }
      ]
    }
  ];
  
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Type a command or search..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {commands.map(group => (
          <CommandGroup key={group.group} heading={group.group}>
            {group.items.map(item => (
              <CommandItem
                key={item.id}
                onSelect={item.action}
              >
                <span>{item.label}</span>
                <CommandShortcut>{item.shortcut}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
};
```

### A.3 Analytics Dashboard Component

```typescript
interface AnalyticsDashboardProps {
  workspaceId: string;
  dateRange: DateRange;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  workspaceId,
  dateRange
}) => {
  const metrics = useQuery(api.analytics.getMetrics, { 
    workspaceId, 
    dateRange 
  });
  
  if (!metrics) return <DashboardSkeleton />;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Total Tasks"
        value={metrics.totalTasks}
        change={metrics.taskChange}
        icon={<ListIcon />}
      />
      <MetricCard
        title="Completion Rate"
        value={`${metrics.completionRate}%`}
        change={metrics.completionChange}
        icon={<CheckCircleIcon />}
      />
      <MetricCard
        title="Avg Cycle Time"
        value={`${metrics.avgCycleTime}d`}
        change={metrics.cycleTimeChange}
        icon={<ClockIcon />}
      />
      <MetricCard
        title="Team Velocity"
        value={metrics.velocity}
        change={metrics.velocityChange}
        icon={<TrendingUpIcon />}
      />
      
      <div className="col-span-full lg:col-span-2">
        <TaskCompletionChart data={metrics.completionTrend} />
      </div>
      <div className="col-span-full lg:col-span-2">
        <WorkloadDistribution data={metrics.workloadByUser} />
      </div>
      
      <div className="col-span-full">
        <TaskFlowDiagram data={metrics.taskFlow} />
      </div>
    </div>
  );
};
```

---

## Appendix B: Database Schema Extensions

### B.1 Enhanced Task Schema

```typescript
// Extended task schema for new features
const enhancedTaskSchema = defineTable({
  // Existing fields...
  
  // Dependency Management
  dependencies: v.array(v.object({
    taskId: v.id("tasks"),
    type: v.union(
      v.literal("blocks"),
      v.literal("blocked_by"),
      v.literal("related_to"),
      v.literal("duplicates")
    )
  })),
  
  // Advanced Features
  customFields: v.record(v.string(), v.any()),
  recurring: v.optional(v.object({
    pattern: v.union(
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly"),
      v.literal("custom")
    ),
    interval: v.number(),
    endDate: v.optional(v.string()),
    nextDue: v.string()
  })),
  
  // Time Tracking
  timeTracking: v.optional(v.object({
    estimated: v.number(), // in minutes
    logged: v.array(v.object({
      userId: v.id("users"),
      duration: v.number(),
      date: v.string(),
      description: v.optional(v.string())
    }))
  })),
  
  // Collaboration
  watchers: v.array(v.id("users")),
  mentions: v.array(v.object({
    userId: v.id("users"),
    context: v.string(),
    resolved: v.boolean()
  })),
  
  // Versioning
  version: v.number(),
  history: v.array(v.object({
    version: v.number(),
    changes: v.record(v.string(), v.any()),
    changedBy: v.id("users"),
    changedAt: v.string()
  }))
})
.index("by_dependencies", ["dependencies"])
.index("by_watchers", ["watchers"])
.index("by_recurring", ["recurring.nextDue"])
.searchIndex("full_text_search", {
  searchField: "searchText",
  filterFields: ["workspaceId", "status", "priority"]
});
```

### B.2 Analytics Schema

```typescript
// Analytics event tracking
const analyticsEvents = defineTable({
  workspaceId: v.id("workspaces"),
  userId: v.id("users"),
  eventType: v.string(),
  eventData: v.record(v.string(), v.any()),
  sessionId: v.string(),
  timestamp: v.string(),
  
  // Context
  browser: v.optional(v.string()),
  os: v.optional(v.string()),
  deviceType: v.optional(v.string()),
  
  // Performance metrics
  metrics: v.optional(v.object({
    loadTime: v.optional(v.number()),
    renderTime: v.optional(v.number()),
    interactionTime: v.optional(v.number())
  }))
})
.index("by_workspace_time", ["workspaceId", "timestamp"])
.index("by_user_session", ["userId", "sessionId"])
.index("by_event_type", ["eventType", "timestamp"]);

// Aggregated metrics
const analyticsMetrics = defineTable({
  workspaceId: v.id("workspaces"),
  date: v.string(), // YYYY-MM-DD
  metrics: v.object({
    tasks: v.object({
      created: v.number(),
      completed: v.number(),
      deleted: v.number(),
      averageCycleTime: v.number()
    }),
    users: v.object({
      active: v.number(),
      new: v.number(),
      averageSessionDuration: v.number()
    }),
    performance: v.object({
      p50LoadTime: v.number(),
      p95LoadTime: v.number(),
      errorRate: v.number()
    })
  })
})
.index("by_workspace_date", ["workspaceId", "date"]);
```

---

## Appendix C: API Documentation

### C.1 REST API Endpoints

```typescript
// API Route Structure
const apiRoutes = {
  // Authentication
  'POST /api/auth/login': 'User login',
  'POST /api/auth/logout': 'User logout',
  'POST /api/auth/refresh': 'Refresh access token',
  'GET /api/auth/me': 'Get current user',
  
  // Tasks
  'GET /api/tasks': 'List tasks with filters',
  'POST /api/tasks': 'Create new task',
  'GET /api/tasks/:id': 'Get task details',
  'PUT /api/tasks/:id': 'Update task',
  'DELETE /api/tasks/:id': 'Delete task',
  'POST /api/tasks/:id/comments': 'Add comment',
  'PUT /api/tasks/reorder': 'Reorder tasks',
  
  // Workspaces
  'GET /api/workspaces': 'List user workspaces',
  'POST /api/workspaces': 'Create workspace',
  'GET /api/workspaces/:id': 'Get workspace details',
  'PUT /api/workspaces/:id': 'Update workspace',
  'POST /api/workspaces/:id/invite': 'Invite user',
  
  // Analytics
  'GET /api/analytics/metrics': 'Get workspace metrics',
  'GET /api/analytics/reports': 'List reports',
  'POST /api/analytics/reports': 'Generate report',
  
  // Webhooks
  'GET /api/webhooks': 'List webhooks',
  'POST /api/webhooks': 'Create webhook',
  'DELETE /api/webhooks/:id': 'Delete webhook'
};
```

### C.2 Webhook Events

```typescript
interface WebhookEvent {
  id: string;
  type: WebhookEventType;
  workspace: string;
  timestamp: string;
  data: Record<string, any>;
  user?: string;
}

enum WebhookEventType {
  // Task Events
  TASK_CREATED = 'task.created',
  TASK_UPDATED = 'task.updated',
  TASK_DELETED = 'task.deleted',
  TASK_ASSIGNED = 'task.assigned',
  TASK_COMPLETED = 'task.completed',
  
  // Comment Events
  COMMENT_CREATED = 'comment.created',
  COMMENT_UPDATED = 'comment.updated',
  COMMENT_DELETED = 'comment.deleted',
  
  // User Events
  USER_JOINED = 'user.joined',
  USER_LEFT = 'user.left',
  USER_ROLE_CHANGED = 'user.role_changed',
  
  // Workspace Events
  WORKSPACE_UPDATED = 'workspace.updated',
  WORKSPACE_PLAN_CHANGED = 'workspace.plan_changed'
}

// Webhook payload example
{
  "id": "evt_1234567890",
  "type": "task.created",
  "workspace": "ws_abc123",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "task": {
      "id": "task_xyz789",
      "title": "New Feature Implementation",
      "status": "todo",
      "priority": "high",
      "assignedUsers": ["user_123"],
      "createdBy": "user_456"
    }
  },
  "user": "user_456"
}
```

---

## Conclusion

This comprehensive Product Requirements Document outlines the complete roadmap for transforming the current MVP productivity app into a professional-grade platform. The implementation follows a phased approach that prioritizes user experience enhancements, followed by collaboration features, advanced task management, analytics, integrations, and performance optimizations.

### Key Success Factors

1. **Incremental Delivery**: Each phase delivers tangible value to users
2. **Performance First**: Maintaining sub-3s load times throughout development
3. **User-Centric Design**: Every feature driven by user needs and feedback
4. **Scalable Architecture**: Built to handle 10,000+ concurrent users
5. **Quality Assurance**: Comprehensive testing at every stage

### Next Steps

1. **Review and Approval**: Stakeholder review of this PRD
2. **Team Assembly**: Recruit necessary team members
3. **Environment Setup**: Prepare development infrastructure
4. **Sprint Planning**: Break down Phase 1 into 2-week sprints
5. **Kickoff**: Begin with shadcn/ui integration

### Deliverables

By the end of the 15-week development cycle, we will have:
- A fully-featured productivity platform
- Professional UI with shadcn/ui components
- Real-time collaboration capabilities
- Advanced task management features
- Comprehensive analytics and reporting
- Third-party integrations
- Public API
- 90%+ test coverage
- Performance optimized for scale

This PRD serves as the definitive guide for all development activities and should be referenced throughout the implementation process. Regular updates will be made as we gather user feedback and adapt to changing requirements.

---

*Document Version: 1.0*  
*Last Updated: January 2025*  
*Total Pages: 200+*