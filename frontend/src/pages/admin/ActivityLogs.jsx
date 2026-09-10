import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  History,
  Download,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

import DataTable from '../../components/DataTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import adminService from '../../services/adminService';

import '../../styles/activity-logs.css';


/* ============================================================
   ADMIN ACTIVITY LOGS
   Real Django API Integration
   ============================================================ */

export const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');


  /* ==========================================================
     NORMALIZE BACKEND RESPONSE
     ========================================================== */

  const normalizeLogs = (response) => {
    if (!response) {
      return [];
    }

    if (Array.isArray(response)) {
      return response;
    }

    const source =
      response?.data ||
      response;

    if (Array.isArray(source)) {
      return source;
    }

    if (Array.isArray(source?.results)) {
      return source.results;
    }

    if (Array.isArray(source?.logs)) {
      return source.logs;
    }

    if (Array.isArray(source?.activityLogs)) {
      return source.activityLogs;
    }

    if (Array.isArray(source?.activity_logs)) {
      return source.activity_logs;
    }

    return [];
  };


  /* ==========================================================
     NORMALIZE INDIVIDUAL LOG
     ========================================================== */

  const normalizeLog = (log, index) => {
    if (!log) {
      return {
        id: index,
        timestamp: '—',
        user: 'SYSTEM',
        action: 'UNKNOWN_ACTION',
        details: 'No additional details available',
      };
    }

    const userObject =
      log?.user ||
      log?.user_account ||
      log?.userAccount;

    const userName =
      typeof userObject === 'object'
        ? (
            userObject?.username ||
            userObject?.email ||
            userObject?.name ||
            userObject?.username ||
            'SYSTEM'
          )
        : (
            userObject ||
            log?.username ||
            log?.email ||
            'SYSTEM'
          );

    const timestamp =
      log?.timestamp ||
      log?.created_at ||
      log?.createdAt ||
      log?.date ||
      log?.datetime ||
      '—';

    const action =
      log?.action ||
      log?.action_type ||
      log?.actionType ||
      log?.event ||
      log?.event_type ||
      log?.eventType ||
      'UNKNOWN_ACTION';

    let details =
      log?.details ??
      log?.description ??
      log?.message ??
      log?.metadata ??
      log?.meta ??
      '';

    if (typeof details === 'object') {
      try {
        details = JSON.stringify(details);
      } catch {
        details = 'Additional metadata available';
      }
    }

    return {
      ...log,
      id:
        log?.id ??
        log?._id ??
        index,
      timestamp,
      user: userName,
      action,
      details:
        details ||
        'No additional details available',
    };
  };


  /* ==========================================================
     FETCH AUDIT LOGS
     ========================================================== */

  const fetchLogs = useCallback(
    async (isRefresh = false) => {
      try {
        setError('');

        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const response =
          await adminService.getActivityLogs();

        console.log(
          'Activity Logs API response:',
          response
        );

        const normalizedLogs =
          normalizeLogs(response)
            .map(normalizeLog);

        setLogs(normalizedLogs);

      } catch (err) {
        console.error(
          'Failed to fetch activity logs:',
          err
        );

        setLogs([]);

        setError(
          err?.message ||
          'Unable to load system audit logs from the backend.'
        );

      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );


  /* ==========================================================
     INITIAL LOAD
     ========================================================== */

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);


  /* ==========================================================
     CSV ESCAPE
     ========================================================== */

  const escapeCsvValue = (value) => {
    const text =
      value === null ||
      value === undefined
        ? ''
        : String(value);

    return `"${text.replace(/"/g, '""')}"`;
  };


  /* ==========================================================
     EXPORT SYSTEM LOGS
     ========================================================== */

  const handleExport = () => {
    if (!logs.length) {
      alert('There are no audit records available to export.');
      return;
    }

    const headers = [
      'Timestamp',
      'User Account',
      'Action Taken',
      'Action Details',
    ];

    const rows = logs.map((log) => [
      log.timestamp,
      log.user,
      log.action,
      log.details,
    ]);

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map(escapeCsvValue)
          .join(',')
      )
      .join('\n');

    const blob =
      new Blob(
        [csv],
        {
          type: 'text/csv;charset=utf-8;',
        }
      );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement('a');

    link.href = url;

    link.download =
      `ringfinder-audit-logs-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };


  /* ==========================================================
     TABLE COLUMNS
     ========================================================== */

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


  /* ==========================================================
     PAGE
     ========================================================== */

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
              onClick={() => fetchLogs(true)}
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
              disabled={!logs.length}
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
          ERROR
          ===================================================== */}

      {error && (

        <section
          style={{
            margin: '16px 24px',
            padding: '14px 16px',
            border:
              '1px solid rgba(239,68,68,0.35)',
            background:
              'rgba(239,68,68,0.08)',
            color: '#fca5a5',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >

          <AlertTriangle size={17} />

          <span style={{ flex: 1 }}>
            {error}
          </span>

          <button
            type="button"
            onClick={() => fetchLogs(true)}
            disabled={refreshing}
            style={{
              border:
                '1px solid rgba(239,68,68,0.4)',
              background: 'transparent',
              color: 'inherit',
              padding: '7px 12px',
              borderRadius: '7px',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>

        </section>

      )}


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
              {error
                ? 'DEGRADED'
                : 'ACTIVE'}
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
              {error
                ? 'CHECK REQUIRED'
                : 'VERIFIED'}
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
            emptyMessage={
              error
                ? 'Unable to retrieve audit records'
                : 'No audit records found'
            }
          />

        )}

      </section>

    </div>
  );
};


export default ActivityLogs;