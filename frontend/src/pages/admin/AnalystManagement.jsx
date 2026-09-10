// src/pages/admin/AnalystManagement.jsx

import React, { useEffect, useMemo, useState } from 'react';
import {
  Users,
  Search,
  RefreshCw,
  UserCheck,
  UserX,
  ShieldCheck,
  Activity,
} from 'lucide-react';

import DataTable from '../../components/DataTable';
import RiskBadge from '../../components/RiskBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import adminService from '../../services/adminService';

import '../../styles/analyst-management.css';

export const AnalystManagement = () => {
  const [analysts, setAnalysts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState('');

  /* =========================================================
     LOAD ANALYSTS
  ========================================================= */

  const loadAnalysts = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await adminService.getAllAnalysts();

      const data =
        response?.data ??
        response?.analysts ??
        response?.results ??
        response ??
        [];

      setAnalysts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load analyst registry:', error);

      setAnalysts([]);

      showNotification(
        error?.message || 'Unable to load analyst registry.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    loadAnalysts();
  }, []);

  /* =========================================================
     NOTIFICATION
  ========================================================= */

  const showNotification = (message) => {
    setNotification(message);

    window.setTimeout(() => {
      setNotification('');
    }, 3000);
  };

  /* =========================================================
     APPROVE ANALYST
  ========================================================= */

  const handleApprove = async (id) => {
    if (!id) {
      showNotification('Invalid analyst account.');
      return;
    }

    try {
      setActionLoading(id);

      const response = await adminService.approveAnalyst(id);

      if (response?.success === false) {
        throw new Error(
          response?.message || 'Unable to approve analyst.'
        );
      }

      showNotification(
        `Analyst ${
          response?.analyst?.name || id
        } approved successfully.`
      );

      await loadAnalysts(true);
    } catch (error) {
      console.error('Failed to approve analyst:', error);

      showNotification(
        error?.message || 'Unable to approve analyst.'
      );
    } finally {
      setActionLoading(null);
    }
  };

  /* =========================================================
     REJECT ANALYST
  ========================================================= */

  const handleReject = async (id) => {
    if (!id) {
      showNotification('Invalid analyst account.');
      return;
    }

    try {
      setActionLoading(id);

      const response = await adminService.rejectAnalyst(id);

      if (response?.success === false) {
        throw new Error(
          response?.message || 'Unable to reject analyst.'
        );
      }

      showNotification(
        `Analyst ${
          response?.analyst?.name || id
        } registration rejected.`
      );

      await loadAnalysts(true);
    } catch (error) {
      console.error('Failed to reject analyst:', error);

      showNotification(
        error?.message || 'Unable to reject analyst.'
      );
    } finally {
      setActionLoading(null);
    }
  };

  /* =========================================================
     SEARCH FILTER
  ========================================================= */

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return analysts;
    }

    return analysts.filter((analyst) => {
      const name = String(analyst?.name || '').toLowerCase();

      const email = String(
        analyst?.email ||
        analyst?.emailAddress ||
        ''
      ).toLowerCase();

      const organization = String(
        analyst?.organization ||
        analyst?.company ||
        analyst?.institution ||
        ''
      ).toLowerCase();

      const id = String(
        analyst?.id ||
        analyst?._id ||
        analyst?.userId ||
        ''
      ).toLowerCase();

      const status = String(
        analyst?.status ||
        ''
      ).toLowerCase();

      return (
        name.includes(query) ||
        email.includes(query) ||
        organization.includes(query) ||
        id.includes(query) ||
        status.includes(query)
      );
    });
  }, [analysts, search]);

  /* =========================================================
     TABLE COLUMNS
  ========================================================= */

  const columns = [
    {
      header: 'Analyst Name',
      accessor: 'name',

      cell: (row) => {
        const name = row?.name || 'Unknown Analyst';

        const initials = name
          .split(' ')
          .map((part) => part.charAt(0))
          .join('')
          .slice(0, 2)
          .toUpperCase();

        return (
          <div className="rf-analyst-name-cell">
            <div className="rf-analyst-avatar">
              {initials || 'A'}
            </div>

            <div className="rf-analyst-identity">
              <span className="rf-analyst-name">
                {name}
              </span>

              <span className="rf-analyst-id">
                {row?.id ||
                  row?._id ||
                  row?.userId ||
                  'N/A'}
              </span>
            </div>
          </div>
        );
      },
    },

    {
      header: 'Email Address',
      accessor: 'email',

      cell: (row) => (
        <span className="rf-analyst-email">
          {row?.email ||
            row?.emailAddress ||
            'N/A'}
        </span>
      ),
    },

    {
      header: 'Organization',
      accessor: 'organization',

      cell: (row) => (
        <span className="rf-analyst-organization">
          {row?.organization ||
            row?.company ||
            row?.institution ||
            'Independent'}
        </span>
      ),
    },

    {
      header: 'Registration Date',
      accessor: 'registeredAt',

      cell: (row) => {
        const dateValue =
          row?.registeredAt ||
          row?.createdAt ||
          row?.registrationDate ||
          row?.registered_at;

        let formattedDate = 'N/A';

        if (dateValue) {
          const date = new Date(dateValue);

          if (!Number.isNaN(date.getTime())) {
            formattedDate = date.toLocaleDateString(
              'en-IN',
              {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              }
            );
          }
        }

        return (
          <span className="rf-analyst-date">
            {formattedDate}
          </span>
        );
      },
    },

    {
      header: 'Status',
      accessor: 'status',

      cell: (row) => (
        <RiskBadge
          level={
            row?.status || 'UNKNOWN'
          }
        />
      ),
    },

    {
      header: 'Actions',
      accessor: 'id',

      cell: (row) => {
        const id =
          row?.id ||
          row?._id ||
          row?.userId;

        const status = String(
          row?.status || ''
        ).toLowerCase();

        const isProcessing =
          actionLoading === id;

        const actionDisabled =
          isProcessing ||
          actionLoading !== null ||
          refreshing;

        return (
          <div className="rf-analyst-actions">

            {status !== 'approved' && (
              <button
                type="button"
                onClick={() => handleApprove(id)}
                disabled={actionDisabled}
                className="rf-analyst-approve-button"
              >
                {isProcessing ? (
                  <RefreshCw
                    size={13}
                    className="rf-button-spin"
                  />
                ) : (
                  <UserCheck size={13} />
                )}

                {isProcessing
                  ? 'Processing...'
                  : 'Approve'}
              </button>
            )}

            {status !== 'rejected' && (
              <button
                type="button"
                onClick={() => handleReject(id)}
                disabled={actionDisabled}
                className="rf-analyst-reject-button"
              >
                <UserX size={13} />

                {isProcessing
                  ? 'Processing...'
                  : 'Revoke / Reject'}
              </button>
            )}

          </div>
        );
      },
    },
  ];

  /* =========================================================
     DERIVED COUNTS
  ========================================================= */

  const totalAnalysts = analysts.length;

  const approvedCount = analysts.filter(
    (analyst) =>
      String(
        analyst?.status || ''
      ).toLowerCase() === 'approved'
  ).length;

  const pendingCount = analysts.filter(
    (analyst) =>
      String(
        analyst?.status || ''
      ).toLowerCase() === 'pending'
  ).length;

  const rejectedCount = analysts.filter(
    (analyst) =>
      String(
        analyst?.status || ''
      ).toLowerCase() === 'rejected'
  ).length;

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="rf-analyst-management-loading">
        <LoadingSpinner
          label="Loading Analyst Account Registry..."
        />
      </div>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="rf-analyst-management-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="rf-analyst-management-header">
        <div className="rf-analyst-management-header-content">

          <div className="rf-analyst-management-title-group">

            <div className="rf-analyst-management-icon">
              <Users size={21} />
            </div>

            <div>
              <div className="rf-analyst-management-kicker">
                <span />
                USER MANAGEMENT
              </div>

              <h1>
                Registered Analyst Roster
              </h1>

              <p>
                Global User Management, Privilege
                Audits, and Access Controls
              </p>
            </div>

          </div>

          {/* SEARCH */}

          <div className="rf-analyst-search">
            <Search size={15} />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search analysts..."
              aria-label="Search analysts"
            />

            {search && (
              <button
                type="button"
                className="rf-analyst-search-clear"
                onClick={() => setSearch('')}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

        </div>
      </header>

      {/* =====================================================
          STATUS BAR
      ===================================================== */}

      <div className="rf-analyst-status-bar">

        <div className="rf-analyst-status-left">

          <span className="rf-analyst-online-dot" />

          <span className="rf-analyst-status-label">
            ANALYST ACCOUNT REGISTRY
          </span>

          <span className="rf-analyst-status-count">
            {filtered.length} OF {analysts.length}
          </span>

          {search && (
            <span className="rf-analyst-filter-active">
              FILTERED
            </span>
          )}

        </div>

        <button
          type="button"
          className="rf-analyst-refresh"
          onClick={() => loadAnalysts(true)}
          disabled={refreshing || actionLoading !== null}
        >
          <RefreshCw
            size={13}
            className={
              refreshing
                ? 'rf-button-spin'
                : ''
            }
          />

          {refreshing
            ? 'Refreshing...'
            : 'Refresh Registry'}
        </button>

      </div>

      {/* =====================================================
          NOTIFICATION
      ===================================================== */}

      {notification && (
        <div className="rf-analyst-notification">

          <div className="rf-analyst-notification-icon">
            <ShieldCheck size={14} />
          </div>

          <span>
            {notification}
          </span>

        </div>
      )}

      {/* =====================================================
          REGISTRY SUMMARY
      ===================================================== */}

      <div className="rf-analyst-summary-grid">

        {/* TOTAL */}

        <div className="rf-analyst-summary-card">
          <div className="rf-analyst-summary-icon">
            <Users size={17} />
          </div>

          <div>
            <span>Total Analysts</span>
            <strong>{totalAnalysts}</strong>
          </div>
        </div>

        {/* APPROVED */}

        <div className="rf-analyst-summary-card">
          <div className="rf-analyst-summary-icon rf-summary-approved">
            <UserCheck size={17} />
          </div>

          <div>
            <span>Approved</span>
            <strong>{approvedCount}</strong>
          </div>
        </div>

        {/* PENDING */}

        <div className="rf-analyst-summary-card">
          <div className="rf-analyst-summary-icon rf-summary-pending">
            <Activity size={17} />
          </div>

          <div>
            <span>Pending</span>
            <strong>{pendingCount}</strong>
          </div>
        </div>

        {/* REJECTED */}

        <div className="rf-analyst-summary-card">
          <div className="rf-analyst-summary-icon rf-summary-rejected">
            <UserX size={17} />
          </div>

          <div>
            <span>Rejected</span>
            <strong>{rejectedCount}</strong>
          </div>
        </div>

      </div>

      {/* =====================================================
          TABLE
      ===================================================== */}

      <section className="rf-analyst-table-section">

        <div className="rf-analyst-table-header">

          <div>
            <div className="rf-analyst-table-kicker">
              ACCESS DIRECTORY
            </div>

            <h2>
              Analyst Accounts
            </h2>

            <p>
              Manage analyst authorization and
              account privileges.
            </p>
          </div>

          <span className="rf-analyst-table-total">
            {analysts.length} REGISTERED
          </span>

        </div>

        <DataTable
          columns={columns}
          data={filtered}
          emptyMessage={
            search
              ? 'No analysts match the current search query'
              : 'No analysts are currently registered'
          }
        />

      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <div className="rf-analyst-management-footer">

        <div className="rf-analyst-footer-status">
          <span />
          ADMIN ACCESS CONTROL CHANNEL ONLINE
        </div>

        <div className="rf-analyst-footer-text">
          Analyst privilege changes are recorded
          in the system audit log.
        </div>

      </div>

    </div>
  );
};

export default AnalystManagement;