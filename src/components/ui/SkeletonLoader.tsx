import React from 'react';
import { cn } from '../../utils/cn';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'text',
  width,
  height,
  animation = 'pulse'
}) => {
  const baseClasses = cn(
    'bg-gray-200 dark:bg-gray-700',
    {
      'rounded-md': variant === 'text' || variant === 'rectangular',
      'rounded-full': variant === 'circular',
      'animate-pulse': animation === 'pulse',
      'overflow-hidden relative': animation === 'wave'
    },
    className
  );
  
  const style: React.CSSProperties = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1em' : '100%')
  };
  
  return (
    <div className={baseClasses} style={style}>
      {animation === 'wave' && (
        <div className="absolute inset-0 -translate-x-full animate-[wave_2s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      )}
    </div>
  );
};

// Task Card Skeleton
export const TaskCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-2">
      <div className="flex items-start justify-between mb-3">
        <Skeleton width="70%" height={20} />
        <Skeleton variant="circular" width={24} height={24} />
      </div>
      
      <Skeleton width="100%" height={14} className="mb-2" />
      <Skeleton width="80%" height={14} className="mb-4" />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton width={60} height={24} className="rounded-full" />
          <Skeleton width={80} height={20} />
        </div>
        <div className="flex items-center gap-1">
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="circular" width={32} height={32} />
        </div>
      </div>
    </div>
  );
};

// Kanban Column Skeleton
export const KanbanColumnSkeleton: React.FC = () => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 min-w-[300px] h-full">
      <div className="flex items-center justify-between mb-4">
        <Skeleton width={120} height={24} />
        <Skeleton width={20} height={20} className="rounded-full" />
      </div>
      
      <div className="space-y-2">
        <TaskCardSkeleton />
        <TaskCardSkeleton />
        <TaskCardSkeleton />
      </div>
    </div>
  );
};

// Dashboard Loading Skeleton
export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="h-full p-6">
      <div className="flex items-center justify-between mb-6">
        <Skeleton width={200} height={32} />
        <div className="flex gap-2">
          <Skeleton width={100} height={36} className="rounded-md" />
          <Skeleton width={100} height={36} className="rounded-md" />
        </div>
      </div>
      
      <div className="flex gap-4 h-[calc(100%-80px)] overflow-x-auto">
        <KanbanColumnSkeleton />
        <KanbanColumnSkeleton />
        <KanbanColumnSkeleton />
      </div>
    </div>
  );
};

// Add wave animation to global CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes wave {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
  `;
  document.head.appendChild(style);
}