'use client';

import Sidebar from '../components/ui/Sidebar';
import { DashboardProvider, useDashboard } from './DashboardContext';

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { setSelectedCategory } = useDashboard();

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar onCategoryChange={setSelectedCategory} />
      <main style={{ marginLeft: '200px', flex: 1, backgroundColor: 'var(--color-bg-secondary)' }}>
        {children}
      </main>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </DashboardProvider>
  );
}
