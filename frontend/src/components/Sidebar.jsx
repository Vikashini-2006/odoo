import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CalendarDays,
  FileCheck2,
  DollarSign,
  UserCircle,
  BarChart2,
  ShieldAlert,
  Zap,
} from 'lucide-react';

export default function Sidebar({ user }) {
  const isHR = user?.role === 'HR_ADMIN';

  const employeeLinks = [
    { to: '/employee-dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    { to: '/profile', label: 'My Profile', icon: UserCircle },
    { to: '/attendance', label: 'My Attendance', icon: CalendarCheck },
    { to: '/leaves', label: 'Leave Requests', icon: CalendarDays },
    { to: '/payroll', label: 'My Payroll', icon: DollarSign },
  ];

  const hrLinks = [
    { to: '/hr-dashboard', label: 'HR Dashboard', icon: LayoutDashboard },
    { to: '/action-center', label: 'Action Center', icon: ShieldAlert },
    { to: '/analytics', label: 'Workforce Analytics', icon: BarChart2 },
    { to: '/employees', label: 'Employees Directory', icon: Users },
    { to: '/attendance', label: 'Attendance Master', icon: CalendarCheck },
    { to: '/leave-approvals', label: 'Leave Approvals', icon: FileCheck2 },
    { to: '/payroll', label: 'Payroll Manager', icon: DollarSign },
  ];

  const links = isHR ? hrLinks : employeeLinks;

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        boxShadow: '4px 0 12px rgba(0,0,0,0.1)',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
          }}
        >
          <Zap size={22} color="#ffffff" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
            DAYFLOW
          </h1>
          <p style={{ fontSize: '0.675rem', color: '#94a3b8', fontWeight: 600 }}>
            Every Workday, Aligned
          </p>
        </div>
      </div>

      {/* Role Badge */}
      <div style={{ padding: '1.25rem 1.5rem 0.5rem 1.5rem' }}>
        <div
          style={{
            backgroundColor: isHR ? 'rgba(99, 102, 241, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            border: `1px solid ${isHR ? 'rgba(99, 102, 241, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
            borderRadius: '8px',
            padding: '0.5rem 0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 800, color: isHR ? '#818cf8' : '#34d399' }}>
            {isHR ? 'HR Intelligence' : 'Employee Portal'}
          </span>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isHR ? '#818cf8' : '#34d399' }} />
        </div>
      </div>

      {/* Navigation Menu */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.875rem',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                fontSize: '0.875rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#ffffff' : '#94a3b8',
                backgroundColor: isActive ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                borderLeft: isActive ? '4px solid #6366f1' : '4px solid transparent',
                transition: 'all 0.15s ease',
              })}
            >
              <Icon size={18} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          fontSize: '0.75rem',
          color: '#64748b',
          textAlign: 'center',
        }}
      >
        Dayflow Intelligence v2.0
      </div>
    </aside>
  );
}
