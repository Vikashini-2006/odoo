import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute({ user, allowedRoles }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const fallback = user.role === 'HR_ADMIN' ? '/hr-dashboard' : '/employee-dashboard';
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}
