import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ user, onLogout }) {
  return (
    <div className="app-container">
      <Sidebar user={user} />
      <div className="main-wrapper">
        <Header user={user} onLogout={onLogout} />
        <main className="content-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
