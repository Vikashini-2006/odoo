import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading({ message = 'Loading Dayflow data...' }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 2rem',
        width: '100%',
        minHeight: '300px',
      }}
    >
      <Loader2
        size={36}
        style={{
          color: '#4f46e5',
          animation: 'spin 1s linear infinite',
          marginBottom: '1rem',
        }}
      />
      <p style={{ color: '#64748b', fontSize: '0.925rem', fontWeight: 500 }}>{message}</p>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
