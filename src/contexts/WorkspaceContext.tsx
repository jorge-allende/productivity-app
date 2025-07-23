import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from 'convex/react';
// @ts-ignore - TypeScript depth issue with generated types
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';

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
  
  // Fetch workspace data from Convex when workspace ID is set
  const convexWorkspace = useQuery(
    // @ts-expect-error - Known TypeScript depth issue with Convex generated types
    api.workspaces.getWorkspace,
    currentWorkspace?.id ? { workspaceId: currentWorkspace.id as Id<"workspaces"> } : "skip"
  );
  
  // Update workspace data when fetched from Convex
  useEffect(() => {
    if (convexWorkspace && currentWorkspace) {
      setCurrentWorkspace({
        ...currentWorkspace,
        name: convexWorkspace.name,
        plan: convexWorkspace.plan,
        createdBy: convexWorkspace.createdBy,
        settings: convexWorkspace.settings
      });
    }
  }, [convexWorkspace]); // eslint-disable-line react-hooks/exhaustive-deps

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