import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import api from './api';
import './styles/global.css';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Loading from './components/Loading';

import Login from './pages/Login';
import EmployeeDashboard from './pages/EmployeeDashboard';
import HRDashboard from './pages/HRDashboard';
import Profile from './pages/Profile';
import Attendance from './pages/Attendance';
import LeaveManagement from './pages/LeaveManagement';
import LeaveApprovals from './pages/LeaveApprovals';
import Employees from './pages/Employees';
import EmployeeDetails from './pages/EmployeeDetails';
import Payroll from './pages/Payroll';
import ActionCenter from './pages/ActionCenter';
import Analytics from './pages/Analytics';
import NotFound from './pages/NotFound';

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/api/auth/me');
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
    } catch (err) {
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [token]);

  const handleLoginSuccess = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <Loading message="Authenticating Dayflow workspace session..." />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Route */}
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to={user.role === 'HR_ADMIN' ? '/hr-dashboard' : '/employee-dashboard'} replace />
            ) : (
              <Login onLoginSuccess={handleLoginSuccess} />
            )
          }
        />

        {/* Protected Authenticated Routes */}
        <Route element={<ProtectedRoute user={user} />}>
          <Route element={<Layout user={user} onLogout={handleLogout} />}>
            {/* Dashboard Redirect Default */}
            <Route
              path="/"
              element={
                <Navigate to={user?.role === 'HR_ADMIN' ? '/hr-dashboard' : '/employee-dashboard'} replace />
              }
            />

            {/* Employee Dash */}
            <Route
              path="/employee-dashboard"
              element={<ProtectedRoute user={user} allowedRoles={['EMPLOYEE', 'HR_ADMIN']} />}
            >
              <Route index element={<EmployeeDashboard />} />
            </Route>

            {/* HR Dash */}
            <Route
              path="/hr-dashboard"
              element={<ProtectedRoute user={user} allowedRoles={['HR_ADMIN']} />}
            >
              <Route index element={<HRDashboard />} />
            </Route>

            {/* HR Action Center */}
            <Route
              path="/action-center"
              element={<ProtectedRoute user={user} allowedRoles={['HR_ADMIN']} />}
            >
              <Route index element={<ActionCenter />} />
            </Route>

            {/* HR Workforce Analytics */}
            <Route
              path="/analytics"
              element={<ProtectedRoute user={user} allowedRoles={['HR_ADMIN']} />}
            >
              <Route index element={<Analytics />} />
            </Route>

            {/* Profile */}
            <Route path="/profile" element={<Profile user={user} onUserUpdated={fetchCurrentUser} />} />

            {/* Attendance */}
            <Route path="/attendance" element={<Attendance user={user} />} />

            {/* Leave Management (Employee) */}
            <Route
              path="/leaves"
              element={<ProtectedRoute user={user} allowedRoles={['EMPLOYEE', 'HR_ADMIN']} />}
            >
              <Route index element={<LeaveManagement />} />
            </Route>

            {/* Leave Approvals (HR) */}
            <Route
              path="/leave-approvals"
              element={<ProtectedRoute user={user} allowedRoles={['HR_ADMIN']} />}
            >
              <Route index element={<LeaveApprovals />} />
            </Route>

            {/* Employee Directory & Inspection (HR) */}
            <Route
              path="/employees"
              element={<ProtectedRoute user={user} allowedRoles={['HR_ADMIN']} />}
            >
              <Route index element={<Employees />} />
              <Route path=":id" element={<EmployeeDetails />} />
            </Route>

            {/* Payroll (Employee & HR) */}
            <Route path="/payroll" element={<Payroll user={user} />} />

            {/* 404 Catch All */}
            <Route path="*" element={<NotFound user={user} />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

