import React, { useEffect, useState } from 'react';
import {
  History,
  Download,
  RefreshCw,
} from 'lucide-react';

import DataTable from '../../components/DataTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import adminService from '../../services/adminService';

import '../../styles/activity-logs.css';

export const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /* =========================================================
     FETCH AUDIT LOGS
     ========================================================= */

  const fetchLogs = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await adminService.getActivityLogs();

      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(
        'Failed to fetch activity logs:',
        err
      );

      setLogs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =========================================================
     INITIAL LOAD
     ========================================================= */

  useEffect(() => {
    fetchLogs();
  }, []);

  /* =========================================================
     EXPORT
     ========================================================= */

  const handleExport = () => {
    alert('Exporting System Audit Log...');
  };

  /* =========================================================
     REFRESH
     ========================================================= */

  const handleRefresh = () => {
    fetchLogs(true);
  };

  /* =========================================================
     TABLE COLUMNS
     ========================================================= */

  const columns = [
    {
      header: 'Timestamp',
      accessor: 'timestamp',

      cell: (row) => (
        <span className="rf-log-timestamp">
          {row.timestamp || '—'}
        </span>
      ),
    },

    {
      header: 'User Account',
      accessor: 'user',

      cell: (row) => (
        <span className="rf-log-user">
          {row.user || 'SYSTEM'}
        </span>
      ),
    },

    {
      header: 'Action Taken',
      accessor: 'action',

      cell: (row) => (
        <span className="rf-log-action">
          {row.action || 'UNKNOWN_ACTION'}
        </span>
      ),
    },

    {
      header: 'Action Details',
      accessor: 'details',

      cell: (row) => (
        <span className="rf-log-details">
          {row.details ||
            'No additional details available'}
        </span>
      ),
    },
  ];

  return (
    <div className="rf-page rf-activity-page">

      {/* =====================================================
          PAGE HEADER
          ===================================================== */}

      <section className="rf-page-header rf-audit-header">

        <div className="rf-page-header-content">

          <div className="rf-page-heading">

            <div className="rf-page-heading-icon">
              <History size={20} />
            </div>

            <div>
              <h2 className="rf-page-title">
                Platform Cryptographic Audit Logs
              </h2>

              <p className="rf-page-subtitle">
                Immutable Historical Log of Platform
                Actions &amp; Analyst Operations
              </p>
            </div>

          </div>

          <div className="rf-audit-actions">

            <button
              type="button"
              className="rf-secondary-button"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw
                size={14}
                className={
                  refreshing
                    ? 'rf-button-spin'
                    : ''
                }
              />

              <span>
                {refreshing
                  ? 'Refreshing'
                  : 'Refresh'}
              </span>
            </button>

            <button
              type="button"
              className="rf-primary-button"
              onClick={handleExport}
            >
              <Download size={14} />

              <span>
                Export System Logs
              </span>
            </button>

          </div>

        </div>

      </section>


      {/* =====================================================
          AUDIT STATUS
          ===================================================== */}

      <section className="rf-audit-status">

        <div className="rf-audit-status-item">

          <span className="rf-audit-status-dot"></span>

          <div className="rf-audit-status-copy">
            <span className="rf-audit-status-label">
              AUDIT ENGINE
            </span>

            <strong>
              ACTIVE
            </strong>
          </div>

        </div>


        <div className="rf-audit-divider"></div>


        <div className="rf-audit-status-item">

          <span className="rf-audit-status-icon">
            {logs.length}
          </span>

          <div className="rf-audit-status-copy">
            <span className="rf-audit-status-label">
              RECORDS
            </span>

            <strong>
              {logs.length}
            </strong>
          </div>

        </div>


        <div className="rf-audit-divider"></div>


        <div className="rf-audit-status-item">

          <span className="rf-audit-status-dot"></span>

          <div className="rf-audit-status-copy">
            <span className="rf-audit-status-label">
              INTEGRITY
            </span>

            <strong>
              VERIFIED
            </strong>
          </div>

        </div>

      </section>


      {/* =====================================================
          AUDIT TABLE
          ===================================================== */}

      <section className="rf-audit-table-section">

        <div className="rf-section-heading">

          <div>
            <h3>
              Audit Trail
            </h3>

            <p>
              Chronological record of administrative
              and analyst activity
            </p>
          </div>

          <span className="rf-live-indicator">
            <span></span>
            LIVE
          </span>

        </div>


        {loading ? (
          <div className="rf-audit-loading">
            <LoadingSpinner
              label="Fetching Audit Trail Records..."
            />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={logs}
            emptyMessage="No audit records found"
          />
        )}

      </section>

    </div>
  );
};

export default ActivityLogs;