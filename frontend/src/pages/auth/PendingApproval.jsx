import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  LogOut,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

import '../../styles/pending-approval.css';

export const PendingApproval = () => {
  const { logout, user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const handleCheckStatus = async () => {
    try {
      const updatedUser = await refreshUser();

      if (updatedUser?.status === 'approved') {
        navigate('/analyst/dashboard');
        return;
      }

      if (user?.status === 'approved') {
        navigate('/analyst/dashboard');
      }
    } catch (error) {
      console.error(
        'Failed to refresh approval status:',
        error
      );
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/login');
    }
  };

  return (
    <div className="rf-pending-page">

      {/* =====================================================
          1. BACKGROUND
      ===================================================== */}

      <div className="rf-pending-grid" />

      <div className="rf-pending-glow rf-pending-glow-one" />
      <div className="rf-pending-glow rf-pending-glow-two" />


      {/* =====================================================
          2. MAIN CARD
      ===================================================== */}

      <main className="rf-pending-card">

        <div className="rf-pending-accent" />


        {/* ===================================================
            3. STATUS ICON
        =================================================== */}

        <div className="rf-pending-icon">
          <Clock
            size={32}
            strokeWidth={1.8}
          />
        </div>


        {/* ===================================================
            4. HEADING
        =================================================== */}

        <div className="rf-pending-heading">

          <span className="rf-pending-kicker">
            ACCESS CONTROL
          </span>

          <h1 className="rf-pending-title">
            Registration Pending Approval
          </h1>

          <p className="rf-pending-description">
            Your account{' '}
            <span className="rf-pending-email">
              {user?.email || 'request'}
            </span>{' '}
            is currently awaiting Administrator authorization.
          </p>

        </div>


        {/* ===================================================
            5. VERIFICATION STATUS
        =================================================== */}

        <section className="rf-pending-status-box">

          <div className="rf-pending-status-header">
            <span className="rf-pending-status-indicator" />
            VERIFICATION STATUS
          </div>


          <div className="rf-pending-status-row">

            <CheckCircle2
              className="rf-pending-check"
              size={17}
            />

            <span>
              Registration credentials verified and stored
              securely.
            </span>

          </div>


          <div className="rf-pending-status-row">

            <CheckCircle2
              className="rf-pending-check"
              size={17}
            />

            <span>
              Notification sent to System Administrator.
            </span>

          </div>


          <div className="rf-pending-status-row">

            <Clock
              className="rf-pending-clock"
              size={17}
            />

            <span>
              Access to GNN models &amp; Bitcoin graph node
              telemetry will unlock automatically once approved.
            </span>

          </div>

        </section>


        {/* ===================================================
            6. ACTIONS
        =================================================== */}

        <div className="rf-pending-actions">

          <button
            type="button"
            onClick={handleCheckStatus}
            className="rf-pending-primary-button"
          >
            <RefreshCw size={16} />

            <span>
              Refresh Approval Status
            </span>
          </button>


          <button
            type="button"
            onClick={handleLogout}
            className="rf-pending-secondary-button"
          >
            <LogOut size={16} />

            <span>
              Sign Out
            </span>
          </button>

        </div>


        {/* ===================================================
            7. HELP
        =================================================== */}

        <div className="rf-pending-help">

          <div className="rf-pending-help-title">
            Need urgent access?
          </div>

          <div className="rf-pending-help-text">
            Contact system admin at{' '}
            <span className="rf-pending-contact">
              admin@ringfinder.com
            </span>
          </div>

        </div>


        {/* ===================================================
            8. FOOTER
        =================================================== */}

        <footer className="rf-pending-footer">

          <div className="rf-pending-footer-brand">
            <ShieldAlert size={13} />
            <span>
              RINGFINDER SENTINEL
            </span>
          </div>

          <span className="rf-pending-footer-divider">
            •
          </span>

          <span>
            SECURE AI PLATFORM
          </span>

        </footer>

      </main>

    </div>
  );
};

export default PendingApproval;