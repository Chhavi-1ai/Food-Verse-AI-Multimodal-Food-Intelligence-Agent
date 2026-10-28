import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  badgeColor = '#15803d',
  badgeBg = '#dcfce7',
}) {
  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '14px',
        padding: '20px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 12px -2px rgba(22, 101, 52, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
      }}
      className="hover-card"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {title}
          </span>
          <div style={{ fontSize: '1.65rem', fontWeight: 700, color: '#0f172a', marginTop: '6px' }}>
            {value}
          </div>
        </div>
        {Icon && (
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#f0fdf4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#15803d',
            }}
          >
            <Icon size={24} />
          </div>
        )}
      </div>

      {(subtitle || badge) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', fontSize: '0.82rem' }}>
          {badge && (
            <span
              style={{
                backgroundColor: badgeBg,
                color: badgeColor,
                padding: '2px 8px',
                borderRadius: '999px',
                fontWeight: 600,
                fontSize: '0.75rem',
              }}
            >
              {badge}
            </span>
          )}
          {subtitle && <span style={{ color: '#64748b' }}>{subtitle}</span>}
        </div>
      )}
    </div>
  );
}

