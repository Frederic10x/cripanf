'use client';

import Sidebar from '../components/ui/Sidebar';
import { DashboardProvider, useDashboard } from './DashboardContext';
import styles from './layout.module.css';

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { setSelectedCategory } = useDashboard();

  return (
    <div className={styles.layout}>
      <Sidebar onCategoryChange={setSelectedCategory} />
      <main className={styles.main}>
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
