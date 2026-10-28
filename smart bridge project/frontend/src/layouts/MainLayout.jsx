import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ToastStack from '../components/Toast';

export default function MainLayout({ toasts, onDismissToast, onToast }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column' }} className="main-content-wrapper">
        <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} onToast={onToast} />

        <main style={{ flex: 1, padding: '28px 32px' }} className="main-container">
          <Outlet context={{ onToast }} />
        </main>
      </div>

      <ToastStack toasts={toasts} onDismiss={onDismissToast} />
    </div>
  );
}

