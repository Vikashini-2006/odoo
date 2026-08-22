import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There are no items to display at this time.',
  action,
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3.5rem 2rem',
        textAlign: 'center',
        background: '#ffffff',
        border: '1px dashed #cbd5e1',
        borderRadius: '16px',
        margin: '1rem 0',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#eef2ff',
          color: '#4f46e5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
        }}
      >
        <Icon size={28} />
      </div>
      <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.375rem' }}>
        {title}
      </h4>
      <p style={{ color: '#64748b', fontSize: '0.875rem', maxWidth: '360px', marginBottom: action ? '1.25rem' : 0 }}>
        {description}
      </p>
      {action && action}
    </div>
  );
}
