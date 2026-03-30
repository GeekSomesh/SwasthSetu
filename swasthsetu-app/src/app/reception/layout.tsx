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
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar role="reception" />
      <div
        style={{
          flex: 1,
          marginLeft: 'var(--app-sidebar-width, 260px)',
          transition: 'margin-left 0.3s ease',
        }}
      >
        <TopNav
          title="Reception Dashboard"
          subtitle="Patient check-in & consent management"
          deskLabel="Reception Desk"
        />
        <main style={{ padding: '24px 32px' }}>{children}</main>
      </div>
    </div>
  );
}
