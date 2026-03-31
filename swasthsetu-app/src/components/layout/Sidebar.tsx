'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileText,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { type UserRole } from '@/lib/auth';

type NavItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
};

const navItemsByRole: Record<UserRole, NavItem[]> = {
  reception: [
    { label: 'Reception', href: '/reception', icon: LayoutDashboard },
    { label: 'Patients', href: '/reception', icon: Users },
  ],
  doctor: [
    { label: 'Doctor View', href: '/doctor', icon: Stethoscope },
    { label: 'Records', href: '/doctor', icon: FileText },
  ],
};

interface SidebarProps {
  role: UserRole;
}

const SIDEBAR_EXPANDED_WIDTH = 238;
const SIDEBAR_COLLAPSED_WIDTH = 76;

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const navItems = navItemsByRole[role];
  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH;

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.style.setProperty('--app-sidebar-width', `${sidebarWidth}px`);
  }, [sidebarWidth]);

  return (
    <aside
      style={{
        width: `${sidebarWidth}px`,
        minHeight: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 60,
        transition: 'width 0.26s ease',
        background: '#050505',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <button suppressHydrationWarning
        onClick={() => setCollapsed((prev) => !prev)}
        style={{
          position: 'absolute',
          right: '-11px',
          top: '24px',
          width: '22px',
          height: '22px',
          borderRadius: '999px',
          border: '1px solid #d8d1cb',
          background: '#f4efea',
          color: '#5f554d',
          display: 'grid',
          placeItems: 'center',
          padding: 0,
          zIndex: 4,
        }}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      <div
        style={{
          padding: collapsed ? '20px 8px 16px' : '18px 16px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: '8px',
        }}
      >
        <div
          style={{
            width: '18px',
            height: '18px',
            borderRadius: '999px',
            border: '3px solid #f1662a',
            boxShadow: 'inset 0 0 0 2px #050505',
          }}
        />
        {!collapsed && (
          <h1 style={{ color: '#ffffff', fontSize: '25px', fontWeight: 700, lineHeight: 1 }}>
            SwasthSetu
          </h1>
        )}
      </div>

      <nav style={{ padding: collapsed ? '12px 8px 0' : '16px 12px 0', flex: 1 }}>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    gap: '11px',
                    minHeight: '44px',
                    borderRadius: '999px',
                    padding: collapsed ? '0' : '0 14px',
                    textDecoration: 'none',
                    fontSize: '15px',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#f1662a' : '#d3cec8',
                    background: isActive ? '#f4efea' : 'transparent',
                  }}
                  onMouseEnter={(event) => {
                    if (isActive) return;
                    event.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  }}
                  onMouseLeave={(event) => {
                    if (isActive) return;
                    event.currentTarget.style.background = 'transparent';
                  }}
                >
                  <Icon size={16} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

