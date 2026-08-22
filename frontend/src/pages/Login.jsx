import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import api from '../api';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { access_token, user } = response.data;
      
      onLoginSuccess(access_token, user);
      
      if (user.role === 'HR_ADMIN') {
        navigate('/hr-dashboard');
      } else {
        navigate('/employee-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (quickEmail, quickPassword) => {
    setEmail(quickEmail);
    setPassword(quickPassword);
    setLoading(true);
    setError('');

    api.post('/api/auth/login', { email: quickEmail, password: quickPassword })
      .then((res) => {
        const { access_token, user } = res.data;
        onLoginSuccess(access_token, user);
        if (user.role === 'HR_ADMIN') {
          navigate('/hr-dashboard');
        } else {
          navigate('/employee-dashboard');
        }
      })
      .catch((err) => {
        setError(err.response?.data?.detail || 'Quick login failed.');
      })
      .finally(() => setLoading(false));
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: '#ffffff',
          borderRadius: '24px',
          padding: '2.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Brand Logo Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 20px rgba(79, 70, 229, 0.35)',
              marginBottom: '1rem',
            }}
          >
            <Zap size={30} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            DAYFLOW
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600, marginTop: '0.25rem' }}>
            Every Workday, Perfectly Aligned.
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '0.875rem 1rem',
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '10px',
              color: '#991b1b',
              fontSize: '0.875rem',
              fontWeight: 600,
              marginBottom: '1.25rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Work Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: '#94a3b8' }} />
              <input
                type="email"
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="name@dayflow.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: '#94a3b8' }} />
              <input
                type="password"
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Workspace'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        {/* Quick Demo Access Bar */}
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 800, color: '#94a3b8', textAlign: 'center', marginBottom: '0.875rem', letterSpacing: '0.05em' }}>
            1-Click Demo Login Shortcuts
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button
              onClick={() => handleQuickLogin('hr@dayflow.com', 'Admin@123')}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', flexDirection: 'column', padding: '0.625rem', height: 'auto', textAlign: 'left' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 700, color: '#4f46e5' }}>
                <ShieldCheck size={16} /> HR Admin
              </div>
              <span style={{ fontSize: '0.675rem', color: '#64748b', marginTop: '0.125rem' }}>hr@dayflow.com</span>
            </button>

            <button
              onClick={() => handleQuickLogin('alex.dev@dayflow.com', 'User@123')}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', flexDirection: 'column', padding: '0.625rem', height: 'auto', textAlign: 'left' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 700, color: '#10b981' }}>
                <UserCheck size={16} /> Employee
              </div>
              <span style={{ fontSize: '0.675rem', color: '#64748b', marginTop: '0.125rem' }}>alex.dev@dayflow.com</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
