'use client';

import { Bell, Search, User } from 'lucide-react';

interface TopNavProps {
  title: string;
  subtitle?: string;
  deskLabel?: string;
  onNotificationClick?: () => void;
  onQuickSearch?: (term: string) => void;
}

export default function TopNav({
  title,
  subtitle,
  deskLabel = 'Reception Desk',
  onNotificationClick,
  onQuickSearch,
}: TopNavProps) {
  return (
    <header
      style={{
        height: '72px',
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backdropFilter: 'blur(12px)',
        backgroundColor: 'rgba(255,255,255,0.9)',
      }}
    >
      {/* Left - Page Title */}
      <div>
        <h2
          style={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#0f172a',
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: '13px', color: '#475569', marginTop: '2px' }}>{subtitle}</p>
        )}
      </div>

      {/* Right - Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Search */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '10px',
            background: '#f1f5f9',
            border: '1px solid #e2e8f0',
            width: '240px',
          }}
        >
          <Search size={16} color="#94a3b8" />
          <input
            type="text"
            placeholder="Quick search..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const value = (e.target as HTMLInputElement).value;
                if (onQuickSearch) {
                  onQuickSearch(value);
                } else {
                  alert(`Search triggered for: ${value}`);
                }
              }
            }}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '13px',
              color: '#0f172a',
              width: '100%',
            }}
          />
        </div>

        {/* Notification Bell */}
        <button
          onClick={() => {
            if (onNotificationClick) {
              onNotificationClick();
            } else {
              alert('No new notifications yet.');
            }
          }}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: '#f1f5f9',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            cursor: 'pointer',
          }}
        >
          <Bell size={18} color="#475569" />
          <span
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#ef4444',
              border: '2px solid #ffffff',
            }}
          />
        </button>

        {/* User Avatar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '6px 12px 6px 6px',
            borderRadius: '10px',
            background: '#f1f5f9',
            border: '1px solid #e2e8f0',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0f766e, #14b8a6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <User size={16} color="#ffffff" />
          </div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', lineHeight: 1.2 }}>
              City Care Hospital
            </p>
            <p style={{ fontSize: '11px', color: '#475569' }}>{deskLabel}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
