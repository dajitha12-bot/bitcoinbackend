import React from 'react';
import { Outlet } from 'react-router-dom';

import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { FloatingChatbot } from '../components/FloatingChatbot';

export const AdminLayout = () => {
  return (
    <div className="app-layout">

      {/* =====================================================
          ADMIN SIDEBAR
          ===================================================== */}

      <Sidebar role="admin" />


      {/* =====================================================
          MAIN APPLICATION AREA
          ===================================================== */}

      <div className="main-content">

        <Navbar
          title="RingFinder System Administration"
          subtitle="Platform Controls, Approvals & System Operations"
        />

        {/* ===================================================
            PAGE CONTENT
            =================================================== */}

        <main className="page-container">
          <Outlet />
        </main>

        <FloatingChatbot role="admin" />

      </div>

    </div>
  );
};

export default AdminLayout;