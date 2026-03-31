'use client';

import { User, ChevronDown } from 'lucide-react';

interface TopNavProps {
  title: string;
  subtitle?: string;
  deskLabel?: string;
}

export default function TopNav({
  title,
  subtitle,
  deskLabel = 'Reception Desk',
}: TopNavProps) {
  return (
    <header
      style={{
        height: '72px',
        background: '#ebe4dd',
        borderBottom: '1px solid #d7cdc5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        padding: '0 20px',
        position: 'sticky',
        top: 0,
        zIndex: 45,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <h2
          style={{
            fontSize: '28px',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: '#1e1915',
            lineHeight: 1,
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </h2>
        {subtitle && <p style={{ fontSize: '11px', color: '#6f635b', marginTop: '2px' }}>{subtitle}</p>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            borderRadius: '999px',
            padding: '4px 9px 4px 4px',
            border: '1px solid #ddd1c7',
            background: '#f7f2ee',
          }}
        >
          <div
            style={{
              width: '23px',
              height: '23px',
              borderRadius: '999px',
              background: '#ddd3ca',
              color: '#5e534c',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <User size={11} />
          </div>
          <div style={{ lineHeight: 1.1 }}>
            <p style={{ fontSize: '10px', fontWeight: 700, color: '#1e1915' }}>City Care Hospital</p>
            <p style={{ fontSize: '9px', color: '#7c7067' }}>{deskLabel}</p>
          </div>
          <ChevronDown size={12} color="#7c7067" />
        </div>
      </div>
    </header>
  );
}
