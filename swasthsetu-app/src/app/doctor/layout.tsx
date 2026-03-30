'use client';

import { useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopNav from '@/components/layout/TopNav';
import { persistRoleCookie } from '@/lib/auth';

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    persistRoleCookie('doctor');
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar role="doctor" />
      <div
        style={{
          flex: 1,
          marginLeft: 'var(--app-sidebar-width, 260px)',
          transition: 'margin-left 0.3s ease',
        }}
      >
        <TopNav
          title="Doctor Dashboard"
          subtitle="Patient records & clinical view"
          deskLabel="Doctor Desk"
          onNotificationClick={() => alert('No new doctor notifications at the moment.')}
        />
        <main style={{ padding: '24px 32px' }}>{children}</main>
      </div>
    </div>
  );
}
