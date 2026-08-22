import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'indigo' }) {
  const colorMap = {
    indigo: { bg: '#eef2ff', text: '#4f46e5', border: '#c7d2fe' },
    emerald: { bg: '#ecfdf5', text: '#10b981', border: '#a7f3d0' },
    amber: { bg: '#fffbeb', text: '#f59e0b', border: '#fde68a' },
    rose: { bg: '#fef2f2', text: '#ef4444', border: '#fecaca' },
    cyan: { bg: '#ecfeff', text: '#06b6d4', border: '#a5f3fc' },
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>{title}</span>
        {Icon && (
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: scheme.bg,
              color: scheme.text,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={22} />
          </div>
        )}
      </div>

      <div>
        <h3 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          {value}
        </h3>
        {subtitle && (
          <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            {trend && (
              <span
                style={{
                  fontWeight: 700,
                  color: trend.startsWith('+') ? '#10b981' : '#ef4444',
                }}
              >
                {trend}
              </span>
            )}
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
