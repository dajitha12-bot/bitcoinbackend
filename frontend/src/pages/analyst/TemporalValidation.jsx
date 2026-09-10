import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  ShieldCheck,
  AlertOctagon,
  GitCommit,
  CheckCircle2,
  RefreshCw,
  Server,
} from 'lucide-react';

import MetricCard from '../../components/MetricCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import fraudService from '../../services/fraudService';

import '../../styles/temporal-validation.css';

export const TemporalValidation = () => {
  const [temporalData, setTemporalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  /* ==========================================================
     LOAD TEMPORAL VALIDATION DATA
  ========================================================== */

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError('');

    try {
      const response =
        await fraudService.getTemporalValidationData();

      console.log(
        'Temporal Validation API response:',
        response
      );

      /*
       * Support:
       * { summary, metrics, chronologicalTimeline }
       *
       * { data: {...} }
       *
       * { results: {...} }
       */

      let data = response;

      if (
        response &&
        !response.summary &&
        !response.metrics &&
        !response.chronologicalTimeline
      ) {
        data =
          response.data ??
          response.results ??
          response;
      }

      setTemporalData(data || null);
    } catch (err) {
      console.error(
        'Failed to fetch temporal validation data:',
        err
      );

      setTemporalData(null);

      setError(
        err?.message ||
          'Unable to load chronological validation results.'
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
    fetchData();
  }, [fetchData]);

  /* ==========================================================
     LOADING STATE
  ========================================================== */

  if (loading) {
    return (
      <div className="rf-temporal-validation-loading">
        <LoadingSpinner
          label="Validating Chronological Temporal Train/Test Splits..."
        />
      </div>
    );
  }

  /* ==========================================================
     ERROR STATE
  ========================================================== */

  if (!temporalData) {
    return (
      <div className="rf-temporal-validation-error">

        <div className="rf-temporal-validation-error-icon">
          <AlertOctagon size={21} />
        </div>

        <div>
          <span className="rf-temporal-error-label">
            TEMPORAL VALIDATION ERROR
          </span>

          <h2>
            Temporal Validation Unavailable
          </h2>

          <p>
            {error ||
              'Unable to load chronological validation results.'}
          </p>

          <div className="rf-temporal-error-hint">
            <span />
            Verify that the Django backend is running
            on localhost:8000.
          </div>

          <button
            type="button"
            className="rf-temporal-validation-retry"
            onClick={() => fetchData()}
          >
            <RefreshCw size={14} />
            Retry Validation
          </button>
        </div>

      </div>
    );
  }

  /* ==========================================================
     NORMALIZE RESPONSE
  ========================================================== */

  const summary =
    temporalData.summary ??
    temporalData.validationSummary ??
    temporalData.validation_summary ??
    null;

  const metrics =
    temporalData.metrics ??
    temporalData.validationMetrics ??
    temporalData.validation_metrics ??
    {};

  const chronologicalTimeline =
    temporalData.chronologicalTimeline ??
    temporalData.chronological_timeline ??
    temporalData.timeline ??
    [];

  const chronologicalMetrics =
    metrics?.chronologicalSplit ??
    metrics?.chronological_split ??
    metrics?.chronological ??
    {};

  const flawedMetrics =
    metrics?.flawedRandomSplit ??
    metrics?.flawed_random_split ??
    metrics?.randomSplit ??
    metrics?.random_split ??
    {};

  /* ==========================================================
     FORMAT PERCENTAGE
  ========================================================== */

  const formatPercentage = (value) => {
    if (
      value === undefined ||
      value === null ||
      value === ''
    ) {
      return 'N/A';
    }

    const numericValue =
      Number(value);

    if (!Number.isFinite(numericValue)) {
      return 'N/A';
    }

    /*
     * Backend may return:
     * 0.94
     * or
     * 94
     */

    const normalized =
      numericValue > 1
        ? numericValue / 100
        : numericValue;

    return `${(
      normalized * 100
    ).toFixed(1)}%`;
  };

  /* ==========================================================
     FORMAT METRIC
  ========================================================== */

  const formatMetric = (value) => {
    if (
      value === undefined ||
      value === null ||
      value === ''
    ) {
      return 'N/A';
    }

    const numericValue =
      Number(value);

    if (!Number.isFinite(numericValue)) {
      return String(value);
    }

    if (
      numericValue >= 0 &&
      numericValue <= 1
    ) {
      return numericValue.toFixed(3);
    }

    return numericValue.toFixed(2);
  };

  /* ==========================================================
     TIMELINE STAGE
  ========================================================== */

  const getTimelineStageClass = (stage) => {
    const normalizedStage =
      String(stage || '').toLowerCase();

    if (
      normalizedStage.includes('train')
    ) {
      return 'rf-timeline-training';
    }

    if (
      normalizedStage.includes('cutoff') ||
      normalizedStage.includes('barrier') ||
      normalizedStage.includes('split')
    ) {
      return 'rf-timeline-cutoff';
    }

    if (
      normalizedStage.includes('test') ||
      normalizedStage.includes('evaluat')
    ) {
      return 'rf-timeline-testing';
    }

    return 'rf-timeline-default';
  };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="rf-temporal-validation-page">

      {/* =====================================================
          1. PAGE HEADER
      ===================================================== */}

      <section className="rf-temporal-validation-header">

        <div className="rf-temporal-validation-header-content">

          <div className="rf-temporal-validation-kicker">
            <Clock size={13} />
            TEMPORAL INTEGRITY AUDIT
          </div>

          <h2>
            Temporal Validation
          </h2>

          <p>
            Chronological evaluation of RingFinder's
            Bitcoin transaction graph model without
            future-data leakage.
          </p>

        </div>

        <button
          type="button"
          className="rf-temporal-validation-refresh"
          onClick={() => fetchData(true)}
          disabled={refreshing}
        >
          <RefreshCw
            size={15}
            className={
              refreshing
                ? 'rf-temporal-validation-spin'
                : ''
            }
          />

          {refreshing
            ? 'Refreshing...'
            : 'Refresh Validation'}
        </button>

      </section>

      {/* =====================================================
          2. SECURITY BANNER
      ===================================================== */}

      <section className="rf-temporal-banner">

        <div className="rf-temporal-banner-icon">
          <ShieldCheck size={23} />
        </div>

        <div className="rf-temporal-banner-content">

          <div className="rf-temporal-banner-meta">

            <span className="rf-temporal-guarantee">
              NO-FUTURE-LEAKAGE VALIDATION
            </span>

            <span className="rf-temporal-cutoff">
              {temporalData.cutoffDate ||
                temporalData.cutoff_date ||
                'Backend configured cutoff'}
            </span>

          </div>

          <h2>
            Chronological Temporal Validation Methodology
          </h2>

          <p>
            Training data must strictly precede evaluation
            data in time to prevent future transaction
            information from influencing model evaluation.
          </p>

        </div>

      </section>

      {/* =====================================================
          BACKEND STATUS
      ===================================================== */}

      <div className="rf-temporal-data-source">

        <Server size={13} />

        <span>
          Django Temporal Validation API
        </span>

        <span className="rf-temporal-api-status">
          API DATA
        </span>

      </div>

      {/* =====================================================
          3. TIMELINE ARCHITECTURE
      ===================================================== */}

      <section className="rf-temporal-timeline-card">

        <div className="rf-temporal-section-heading">

          <div className="rf-temporal-heading-icon">
            <GitCommit size={16} />
          </div>

          <div>

            <span>
              VALIDATION ARCHITECTURE
            </span>

            <h3>
              Chronological Timeline Train/Test Partitioning
            </h3>

          </div>

        </div>

        <div className="rf-temporal-timeline">

          {chronologicalTimeline.length > 0 ? (

            chronologicalTimeline.map(
              (item, index) => {

                const stage =
                  item.stage ??
                  item.type ??
                  item.name ??
                  '';

                const stageClass =
                  getTimelineStageClass(stage);

                const count =
                  item.count ??
                  item.transactionCount ??
                  item.transaction_count ??
                  0;

                const period =
                  item.period ??
                  item.date ??
                  item.range ??
                  'N/A';

                const riskPattern =
                  item.riskPattern ??
                  item.risk_pattern ??
                  item.pattern ??
                  null;

                return (
                  <div
                    key={
                      item.id ??
                      `${stage}-${index}`
                    }
                    className={`rf-temporal-timeline-item ${stageClass}`}
                  >

                    <div className="rf-timeline-marker">
                      <span />
                    </div>

                    <div className="rf-timeline-content">

                      <div className="rf-timeline-period">
                        {period}
                      </div>

                      <div className="rf-timeline-stage">
                        {stage}
                      </div>

                      {Number(count) > 0 && (
                        <div className="rf-timeline-count">

                          <strong>
                            {Number(
                              count
                            ).toLocaleString()}
                          </strong>{' '}

                          Transactions

                        </div>
                      )}

                      {riskPattern && (
                        <div className="rf-timeline-pattern">
                          {riskPattern}
                        </div>
                      )}

                    </div>

                  </div>
                );
              }
            )

          ) : (

            <div className="rf-temporal-timeline-empty">
              No chronological timeline data available.
            </div>

          )}

        </div>

        {/* Why validation matters */}

        <div className="rf-temporal-explanation">

          <div className="rf-temporal-explanation-title">
            <span />
            Why Strict Chronological Validation Matters
          </div>

          <p>
            Random train/test splits can expose transaction
            patterns from the future to the training process.
            Chronological validation instead evaluates the
            model on data that occurs after the training
            period, providing a more realistic estimate of
            production performance.
          </p>

        </div>

      </section>

      {/* =====================================================
          4. METRIC COMPARISON
      ===================================================== */}

      <section className="rf-temporal-comparison">

        {/* ===================================================
            4A. CHRONOLOGICAL SPLIT
        =================================================== */}

        <article className="rf-temporal-comparison-card rf-temporal-realistic">

          <div className="rf-temporal-comparison-header">

            <div>

              <div className="rf-temporal-comparison-title">

                <CheckCircle2 size={15} />

                <h3>
                  Strict Chronological Split
                </h3>

              </div>

              <span className="rf-temporal-comparison-subtitle">
                REALISTIC PRODUCTION EVALUATION
              </span>

            </div>

            <span className="rf-temporal-production-badge">
              PRODUCTION READY
            </span>

          </div>

          <div className="rf-temporal-metric-grid">

            <MetricCard
              title="Precision"
              value={formatPercentage(
                chronologicalMetrics.precision
              )}
              color="emerald"
            />

            <MetricCard
              title="Recall"
              value={formatPercentage(
                chronologicalMetrics.recall
              )}
              color="emerald"
            />

            <MetricCard
              title="F1 Score"
              value={formatMetric(
                chronologicalMetrics.f1Score ??
                  chronologicalMetrics.f1_score ??
                  chronologicalMetrics.f1
              )}
              color="emerald"
            />

            <MetricCard
              title="ROC-AUC"
              value={formatMetric(
                chronologicalMetrics.rocAuc ??
                  chronologicalMetrics.roc_auc ??
                  chronologicalMetrics.auc
              )}
              color="emerald"
            />

          </div>

          <div className="rf-temporal-secondary-metrics">

            <div>

              <span>
                False Positive Rate
              </span>

              <strong>
                {formatPercentage(
                  chronologicalMetrics.falsePositiveRate ??
                    chronologicalMetrics.false_positive_rate ??
                    chronologicalMetrics.fpr
                )}
              </strong>

            </div>

            <div>

              <span>
                Unseen Rings Detected
              </span>

              <strong>
                {chronologicalMetrics.detectedRingsCount ??
                  chronologicalMetrics.detected_rings_count ??
                  chronologicalMetrics.unseenRingsDetected ??
                  chronologicalMetrics.unseen_rings_detected ??
                  0}{' '}
                Rings
              </strong>

            </div>

          </div>

        </article>

        {/* ===================================================
            4B. FLAWED RANDOM SPLIT
        =================================================== */}

        <article className="rf-temporal-comparison-card rf-temporal-flawed">

          <div className="rf-temporal-comparison-header">

            <div>

              <div className="rf-temporal-comparison-title">

                <AlertOctagon size={15} />

                <h3>
                  Flawed Random Split
                </h3>

              </div>

              <span className="rf-temporal-comparison-subtitle">
                DATA LEAKAGE / INFLATED PERFORMANCE
              </span>

            </div>

            <span className="rf-temporal-leakage-badge">
              LEAKAGE WARNING
            </span>

          </div>

          <div className="rf-temporal-metric-grid rf-temporal-flawed-metrics">

            <MetricCard
              title="Precision"
              value={formatPercentage(
                flawedMetrics.precision
              )}
              color="amber"
            />

            <MetricCard
              title="Recall"
              value={formatPercentage(
                flawedMetrics.recall
              )}
              color="amber"
            />

            <MetricCard
              title="F1 Score"
              value={formatMetric(
                flawedMetrics.f1Score ??
                  flawedMetrics.f1_score ??
                  flawedMetrics.f1
              )}
              color="amber"
            />

            <MetricCard
              title="ROC-AUC"
              value={formatMetric(
                flawedMetrics.rocAuc ??
                  flawedMetrics.roc_auc ??
                  flawedMetrics.auc
              )}
              color="amber"
            />

          </div>

          <div className="rf-temporal-warning">

            <div className="rf-temporal-warning-icon">
              <AlertOctagon size={15} />
            </div>

            <p>

              <strong>
                Warning:
              </strong>{' '}

              {flawedMetrics.note ??
                flawedMetrics.warning ??
                'Random splitting can expose future transaction patterns and inflate evaluation performance.'}

            </p>

          </div>

        </article>

      </section>

      {/* =====================================================
          5. VALIDATION SUMMARY
      ===================================================== */}

      {summary && (

        <section className="rf-temporal-summary">

          <div className="rf-temporal-summary-icon">
            <ShieldCheck size={17} />
          </div>

          <div>

            <span>
              VALIDATION CONCLUSION
            </span>

            <p>
              {typeof summary === 'string'
                ? summary
                : summary.message ??
                  summary.description ??
                  summary.conclusion ??
                  'Chronological validation results received from the backend.'}
            </p>

          </div>

        </section>

      )}

      {/* =====================================================
          6. FOOTER
      ===================================================== */}

      <footer className="rf-temporal-footer">

        <div className="rf-temporal-footer-status">

          <span className="rf-temporal-footer-dot" />

          TEMPORAL INTEGRITY VERIFIED

        </div>

        <span className="rf-temporal-footer-divider" />

        <span>
          Chronological evaluation protocol active
        </span>

      </footer>

    </div>
  );
};

export default TemporalValidation;