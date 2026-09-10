import React from 'react';
import {
  Activity,
  Cpu,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

import MetricCard from '../../components/MetricCard';

import '../../styles/model-performance.css';

export const ModelPerformance = () => {
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
            GraphSAGE + Dynamic Temporal
          </strong>
        </div>

      </header>


      {/* ======================================================
          PERFORMANCE METRICS
          ====================================================== */}

      <section className="rf-model-performance-metrics">

        <MetricCard
          title="Model Precision"
          value="94.2%"
          color="cyan"
        />

        <MetricCard
          title="Model Recall"
          value="91.5%"
          color="emerald"
        />

        <MetricCard
          title="F1 Score"
          value="0.928"
          color="purple"
        />

        <MetricCard
          title="ROC-AUC"
          value="0.964"
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
              128 dimensions
            </strong>

          </div>


          {/* Hop Depth */}

          <div className="rf-model-config-card">

            <span className="rf-model-config-label">
              Sub-graph Hop Depth
            </span>

            <strong>
              3 Hops
            </strong>

          </div>


          {/* Aggregation Function */}

          <div className="rf-model-config-card rf-model-config-highlight">

            <span className="rf-model-config-label">
              Aggregation Function
            </span>

            <strong>
              Mean Pooling
            </strong>

          </div>


          {/* Batch Size */}

          <div className="rf-model-config-card">

            <span className="rf-model-config-label">
              Batch Size
            </span>

            <strong>
              1,024 Nodes
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
            <CheckCircle2 size={16} />
          </div>

          <div>
            <span className="rf-model-status-label">
              MODEL STATUS
            </span>

            <strong>
              PERFORMANCE BENCHMARKS VERIFIED
            </strong>
          </div>

        </div>

        <div className="rf-model-status-meta">
          <Sliders size={13} />
          CONFIGURATION LOCKED
        </div>

      </section>

    </div>
  );
};

export default ModelPerformance;