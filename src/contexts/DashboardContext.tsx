import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FilterOptions {
  priority?: string[];
  category?: string[];
  assignedUsers?: string[];
}

interface DashboardContextType {
  filters: FilterOptions;
  setAddTaskCallback: (callback: (() => void) | null) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const useDashboardContext = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    // Return a default value for non-dashboard pages
    return {
      filters: {},
      setAddTaskCallback: () => {}
    };
  }
  return context;
};

interface DashboardProviderProps {
  children: ReactNode;
  filters: FilterOptions;
  setAddTaskCallback: (callback: (() => void) | null) => void;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ 
  children, 
  filters, 
  setAddTaskCallback 
}) => {
  return (
    <DashboardContext.Provider value={{ filters, setAddTaskCallback }}>
      {children}
    </DashboardContext.Provider>
  );
};