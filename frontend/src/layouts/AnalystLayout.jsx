import React from 'react';
import { Outlet } from 'react-router-dom';

import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export const AnalystLayout = () => {
  return (
    <div className="app-layout">

      {/* =====================================================
          ANALYST SIDEBAR
          ===================================================== */}

      <Sidebar role="analyst" />


      {/* =====================================================
          MAIN APPLICATION AREA
          ===================================================== */}

      <div className="main-content">

        <Navbar
          title="RingFinder Fraud Analyst Portal"
          subtitle="Temporal Graph Neural Network Workspace"
        />

        {/* ===================================================
            PAGE CONTENT
            =================================================== */}

        <main className="page-container">
          <Outlet />
        </main>

      </div>

    </div>
  );
};

export default AnalystLayout;