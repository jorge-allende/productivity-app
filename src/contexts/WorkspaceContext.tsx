import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from 'convex/react';
import type { Id } from '../convex/_generated/dataModel';

// Using require for api to avoid TypeScript depth issues with this specific query
const { api } = require('../convex/_generated/api');

interface Workspace {
  id: string;
  name: string;
  plan: 'free' | 'pro' | 'enterprise';
  createdBy?: string;
  settings?: {
    allowedDomains?: string[];
    defaultRole?: 'Admin' | 'Manager';
  };
}

interface WorkspaceContextType {
  currentWorkspace: Workspace | null;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  
  // Prepare query args separately to avoid TS depth issues
  const queryArgs = currentWorkspace?.id 
    ? { workspaceId: currentWorkspace.id as Id<"workspaces"> } 
    : "skip";
  
  // Fetch workspace data from Convex when workspace ID is set
  const convexWorkspace = useQuery(api.workspaces.getWorkspace, queryArgs);
  
  // Update workspace data when fetched from Convex
  useEffect(() => {
    if (convexWorkspace) {
      setCurrentWorkspace(prev => {
        if (!prev || prev.id !== convexWorkspace._id) return prev;
        return {
          ...prev,
          name: convexWorkspace.name,
          plan: convexWorkspace.plan,
          createdBy: convexWorkspace.createdBy,
          settings: convexWorkspace.settings
        };
      });
    }
  }, [convexWorkspace, setCurrentWorkspace]);

  return (
    <WorkspaceContext.Provider value={{ currentWorkspace, setCurrentWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};