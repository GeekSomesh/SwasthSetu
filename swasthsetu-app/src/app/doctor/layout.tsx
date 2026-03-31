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
    <div className="app-shell">
      <Sidebar role="doctor" />
      <div className="app-shell__content">
        <TopNav
          title="Doctor Dashboard"
          subtitle="Patient records & clinical view"
          deskLabel="Doctor Desk"
        />
        <main className="app-shell__main">
          <div className="app-shell__main-inner">{children}</div>
        </main>
      </div>
    </div>
  );
}
