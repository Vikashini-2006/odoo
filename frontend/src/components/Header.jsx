import React, { useState, useEffect } from 'react';
import { LogOut, User as UserIcon, Clock, Bell, Check, CheckCheck, AlertCircle, Info, X } from 'lucide-react';
import api from '../api';

export default function Header({ user, onLogout }) {
  const [todayStatus, setTodayStatus] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user?.role === 'EMPLOYEE') {
      api.get('/api/dashboard/employee')
        .then((res) => {
          setTodayStatus(res.data.today_attendance);
        })
        .catch(() => {});
    }

    if (user) {
      fetchNotifications();
      // Periodically refresh notifications
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/api/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = () => {
    if (!todayStatus) return { label: 'Not Checked In', color: '#f59e0b', bg: '#fef3c7' };
    if (todayStatus.check_out) return { label: `Checked Out (${todayStatus.working_hours} hrs)`, color: '#64748b', bg: '#f1f5f9' };
    return { label: `Checked In at ${new Date(todayStatus.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, color: '#10b981', bg: '#d1fae5' };
  };

  const badge = getStatusBadge();

  return (
    <header
      style={{
        height: '70px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        position: 'relative',
        zIndex: 50,
      }}
    >
      {/* Page / System Welcome */}
      <div>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>
          {user?.full_name || 'User Workspace'}
        </h2>
        <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
          {user?.role === 'HR_ADMIN' ? 'HR Administrative & Intelligence Platform' : 'Employee Self-Service Portal'}
        </p>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Employee Today Status Indicator */}
        {user?.role === 'EMPLOYEE' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 0.875rem',
              borderRadius: '20px',
              backgroundColor: badge.bg,
              color: badge.color,
              fontSize: '0.8rem',
              fontWeight: 700,
            }}
          >
            <Clock size={16} />
            <span>{badge.label}</span>
          </div>
        )}

        {/* Smart Notification Bell Icon */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: unreadCount > 0 ? '#4f46e5' : '#64748b',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.675rem',
                  fontWeight: 800,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #ffffff',
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown Panel */}
          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: '50px',
                right: '0',
                width: '360px',
                maxHeight: '480px',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                boxShadow: '0 15px 30px rgba(0,0,0,0.15)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                zIndex: 1000,
              }}
            >
              <div
                style={{
                  padding: '1rem 1.25rem',
                  borderBottom: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Bell size={18} color="#4f46e5" />
                  <span style={{ fontWeight: 700, fontSize: '0.925rem', color: '#0f172a' }}>Smart Notifications</span>
                  {unreadCount > 0 && (
                    <span className="badge badge-info">{unreadCount} new</span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    style={{ fontSize: '0.75rem', color: '#4f46e5', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    <CheckCheck size={14} /> Mark all read
                  </button>
                )}
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
                    No system notifications at this time.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      style={{
                        padding: '0.875rem 1rem',
                        borderRadius: '10px',
                        marginBottom: '0.375rem',
                        backgroundColor: n.is_read ? '#ffffff' : '#eef2ff',
                        borderLeft: `4px solid ${n.severity === 'HIGH' ? '#ef4444' : n.severity === 'MEDIUM' ? '#f59e0b' : '#10b981'}`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>{n.title}</span>
                        {!n.is_read && (
                          <button
                            onClick={() => handleMarkAsRead(n.id)}
                            title="Mark as read"
                            style={{ color: '#6366f1', padding: '0.125rem' }}
                          >
                            <Check size={14} />
                          </button>
                        )}
                      </div>
                      <p style={{ fontSize: '0.775rem', color: '#64748b', margin: 0 }}>{n.description}</p>
                      <span style={{ fontSize: '0.675rem', color: '#94a3b8', marginTop: '0.125rem' }}>
                        {new Date(n.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {user?.profile_image ? (
            <img
              src={user.profile_image}
              alt="Avatar"
              style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }}
            />
          ) : (
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#eef2ff',
                color: '#4f46e5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
              }}
            >
              <UserIcon size={20} />
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
              {user?.full_name || user?.email}
            </span>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
              {user?.employee_code || user?.role}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          title="Logout"
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
