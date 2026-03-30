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
  Heart,
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

const SIDEBAR_EXPANDED_WIDTH = 260;
const SIDEBAR_COLLAPSED_WIDTH = 72;

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
        background: 'linear-gradient(180deg, #134e4a 0%, #0f766e 50%, #115e59 100%)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 50,
        boxShadow: '4px 0 24px rgba(0,0,0,0.1)',
      }}
    >
      {/* Logo Area */}
      <div
        style={{
          padding: collapsed ? '24px 12px' : '24px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Heart size={22} color="#5eead4" fill="#5eead4" />
        </div>
        {!collapsed && (
          <div>
            <h1
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              SwasthSetu
            </h1>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>
              Care Continuity Platform
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ padding: '16px 12px', flex: 1 }}>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href) && item.href !== '#';
            const Icon = item.icon;
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: collapsed ? '12px' : '12px 16px',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    color: isActive ? '#ffffff' : 'rgba(255,255,255,0.6)',
                    background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                    fontSize: '14px',
                    fontWeight: isActive ? 600 : 400,
                    transition: 'all 0.2s ease',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <Icon size={20} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      <div
        style={{
          padding: '16px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(255,255,255,0.05)',
            color: 'rgba(255,255,255,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '13px',
          }}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed && 'Collapse'}
        </button>
      </div>
    </aside>
  );
}
