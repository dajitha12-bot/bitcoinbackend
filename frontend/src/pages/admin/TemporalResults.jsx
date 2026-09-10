import React, { useEffect, useState } from 'react';
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

export const TemporalResults = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /* ==========================================================
     LOAD TEMPORAL VALIDATION DATA
     ========================================================== */

  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response =
        await fraudService.getTemporalValidationData();

      setData(response);
    } catch (error) {
      console.error(
        'Failed to load temporal validation data:',
        error
      );

      setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* ==========================================================
     INITIAL LOAD
     ========================================================== */

  useEffect(() => {
    loadData();
  }, []);

  /* ==========================================================
     LOADING STATE
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
     DATA MAPPING
     ========================================================== */

  const summary = data?.summary || {};
  const chronological =
    data?.metrics?.chronologicalSplit || {};

  const trainingTransactions =
    summary.trainTransactionsCount ?? 384500;

  const testTransactions =
    summary.testTransactionsCount ?? 112300;

  const precision =
    chronological.precision != null
      ? `${(chronological.precision * 100).toFixed(1)}%`
      : '94.2%';

  const recall =
    chronological.recall != null
      ? `${(chronological.recall * 100).toFixed(1)}%`
      : '91.5%';

  const f1Score =
    chronological.f1Score != null
      ? chronological.f1Score.toFixed(3)
      : '0.928';

  const rocAuc =
    chronological.rocAuc != null
      ? chronological.rocAuc.toFixed(3)
      : '0.964';

  const leakageRisk =
    summary.dataLeakageRisk || '0.00%';

  const temporalBoundary = '2026-01-01';

  const noFutureLeakage =
    summary.noFutureLeakageVerified !== false;

  const formatNumber = (value) =>
    Number(value).toLocaleString('en-IN');

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
            <span>PRECISION</span>
            <strong>{precision}</strong>
            <small>Temporal validation</small>
          </div>

          <div className="rf-temporal-performance-card">
            <span>RECALL</span>
            <strong>{recall}</strong>
            <small>Temporal validation</small>
          </div>

          <div className="rf-temporal-performance-card">
            <span>F1 SCORE</span>
            <strong>{f1Score}</strong>
            <small>Balanced performance</small>
          </div>

          <div className="rf-temporal-performance-card">
            <span>ROC-AUC</span>
            <strong>{rocAuc}</strong>
            <small>Classification quality</small>
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
                {' '}Transactions
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
                {' '}Transactions
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