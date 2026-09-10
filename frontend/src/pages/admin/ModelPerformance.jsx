import React, { useCallback, useEffect, useState } from 'react';

import {
  Activity,
  Cpu,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

import MetricCard from '../../components/MetricCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import fraudService from '../../services/fraudService';

import '../../styles/model-performance.css';


/* ============================================================
   ADMIN MODEL PERFORMANCE
   Real Django API Integration
   ============================================================ */

export const ModelPerformance = () => {
  const [modelData, setModelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');


  /* ==========================================================
     LOAD MODEL PERFORMANCE DATA
     ========================================================== */

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      setError('');

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response =
        await fraudService.getModelPerformance();

      console.log(
        'Model Performance API response:',
        response
      );

      setModelData(response);

    } catch (err) {
      console.error(
        'Failed to fetch model performance:',
        err
      );

      setModelData(null);

      setError(
        err?.message ||
        'Unable to load model performance metrics from the backend.'
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
      <div className="rf-model-performance-loading">
        <LoadingSpinner
          label="Loading Model Performance Metrics..."
        />
      </div>
    );
  }


  /* ==========================================================
     NORMALIZE RESPONSE
     ========================================================== */

  const source =
    modelData?.data ||
    modelData ||
    {};

  const metrics =
    source?.metrics ||
    source?.performance ||
    source?.modelPerformance ||
    source?.model_performance ||
    {};


  /* ==========================================================
     METRIC HELPERS
     ========================================================== */

  const getMetric = (...values) => {
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


  const formatPercentage = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return 'N/A';
    }

    if (
      typeof value === 'string' &&
      value.includes('%')
    ) {
      return value;
    }

    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) {
      return String(value);
    }

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
      return String(value);
    }

    return numericValue.toFixed(3);
  };


  /* ==========================================================
     PERFORMANCE METRICS
     ========================================================== */

  const precisionValue = getMetric(
    metrics?.precision,
    metrics?.modelPrecision,
    metrics?.model_precision,
    source?.precision,
    source?.modelPrecision,
    source?.model_precision
  );

  const recallValue = getMetric(
    metrics?.recall,
    metrics?.modelRecall,
    metrics?.model_recall,
    source?.recall,
    source?.modelRecall,
    source?.model_recall
  );

  const f1Value = getMetric(
    metrics?.f1Score,
    metrics?.f1_score,
    metrics?.f1,
    source?.f1Score,
    source?.f1_score,
    source?.f1
  );

  const rocAucValue = getMetric(
    metrics?.rocAuc,
    metrics?.roc_auc,
    metrics?.rocAUC,
    metrics?.roc_auc_score,
    source?.rocAuc,
    source?.roc_auc,
    source?.rocAUC,
    source?.roc_auc_score
  );


  const precision =
    formatPercentage(precisionValue);

  const recall =
    formatPercentage(recallValue);

  const f1Score =
    formatScore(f1Value);

  const rocAuc =
    formatScore(rocAucValue);


  /* ==========================================================
     MODEL CONFIGURATION
     ========================================================== */

  const embeddingDimension = getMetric(
    source?.embeddingDimension,
    source?.embedding_dimension,
    source?.embeddingDim,
    source?.embedding_dim,
    source?.config?.embeddingDimension,
    source?.config?.embedding_dimension,
    source?.configuration?.embeddingDimension,
    source?.configuration?.embedding_dimension
  );

  const hopDepth = getMetric(
    source?.hopDepth,
    source?.hop_depth,
    source?.subgraphHopDepth,
    source?.subgraph_hop_depth,
    source?.config?.hopDepth,
    source?.config?.hop_depth,
    source?.configuration?.hopDepth,
    source?.configuration?.hop_depth
  );

  const aggregationFunction = getMetric(
    source?.aggregationFunction,
    source?.aggregation_function,
    source?.aggregation,
    source?.config?.aggregationFunction,
    source?.config?.aggregation_function,
    source?.configuration?.aggregationFunction,
    source?.configuration?.aggregation_function
  );

  const batchSize = getMetric(
    source?.batchSize,
    source?.batch_size,
    source?.config?.batchSize,
    source?.config?.batch_size,
    source?.configuration?.batchSize,
    source?.configuration?.batch_size
  );


  /* ==========================================================
     DISPLAY CONFIGURATION
     ========================================================== */

  const displayEmbedding =
    embeddingDimension === null
      ? 'N/A'
      : `${embeddingDimension} dimensions`;

  const displayHopDepth =
    hopDepth === null
      ? 'N/A'
      : `${hopDepth} Hops`;

  const displayAggregation =
    aggregationFunction === null
      ? 'N/A'
      : String(aggregationFunction);

  const displayBatchSize =
    batchSize === null
      ? 'N/A'
      : `${Number(batchSize).toLocaleString('en-IN')} Nodes`;


  /* ==========================================================
     MODEL STATUS
     ========================================================== */

  const rawStatus = getMetric(
    source?.status,
    source?.modelStatus,
    source?.model_status,
    source?.verificationStatus,
    source?.verification_status
  );

  const modelStatus =
    rawStatus === null
      ? 'METRICS LOADED'
      : String(rawStatus).toUpperCase();


  const rawArchitecture = getMetric(
    source?.architecture,
    source?.modelArchitecture,
    source?.model_architecture,
    source?.config?.architecture,
    source?.configuration?.architecture
  );

  const architecture =
    rawArchitecture === null
      ? 'GraphSAGE + Dynamic Temporal'
      : String(rawArchitecture);


  /* ==========================================================
     MAIN PAGE
     ========================================================== */

  return (
    <div className="rf-model-performance-page">

      {/* ======================================================
          PAGE HEADER
          ====================================================== */}

      <header className="rf-model-performance-header">

        <div className="rf-model-performance-title-group">

          <div className="rf-model-performance-title-icon">
            <Activity size={21} />
          </div>

          <div>

            <div className="rf-model-performance-kicker">

              <span></span>

              MODEL PERFORMANCE

            </div>

            <h1>
              Graph Neural Network Performance Metrics
            </h1>

            <p>
              GraphSAGE Layer Embedding Benchmarks &amp;
              Model Evaluation Metrics
            </p>

          </div>

        </div>


        <div className="rf-model-performance-architecture">

          Architecture:{' '}

          <strong>
            {architecture}
          </strong>

        </div>

      </header>


      {/* ======================================================
          ERROR / REFRESH BAR
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
            onClick={() => fetchData(true)}
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

            <RefreshCw
              size={13}
              style={{
                marginRight: '6px',
                verticalAlign: 'middle',
              }}
              className={
                refreshing
                  ? 'rf-button-spin'
                  : ''
              }
            />

            Retry

          </button>

        </div>

      )}


      {/* ======================================================
          PERFORMANCE METRICS
          ====================================================== */}

      <section className="rf-model-performance-metrics">

        <MetricCard
          title="Model Precision"
          value={precision}
          color="cyan"
        />

        <MetricCard
          title="Model Recall"
          value={recall}
          color="emerald"
        />

        <MetricCard
          title="F1 Score"
          value={f1Score}
          color="purple"
        />

        <MetricCard
          title="ROC-AUC"
          value={rocAuc}
          color="amber"
        />

      </section>


      {/* ======================================================
          MODEL CONFIGURATION
          ====================================================== */}

      <section className="rf-model-config-section">

        <div className="rf-model-config-heading">

          <Cpu size={16} />

          <h2>
            Hyperparameter &amp; Network Configuration
          </h2>

        </div>


        <div className="rf-model-config-grid">

          {/* Embedding Dimension */}

          <div className="rf-model-config-card">

            <span className="rf-model-config-label">
              Embedding Dim
            </span>

            <strong>
              {displayEmbedding}
            </strong>

          </div>


          {/* Hop Depth */}

          <div className="rf-model-config-card">

            <span className="rf-model-config-label">
              Sub-graph Hop Depth
            </span>

            <strong>
              {displayHopDepth}
            </strong>

          </div>


          {/* Aggregation Function */}

          <div className="rf-model-config-card rf-model-config-highlight">

            <span className="rf-model-config-label">
              Aggregation Function
            </span>

            <strong>
              {displayAggregation}
            </strong>

          </div>


          {/* Batch Size */}

          <div className="rf-model-config-card">

            <span className="rf-model-config-label">
              Batch Size
            </span>

            <strong>
              {displayBatchSize}
            </strong>

          </div>

        </div>

      </section>


      {/* ======================================================
          MODEL STATUS
          ====================================================== */}

      <section className="rf-model-status-section">

        <div className="rf-model-status-left">

          <div className="rf-model-status-icon">

            {error ? (
              <AlertTriangle size={16} />
            ) : (
              <CheckCircle2 size={16} />
            )}

          </div>

          <div>

            <span className="rf-model-status-label">
              MODEL STATUS
            </span>

            <strong>
              {modelStatus}
            </strong>

          </div>

        </div>


        <button
          type="button"
          className="rf-model-status-meta"
          onClick={() => fetchData(true)}
          disabled={refreshing}
          style={{
            border: 'none',
            cursor: refreshing
              ? 'wait'
              : 'pointer',
          }}
        >

          <Sliders size={13} />

          {refreshing
            ? 'REFRESHING...'
            : 'REFRESH METRICS'}

        </button>

      </section>

    </div>
  );
};


export default ModelPerformance;