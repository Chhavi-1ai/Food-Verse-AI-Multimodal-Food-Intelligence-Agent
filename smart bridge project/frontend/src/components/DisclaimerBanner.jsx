import React from 'react';
import { AlertTriangle, Info, ShieldAlert } from 'lucide-react';

export default function DisclaimerBanner({
  type = 'warning',
  title = 'Important Food Safety Notice',
  children,
}) {
  const isDanger = type === 'danger';
  const isInfo = type === 'info';

  const bg = isDanger ? '#fef2f2' : isInfo ? '#f0fdf4' : '#fffbeb';
  const border = isDanger ? '#fca5a5' : isInfo ? '#86efac' : '#fde68a';
  const color = isDanger ? '#991b1b' : isInfo ? '#166534' : '#92400e';
  const iconColor = isDanger ? '#dc2626' : isInfo ? '#16a34a' : '#d97706';

  const IconComponent = isDanger ? ShieldAlert : isInfo ? Info : AlertTriangle;

  return (
    <div
      style={{
        backgroundColor: bg,
        border: `1px solid ${border}`,
        borderRadius: '12px',
        padding: '14px 18px',
        margin: '16px 0',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        color: color,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <IconComponent size={22} style={{ color: iconColor, flexShrink: 0, marginTop: '2px' }} />
      <div style={{ flex: 1, fontSize: '0.88rem', lineHeight: '1.45' }}>
        {title && <strong style={{ display: 'block', marginBottom: '3px', fontWeight: 600 }}>{title}</strong>}
        {children}
      </div>
    </div>
  );
}

