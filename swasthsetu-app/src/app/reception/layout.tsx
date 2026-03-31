'use client';

import { useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopNav from '@/components/layout/TopNav';
import { persistRoleCookie } from '@/lib/auth';

export default function ReceptionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    persistRoleCookie('reception');
  }, []);

  return (
    <div className="app-shell">
      <Sidebar role="reception" />
      <div className="app-shell__content">
        <TopNav
          title="Reception Dashboard"
          subtitle="Patient check-in & consent management"
          deskLabel="Reception Desk"
        />
        <main className="app-shell__main">
          <div className="app-shell__main-inner">{children}</div>
        </main>
      </div>
    </div>
  );
}
