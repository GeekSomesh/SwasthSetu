'use client';

import Sidebar from '@/components/layout/Sidebar';
import TopNav from '@/components/layout/TopNav';

export default function ReceptionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: '260px', transition: 'margin-left 0.3s ease' }}>
        <TopNav title="Reception Dashboard" subtitle="Patient check-in & consent management" />
        <main style={{ padding: '24px 32px' }}>{children}</main>
      </div>
    </div>
  );
}
