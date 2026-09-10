import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Database,
  Eye,
  Layers3,
  ListFilter,
  RefreshCw,
  Server,
  Shield,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

import LoadingSpinner from '../../components/LoadingSpinner';
import ApprovalCard from '../../components/ApprovalCard';

import adminService from '../../services/adminService';

import '../../styles/admin-dashboard.css';

/* ============================================================
   SAFE HELPERS
   ============================================================ */

const firstValue = (...values) => {
  for (const value of values) {
    if (
      value !== undefined &&
      value !== null &&
      value !== ''
    ) {
      return value;
    }
  }

  return null;
};

const normalizeArray = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.results)) {
    return response.results;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  return [];
};

const formatCount = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return '0';
  }

  if (typeof value === 'string') {
    return value;
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return String(value);
  }

  return numericValue.toLocaleString();
};

/* ============================================================
   ADMIN DASHBOARD
   ============================================================ */

export const AdminDashboard = () => {
  const navigate = useNavigate();

  const [pendingAnalysts, setPendingAnalysts] =
    useState([]);

  const [activityLogs, setActivityLogs] =
    useState([]);

  const [dashboardStats, setDashboardStats] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState(null);

  /* ==========================================================
     LOAD DASHBOARD DATA
     ========================================================== */

  const loadData = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError(null);

      /*
       * Pending analysts and activity logs are currently
       * provided by adminService.
       */
      const requests = [
        adminService.getPendingAnalysts(),
        adminService.getActivityLogs(),
      ];

      /*
       * If getDashboardStats exists in adminService,
       * use it as well. This keeps the page compatible
       * with both the current frontend service and a
       * future Django dashboard endpoint.
       */
      if (
        typeof adminService.getDashboardStats ===
        'function'
      ) {
        requests.push(
          adminService.getDashboardStats()
        );
      }

      const responses =
        await Promise.all(requests);

      const pendingResult = responses[0];
      const logsResult = responses[1];
      const statsResult = responses[2];

      setPendingAnalysts(
        normalizeArray(pendingResult)
      );

      setActivityLogs(
        normalizeArray(logsResult)
      );

      if (statsResult !== undefined) {
        const stats =
          statsResult?.data ??
          statsResult?.results ??
          statsResult?.result ??
          statsResult;

        setDashboardStats(
          stats || null
        );
      }
    } catch (err) {
      console.error(
        'Unable to load admin dashboard data:',
        err
      );

      setError(
        err?.message ||
          'Unable to load administration dashboard data.'
      );

      /*
       * Do not create fake operational data when
       * the backend is unavailable.
       */
      setPendingAnalysts([]);
      setActivityLogs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* ==========================================================
     INITIAL LOAD
     ========================================================== */

  useEffect(() => {
    loadData(true);
  }, []);

  /* ==========================================================
     APPROVE ANALYST
     ========================================================== */

  const handleApprove = async (id) => {
    try {
      setError(null);

      await adminService.approveAnalyst(id);

      await loadData(false);
    } catch (err) {
      console.error(
        'Unable to approve analyst:',
        err
      );

      setError(
        err?.message ||
          'Unable to approve analyst.'
      );
    }
  };

  /* ==========================================================
     REJECT ANALYST
     ========================================================== */

  const handleReject = async (id) => {
    try {
      setError(null);

      await adminService.rejectAnalyst(id);

      await loadData(false);
    } catch (err) {
      console.error(
        'Unable to reject analyst:',
        err
      );

      setError(
        err?.message ||
          'Unable to reject analyst.'
      );
    }
  };

  /* ==========================================================
     DASHBOARD STATISTICS
     ========================================================== */

  const stats =
    dashboardStats?.data ??
    dashboardStats?.summary ??
    dashboardStats ??
    {};

  const datasetCount = firstValue(
    stats?.activeDatasets,
    stats?.active_datasets,
    stats?.datasetCount,
    stats?.dataset_count,
    stats?.datasets,
    0
  );

  const transactionCount = firstValue(
    stats?.transactionsLogged,
    stats?.transactions_logged,
    stats?.transactionCount,
    stats?.transaction_count,
    stats?.totalTransactions,
    stats?.total_transactions,
    0
  );

  const fraudRingCount = firstValue(
    stats?.fraudRingsMonitored,
    stats?.fraud_rings_monitored,
    stats?.fraudRingCount,
    stats?.fraud_ring_count,
    stats?.fraudRings,
    stats?.fraud_rings,
    0
  );

  const temporalBoundary = firstValue(
    stats?.temporalBoundary,
    stats?.temporal_boundary,
    stats?.cutoffDate,
    stats?.cutoff_date,
    '—'
  );

  const modelName = firstValue(
    stats?.modelName,
    stats?.model_name,
    stats?.modelArchitecture,
    stats?.model_architecture,
    '—'
  );

  const monitoringStatus = firstValue(
    stats?.monitoringStatus,
    stats?.monitoring_status,
    '—'
  );

  const databaseStatus = firstValue(
    stats?.databaseStatus,
    stats?.database_status,
    null
  );

  const graphStatus = firstValue(
    stats?.graphProcessingStatus,
    stats?.graph_processing_status,
    null
  );

  const fraudModelStatus = firstValue(
    stats?.fraudModelStatus,
    stats?.fraud_model_status,
    null
  );

  const ringMonitoringStatus = firstValue(
    stats?.ringMonitoringStatus,
    stats?.ring_monitoring_status,
    null
  );

  /* ==========================================================
     LOADING SCREEN
     ========================================================== */

  if (loading) {
    return (
      <div className="rf-admin-loading-page">

        <div className="rf-admin-loading-icon">
          <ShieldCheck size={32} />
        </div>

        <h2>
          Loading Administration Console
        </h2>

        <p>
          Initializing platform operations and
          security services...
        </p>

        <LoadingSpinner
          label="Initializing RingFinder..."
        />

      </div>
    );
  }

  /* ==========================================================
     DASHBOARD
     ========================================================== */

  return (
    <div className="rf-admin-dashboard">

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <header className="rf-admin-header">

        <div className="rf-admin-header-main">

          <div className="rf-admin-eyebrow">
            <span className="rf-live-dot"></span>
            SYSTEM ADMINISTRATION PORTAL
          </div>

          <h1>
            RingFinder Platform Operations Center
          </h1>

          <p>
            Manage analyst privileges, datasets,
            GNN model configuration and system audit
            trails.
          </p>

        </div>

        <div className="rf-admin-operational">

          <div className="rf-operational-icon">
            <ShieldCheck size={22} />
          </div>

          <div>
            <span className="rf-operational-label">
              SYSTEM STATUS
            </span>

            <strong>
              {firstValue(
                stats?.systemStatus,
                stats?.system_status,
                'MONITORING'
              )}
            </strong>
          </div>

          <span className="rf-operational-dot"></span>

        </div>

      </header>


      {/* ======================================================
          ERROR / BACKEND STATUS
      ====================================================== */}

      {error && (
        <div
          className="rf-admin-error"
          role="alert"
        >
          <Shield size={16} />

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() => loadData(true)}
          >
            Retry
          </button>
        </div>
      )}


      {/* ======================================================
          SYSTEM INFORMATION
      ====================================================== */}

      <section className="rf-system-bar">

        <div className="rf-system-item">

          <div className="rf-system-icon">
            <Shield size={17} />
          </div>

          <div>
            <span>
              TEMPORAL BOUNDARY
            </span>

            <strong>
              {temporalBoundary}
            </strong>
          </div>

        </div>


        <div className="rf-system-divider"></div>


        <div className="rf-system-item">

          <div className="rf-system-icon">
            <Layers3 size={17} />
          </div>

          <div>
            <span>
              GNN MODEL
            </span>

            <strong>
              {modelName}
            </strong>
          </div>

        </div>


        <div className="rf-system-divider"></div>


        <div className="rf-system-item">

          <div className="rf-system-icon">
            <Activity size={17} />
          </div>

          <div>
            <span>
              MONITORING
            </span>

            <strong>
              {monitoringStatus}
            </strong>
          </div>

        </div>

      </section>


      {/* ======================================================
          STATISTICS
      ====================================================== */}

      <section className="rf-admin-stat-grid">

        {/* Pending Approvals */}

        <div className="rf-admin-stat-card rf-stat-purple">

          <div className="rf-stat-top">

            <div className="rf-stat-icon">
              <UserCheck size={21} />
            </div>

            <span className="rf-stat-tag">
              ACTION
            </span>

          </div>

          <div className="rf-stat-number">
            {formatCount(
              pendingAnalysts.length
            )}
          </div>

          <div className="rf-stat-name">
            Pending Approvals
          </div>

          <div className="rf-stat-description">
            Analyst registrations awaiting authorization
          </div>

        </div>


        {/* Datasets */}

        <div className="rf-admin-stat-card rf-stat-cyan">

          <div className="rf-stat-top">

            <div className="rf-stat-icon">
              <Database size={21} />
            </div>

            <span className="rf-stat-tag">
              DATA
            </span>

          </div>

          <div className="rf-stat-number">
            {formatCount(datasetCount)}
          </div>

          <div className="rf-stat-name">
            Active Datasets
          </div>

          <div className="rf-stat-description">
            Bitcoin transaction datasets indexed
          </div>

        </div>


        {/* Transactions */}

        <div className="rf-admin-stat-card rf-stat-blue">

          <div className="rf-stat-top">

            <div className="rf-stat-icon">
              <ListFilter size={21} />
            </div>

            <span className="rf-stat-tag">
              GRAPH
            </span>

          </div>

          <div className="rf-stat-number">
            {formatCount(transactionCount)}
          </div>

          <div className="rf-stat-name">
            Transactions Logged
          </div>

          <div className="rf-stat-description">
            Global transaction graph records
          </div>

        </div>


        {/* Fraud Rings */}

        <div className="rf-admin-stat-card rf-stat-orange">

          <div className="rf-stat-top">

            <div className="rf-stat-icon">
              <Layers3 size={21} />
            </div>

            <span className="rf-stat-tag">
              SECURITY
            </span>

          </div>

          <div className="rf-stat-number">
            {formatCount(fraudRingCount)}
          </div>

          <div className="rf-stat-name">
            Fraud Rings Monitored
          </div>

          <div className="rf-stat-description">
            Suspicious syndicates under monitoring
          </div>

        </div>

      </section>


      {/* ======================================================
          PENDING APPROVALS
      ====================================================== */}

      <section className="rf-admin-section">

        <div className="rf-section-heading">

          <div>

            <div className="rf-section-kicker">
              <UserCheck size={14} />
              ANALYST AUTHORIZATION
            </div>

            <h2>
              Pending Analyst Registrations
            </h2>

            <p>
              Review and authorize analysts requesting
              access to the RingFinder platform.
            </p>

          </div>


          <div className="rf-section-actions">

            <button
              type="button"
              className="rf-secondary-button"
              onClick={() => loadData(false)}
              disabled={refreshing}
            >
              <RefreshCw
                size={14}
                className={
                  refreshing
                    ? 'rf-spin'
                    : ''
                }
              />

              Refresh
            </button>


            <button
              type="button"
              className="rf-primary-button"
              onClick={() =>
                navigate('/admin/analyst-approval')
              }
            >
              Review Approvals
              <ArrowRight size={14} />
            </button>

          </div>

        </div>


        {pendingAnalysts.length > 0 ? (

          <div className="rf-approval-grid">

            {pendingAnalysts.map((analyst) => (

              <ApprovalCard
                key={
                  analyst?.id ||
                  analyst?._id ||
                  analyst?.email
                }
                analyst={analyst}
                onApprove={handleApprove}
                onReject={handleReject}
              />

            ))}

          </div>

        ) : (

          <div className="rf-empty-state">

            <div className="rf-empty-icon">
              <CheckCircle2 size={25} />
            </div>

            <h3>
              No Pending Registrations
            </h3>

            <p>
              There are currently no analyst accounts
              waiting for administrative approval.
            </p>

          </div>

        )}

      </section>


      {/* ======================================================
          LOWER PANELS
      ====================================================== */}

      <div className="rf-admin-lower-grid">

        {/* ====================================================
            ACTIVITY
        ==================================================== */}

        <section className="rf-admin-panel">

          <div className="rf-panel-header">

            <div>

              <div className="rf-section-kicker">
                <Activity size={14} />
                SECURITY AUDIT
              </div>

              <h2>
                Recent System Activity
              </h2>

            </div>

            <button
              type="button"
              className="rf-panel-link"
              onClick={() =>
                navigate('/admin/activity-logs')
              }
            >
              View All
              <ArrowRight size={13} />
            </button>

          </div>


          <div className="rf-activity-list">

            {activityLogs.length > 0 ? (

              activityLogs
                .slice(0, 7)
                .map((log, index) => (

                  <div
                    className="rf-activity-item"
                    key={
                      log?.id ||
                      log?._id ||
                      index
                    }
                  >

                    <div className="rf-activity-icon">
                      <Activity size={15} />
                    </div>

                    <div className="rf-activity-content">

                      <strong>
                        {firstValue(
                          log?.action,
                          log?.event,
                          'SYSTEM EVENT'
                        )}
                      </strong>

                      <span>
                        {firstValue(
                          log?.details,
                          log?.description,
                          log?.message,
                          'System activity recorded'
                        )}
                      </span>

                    </div>

                    <div className="rf-activity-meta">

                      <span>
                        {firstValue(
                          log?.user,
                          log?.username,
                          log?.actor,
                          'system'
                        )}
                      </span>

                      <small>
                        <Clock3 size={10} />

                        {firstValue(
                          log?.timestamp,
                          log?.createdAt,
                          log?.created_at,
                          'Recent'
                        )}
                      </small>

                    </div>

                  </div>

                ))

            ) : (

              <div className="rf-panel-empty">
                No recent system activity.
              </div>

            )}

          </div>

        </section>


        {/* ====================================================
            PLATFORM HEALTH
        ==================================================== */}

        <section className="rf-admin-panel">

          <div className="rf-panel-header">

            <div>

              <div className="rf-section-kicker">
                <Server size={14} />
                INFRASTRUCTURE
              </div>

              <h2>
                Platform Health
              </h2>

            </div>

            <span className="rf-health-summary">
              {databaseStatus ||
              graphStatus ||
              fraudModelStatus ||
              ringMonitoringStatus
                ? 'STATUS AVAILABLE'
                : 'CHECKING'}
            </span>

          </div>


          <div className="rf-health-list">

            <div className="rf-health-row">

              <div className="rf-health-name">
                <Database size={15} />
                PostgreSQL Database
              </div>

              <div className="rf-health-status">

                <span></span>

                {databaseStatus ||
                  'STATUS UNAVAILABLE'}

              </div>

            </div>


            <div className="rf-health-row">

              <div className="rf-health-name">
                <Layers3 size={15} />
                Graph Processing Engine
              </div>

              <div className="rf-health-status">

                <span></span>

                {graphStatus ||
                  'STATUS UNAVAILABLE'}

              </div>

            </div>


            <div className="rf-health-row">

              <div className="rf-health-name">
                <Shield size={15} />
                Fraud Detection Model
              </div>

              <div className="rf-health-status">

                <span></span>

                {fraudModelStatus ||
                  'STATUS UNAVAILABLE'}

              </div>

            </div>


            <div className="rf-health-row">

              <div className="rf-health-name">
                <Eye size={15} />
                Ring Monitoring
              </div>

              <div className="rf-health-status">

                <span></span>

                {ringMonitoringStatus ||
                  'STATUS UNAVAILABLE'}

              </div>

            </div>

          </div>


          {/* Model Information */}

          <div className="rf-model-card">

            <div className="rf-model-icon">
              <Layers3 size={20} />
            </div>

            <div>

              <span>
                CURRENT DETECTION ARCHITECTURE
              </span>

              <strong>
                {modelName}
              </strong>

              <small>
                {temporalBoundary !== '—'
                  ? `Temporal boundary: ${temporalBoundary}`
                  : 'Model configuration information unavailable'}
              </small>

            </div>

          </div>

        </section>

      </div>


      {/* ======================================================
          FOOTER
      ====================================================== */}

      <footer className="rf-admin-footer">

        <ShieldCheck size={13} />

        <span>
          RINGFINDER SENTINEL
        </span>

        <i></i>

        <span>
          ADMINISTRATIVE CONTROL PLANE
        </span>

        <i></i>

        <span>
          SECURE SESSION
        </span>

      </footer>

    </div>
  );
};

export default AdminDashboard;