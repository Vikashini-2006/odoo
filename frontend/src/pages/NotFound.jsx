import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';

export default function NotFound({ user }) {
  const navigate = useNavigate();

  const handleReturn = () => {
    if (!user) {
      navigate('/login');
    } else if (user.role === 'HR_ADMIN') {
      navigate('/hr-dashboard');
    } else {
      navigate('/employee-dashboard');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '5rem 2rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: '#fee2e2',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem',
        }}
      >
        <HelpCircle size={36} />
      </div>

      <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
        404 - Page Not Found
      </h1>
      <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '420px', marginBottom: '1.5rem' }}>
        The page or resource you requested could not be located on the Dayflow system workspace.
      </p>

      <button onClick={handleReturn} className="btn btn-primary">
        <ArrowLeft size={18} /> Return to Workspace Dashboard
      </button>
    </div>
  );
}
