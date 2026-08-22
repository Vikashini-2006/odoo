import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export default function ToastNotification({ type = 'info', message, onClose }) {
  if (!message) return null;

  const bgStyles = {
    success: 'background: #ecfdf5; border-color: #10b981; color: #065f46;',
    error: 'background: #fef2f2; border-color: #ef4444; color: #991b1b;',
    warning: 'background: #fffbeb; border-color: #f59e0b; color: #92400e;',
    info: 'background: #eff6ff; border-color: #3b82f6; color: #1e40af;',
  };

  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertCircle,
    info: Info,
  }[type] || Info;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.875rem 1.25rem',
        borderRadius: '10px',
        border: '1px solid',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
        style: bgStyles[type],
        maxWidth: '420px',
        animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <Icon size={20} />
      <span style={{ fontSize: '0.875rem', fontWeight: 600, flex: 1 }}>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'inherit', display: 'flex' }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
