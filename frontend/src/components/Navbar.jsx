import React from 'react';
import { Bell, ShieldCheck, Cpu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/navbar.css';

export const Navbar = ({ title, subtitle }) => {
  const { user } = useAuth();

  const userName = user?.name || 'User';
  const userRole = user?.role || 'Guest';

  const initials = user?.name
    ? user.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0))
        .join('')
        .toUpperCase()
    : 'RF';

  return (
    <header className="rf-navbar">

      {/* =====================================================
          LEFT — PAGE TITLE
      ===================================================== */}

      <div className="rf-navbar-heading">

        <div className="rf-navbar-title-row">

          <span className="rf-navbar-live-dot"></span>

          <h2 className="rf-navbar-title">
            {title || 'RingFinder System'}
          </h2>

        </div>

        {subtitle && (
          <p className="rf-navbar-subtitle">
            {subtitle}
          </p>
        )}

      </div>


      {/* =====================================================
          RIGHT — SYSTEM STATUS
      ===================================================== */}

      <div className="rf-navbar-right">

        {/* TEMPORAL BOUNDARY */}

        <div className="rf-navbar-status rf-navbar-status-temporal">

          <div className="rf-navbar-status-icon">
            <ShieldCheck size={14} />
          </div>

          <div className="rf-navbar-status-content">

            <span className="rf-navbar-status-label">
              Temporal Boundary
            </span>

            <span className="rf-navbar-status-value">
              2026-01-01
            </span>

          </div>

        </div>


        {/* GNN MODEL */}

        <div className="rf-navbar-status rf-navbar-status-model">

          <div className="rf-navbar-status-icon">
            <Cpu size={14} />
          </div>

          <div className="rf-navbar-status-content">

            <span className="rf-navbar-status-label">
              GNN Model
            </span>

            <span className="rf-navbar-status-value">
              GraphSAGE + Dynamic Temporal
            </span>

          </div>

        </div>


        {/* NOTIFICATION */}

        <button
          type="button"
          className="rf-navbar-notification"
          aria-label="Notifications"
        >
          <Bell size={17} />

          <span className="rf-navbar-notification-dot"></span>
        </button>


        {/* USER */}

        <div className="rf-navbar-user">

          <div className="rf-navbar-avatar">
            {initials}
          </div>

          <div className="rf-navbar-user-info">

            <p className="rf-navbar-user-name">
              {userName}
            </p>

            <p className="rf-navbar-user-role">
              {userRole}
            </p>

          </div>

        </div>

      </div>

    </header>
  );
};

export default Navbar;