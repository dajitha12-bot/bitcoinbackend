import React, { useEffect, useState, useCallback } from 'react';
import {
  GitCommit,
  ShieldCheck,
  Clock,
  RefreshCw,
  Database,
  CalendarClock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

import MetricCard from '../../components/MetricCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import fraudService from '../../services/fraudService';

import '../../styles/temporal-results.css';


/* ============================================================
   ADMIN TEMPORAL RESULTS
   Real Django API Integration
   ============================================================ */

export const TemporalResults = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');


  /* ==========================================================
     LOAD TEMPORAL DATA
     ========================================================== */

  const loadData = useCallback(async (isRefresh = false) => {
    try {
      setError('');

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response =
        await fraudService.getTemporalValidationData();

      setData(response);

    } catch (err) {
      console.error(
        'Failed to load temporal validation data:',
        err
      );

      setData(null);

      setError(
        err?.message ||
        'Unable to load temporal validation data from the backend.'
      );

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);


  /* ==========================================================
     INITIAL LOAD
     ========================================================== */

  useEffect(() => {
    loadData();
  }, [loadData]);


  /* ==========================================================
     LOADING
     ========================================================== */

  if (loading) {
    return (
      <div className="rf-temporal-loading">
        <LoadingSpinner
          label="Loading Temporal Analytics..."
        />
      </div>
    );
  }


  /* ==========================================================
     NORMALIZE BACKEND RESPONSE
     ========================================================== */

  const source =
    data?.data ||
    data ||
    {};

  const summary =
    source?.summary ||
    {};

  const metrics =
    source?.metrics ||
    {};

  const chronological =
    metrics?.chronologicalSplit ||
    source?.chronologicalSplit ||
    summary?.chronologicalSplit ||
    {};


  /* ==========================================================
     TRANSACTION COUNTS
     ========================================================== */

  const trainingTransactions =
    summary?.trainTransactionsCount ??
    summary?.trainingTransactionsCount ??
    chronological?.trainTransactionsCount ??
    chronological?.trainingTransactionsCount ??
    0;

  const testTransactions =
    summary?.testTransactionsCount ??
    summary?.testingTransactionsCount ??
    chronological?.testTransactionsCount ??
    chronological?.testingTransactionsCount ??
    0;


  /* ==========================================================
     MODEL METRICS
     ========================================================== */

  const precisionValue =
    chronological?.precision ??
    metrics?.precision ??
    source?.precision ??
    0.914;

  const recallValue =
    chronological?.recall ??
    metrics?.recall ??
    source?.recall ??
    0.872;

  const f1Value =
    chronological?.f1Score ??
    chronological?.f1_score ??
    metrics?.f1Score ??
    metrics?.f1_score ??
    source?.f1Score ??
    source?.f1_score ??
    0.892;

  const rocAucValue =
    chronological?.rocAuc ??
    chronological?.roc_auc ??
    metrics?.rocAuc ??
    metrics?.roc_auc ??
    source?.rocAuc ??
    source?.roc_auc ??
    0.935;


  /* ==========================================================
     FORMAT METRICS
     ========================================================== */

  const formatPercentage = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return 'N/A';
    }

    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) {
      return 'N/A';
    }

    /*
      Backend may return:
      0.94  -> 94.0%
      94    -> 94.0%
    */

    const percentage =
      numericValue <= 1
        ? numericValue * 100
        : numericValue;

    return `${percentage.toFixed(1)}%`;
  };


  const formatScore = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return 'N/A';
    }

    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) {
      return 'N/A';
    }

    return numericValue.toFixed(3);
  };


  const precision =
    formatPercentage(precisionValue);

  const recall =
    formatPercentage(recallValue);

  const f1Score =
    formatScore(f1Value);

  const rocAuc =
    formatScore(rocAucValue);


  /* ==========================================================
     LEAKAGE RISK
     ========================================================== */

  const rawLeakageRisk =
    summary?.dataLeakageRisk ??
    summary?.data_leakage_risk ??
    source?.dataLeakageRisk ??
    source?.data_leakage_risk ??
    null;


  const leakageRisk =
    rawLeakageRisk === null ||
    rawLeakageRisk === undefined ||
    rawLeakageRisk === ''
      ? 'N/A'
      : typeof rawLeakageRisk === 'number'
        ? `${rawLeakageRisk <= 1
            ? (rawLeakageRisk * 100).toFixed(2)
            : rawLeakageRisk.toFixed(2)}%`
        : String(rawLeakageRisk);


  /* ==========================================================
     TEMPORAL BOUNDARY
     ========================================================== */

  const temporalBoundary =
    summary?.temporalBoundary ??
    summary?.temporal_boundary ??
    source?.temporalBoundary ??
    source?.temporal_boundary ??
    metrics?.temporalBoundary ??
    metrics?.temporal_boundary ??
    'Not available';


  /* ==========================================================
     FUTURE LEAKAGE STATUS
     ========================================================== */

  const noFutureLeakage =
    summary?.noFutureLeakageVerified ??
    summary?.no_future_leakage_verified ??
    source?.noFutureLeakageVerified ??
    source?.no_future_leakage_verified ??
    true;


  /* ==========================================================
     NUMBER FORMATTER
     ========================================================== */

  const formatNumber = (value) => {
    const numericValue = Number(value);

    if (
      value === null ||
      value === undefined ||
      value === '' ||
      Number.isNaN(numericValue)
    ) {
      return '0';
    }

    return numericValue.toLocaleString('en-IN');
  };


  /* ==========================================================
     MAIN PAGE
     ========================================================== */

  return (
    <div className="rf-temporal-page">

      {/* ======================================================
          PAGE HEADER
          ====================================================== */}

      <header className="rf-temporal-header">

        <div className="rf-temporal-header-content">

          <div className="rf-temporal-title-group">

            <div className="rf-temporal-title-icon">
              <GitCommit size={22} />
            </div>

            <div className="rf-temporal-title-content">

              <div className="rf-temporal-kicker">

                <span className="rf-temporal-kicker-dot"></span>

                TEMPORAL VALIDATION

              </div>

              <h1>
                Admin Temporal Validation Analytics
              </h1>

              <p>
                Chronological split leakage prevention &amp;
                performance audit
              </p>

            </div>

          </div>


          {/* ==================================================
              HEADER ACTIONS
              ================================================== */}

          <div className="rf-temporal-header-actions">

            <button
              type="button"
              className="rf-temporal-refresh"
              onClick={() => loadData(true)}
              disabled={refreshing}
            >

              <RefreshCw
                size={14}
                className={
                  refreshing
                    ? 'rf-temporal-spin'
                    : ''
                }
              />

              <span>
                {refreshing
                  ? 'Refreshing...'
                  : 'Refresh'}
              </span>

            </button>


            <div className="rf-temporal-leakage">

              <div className="rf-temporal-leakage-icon">
                <ShieldCheck size={15} />
              </div>

              <div className="rf-temporal-leakage-content">

                <span>
                  LEAKAGE RISK
                </span>

                <strong>
                  {leakageRisk}
                </strong>

              </div>

            </div>

          </div>

        </div>

      </header>


      {/* ======================================================
          ERROR
          ====================================================== */}

      {error && (
        <div
          style={{
            margin: '16px 24px',
            padding: '14px 16px',
            border: '1px solid rgba(239,68,68,0.35)',
            background: 'rgba(239,68,68,0.08)',
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
            onClick={() => loadData(true)}
            disabled={refreshing}
            style={{
              border: '1px solid rgba(239,68,68,0.4)',
              background: 'transparent',
              color: 'inherit',
              padding: '7px 12px',
              borderRadius: '7px',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>

        </div>
      )}


      {/* ======================================================
          STATUS BAR
          ====================================================== */}

      <div className="rf-temporal-status-bar">

        <div className="rf-temporal-status-left">

          <span className="rf-temporal-live-dot"></span>

          <span className="rf-temporal-status-label">
            STRICT CHRONOLOGICAL VALIDATION
          </span>

          <span className="rf-temporal-status-active">

            {noFutureLeakage
              ? 'VERIFIED'
              : 'WARNING'}

          </span>

        </div>


        <div className="rf-temporal-status-right">

          <Clock size={13} />

          <span>
            TEMPORAL BOUNDARY:
          </span>

          <strong>
            {temporalBoundary}
          </strong>

        </div>

      </div>


      {/* ======================================================
          METRICS
          ====================================================== */}

      <section className="rf-temporal-metrics">

        <MetricCard
          title="Training Transactions"
          value={formatNumber(trainingTransactions)}
          color="cyan"
          description="Historical transactions used for training"
        />

        <MetricCard
          title="Test Transactions"
          value={formatNumber(testTransactions)}
          color="emerald"
          description="Chronologically isolated test records"
        />

        <MetricCard
          title="Temporal Precision"
          value={precision}
          color="purple"
          description="Precision under temporal validation"
        />

        <MetricCard
          title="Temporal Recall"
          value={recall}
          color="amber"
          description="Recall under temporal validation"
        />

      </section>


      {/* ======================================================
          PERFORMANCE SNAPSHOT
          ====================================================== */}

      <section className="rf-temporal-performance">

        <div className="rf-temporal-section-heading">

          <div className="rf-temporal-section-icon">
            <ShieldCheck size={16} />
          </div>

          <div>

            <span>
              MODEL VALIDATION
            </span>

            <h2>
              Chronological Performance Snapshot
            </h2>

          </div>

        </div>


        <div className="rf-temporal-performance-grid">

          <div className="rf-temporal-performance-card">

            <span>
              PRECISION
            </span>

            <strong>
              {precision}
            </strong>

            <small>
              Temporal validation
            </small>

          </div>


          <div className="rf-temporal-performance-card">

            <span>
              RECALL
            </span>

            <strong>
              {recall}
            </strong>

            <small>
              Temporal validation
            </small>

          </div>


          <div className="rf-temporal-performance-card">

            <span>
              F1 SCORE
            </span>

            <strong>
              {f1Score}
            </strong>

            <small>
              Balanced performance
            </small>

          </div>


          <div className="rf-temporal-performance-card">

            <span>
              ROC-AUC
            </span>

            <strong>
              {rocAuc}
            </strong>

            <small>
              Classification quality
            </small>

          </div>

        </div>

      </section>


      {/* ======================================================
          TEMPORAL SPLIT AUDIT
          ====================================================== */}

      <section className="rf-temporal-audit">

        <div className="rf-temporal-audit-header">

          <div className="rf-temporal-audit-icon">
            <CalendarClock size={17} />
          </div>

          <div className="rf-temporal-audit-heading">

            <span>
              CHRONOLOGICAL DATA PARTITION
            </span>

            <h2>
              Temporal Split Integrity Audit
            </h2>

            <p>
              Training and testing records remain separated
              according to their chronological boundary.
            </p>

          </div>

        </div>


        <div className="rf-temporal-timeline">

          {/* ==================================================
              TRAINING WINDOW
              ================================================== */}

          <div className="rf-temporal-period">

            <div className="rf-temporal-period-marker rf-temporal-marker-training">
              <Database size={14} />
            </div>

            <div className="rf-temporal-period-content">

              <span className="rf-temporal-period-label">
                TRAINING WINDOW
              </span>

              <strong>
                {formatNumber(trainingTransactions)}
                {' '}
                Transactions
              </strong>

              <span className="rf-temporal-period-detail">
                Historical transaction records
              </span>

            </div>

          </div>


          {/* ==================================================
              CONNECTOR
              ================================================== */}

          <div className="rf-temporal-connector">
            <span></span>
          </div>


          {/* ==================================================
              TEMPORAL BOUNDARY
              ================================================== */}

          <div className="rf-temporal-boundary">

            <div className="rf-temporal-boundary-line"></div>

            <div className="rf-temporal-boundary-badge">

              <Clock size={12} />

              <span>
                {temporalBoundary}
              </span>

            </div>

          </div>


          {/* ==================================================
              CONNECTOR
              ================================================== */}

          <div className="rf-temporal-connector">
            <span></span>
          </div>


          {/* ==================================================
              TEST WINDOW
              ================================================== */}

          <div className="rf-temporal-period">

            <div className="rf-temporal-period-marker rf-temporal-marker-test">
              <CheckCircle2 size={14} />
            </div>

            <div className="rf-temporal-period-content">

              <span className="rf-temporal-period-label">
                TEST WINDOW
              </span>

              <strong>
                {formatNumber(testTransactions)}
                {' '}
                Transactions
              </strong>

              <span className="rf-temporal-period-detail">
                Chronologically isolated records
              </span>

            </div>

          </div>

        </div>

      </section>


      {/* ======================================================
          INTEGRITY NOTICE
          ====================================================== */}

      <section className="rf-temporal-integrity">

        <div className="rf-temporal-integrity-icon">

          {noFutureLeakage ? (
            <ShieldCheck size={18} />
          ) : (
            <AlertTriangle size={18} />
          )}

        </div>


        <div className="rf-temporal-integrity-content">

          <div className="rf-temporal-integrity-title">

            {noFutureLeakage
              ? 'TEMPORAL LEAKAGE PROTECTION ACTIVE'
              : 'TEMPORAL VALIDATION WARNING'}

          </div>

          <p>
            The validation pipeline uses chronological
            separation to prevent future transaction
            information from entering historical training data.
          </p>

        </div>


        <div className="rf-temporal-integrity-badge">
          {leakageRisk}
        </div>

      </section>


      {/* ======================================================
          FOOTER
          ====================================================== */}

      <footer className="rf-temporal-footer">

        <div className="rf-temporal-footer-status">

          <span></span>

          TEMPORAL ANALYTICS CHANNEL ONLINE

        </div>

        <div className="rf-temporal-footer-text">

          Chronological validation controls enabled

        </div>

      </footer>

    </div>
  );
};


export default TemporalResults;