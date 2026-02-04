'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface DashboardContextType {
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <DashboardContext.Provider value={{ selectedCategory, setSelectedCategory }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
