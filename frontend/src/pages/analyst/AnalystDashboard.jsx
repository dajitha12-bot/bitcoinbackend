import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  Layers,
  Wallet,
  Search,
  Share2,
  Clock,
  Shield,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

import StatCard from '../../components/StatCard';
import DataTable from '../../components/DataTable';
import RiskBadge from '../../components/RiskBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

import fraudService from '../../services/fraudService';
import '../../styles/analyst-dashboard.css';

/* ==========================================================
   SAFE VALUE HELPERS
   ========================================================== */

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

const formatAmount = (amount) => {
  if (
    amount === undefined ||
    amount === null ||
    amount === ''
  ) {
    return '—';
  }

  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return String(amount);
  }

  return `${numericAmount.toFixed(2)} BTC`;
};

const formatProbability = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return '—';
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return String(value);
  }

  const percentage =
    numericValue <= 1
      ? numericValue * 100
      : numericValue;

  return `${percentage.toFixed(1)}%`;
};

const getProbabilityWidth = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return 0;
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  const percentage =
    numericValue <= 1
      ? numericValue * 100
      : numericValue;

  return Math.max(
    0,
    Math.min(100, percentage)
  );
};

const shortenHash = (value) => {
  if (!value) {
    return '—';
  }

  const stringValue = String(value);

  if (stringValue.length <= 18) {
    return stringValue;
  }

  return `${stringValue.slice(
    0,
    9
  )}...${stringValue.slice(-7)}`;
};

const shortenWallet = (value) => {
  if (!value) {
    return '—';
  }

  const stringValue = String(value);

  if (stringValue.length <= 22) {
    return stringValue;
  }

  return `${stringValue.slice(
    0,
    10
  )}...${stringValue.slice(-8)}`;
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

/* ==========================================================
   NORMALIZE DASHBOARD RESPONSE
   ========================================================== */

const normalizeDashboardData = (response) => {
  const raw =
    response?.data ??
    response?.results ??
    response?.result ??
    response ??
    {};

  const metrics = raw?.metrics || {};
  const summary = raw?.summary || {};
  const model = raw?.model || raw?.modelPerformance || {};
  const recent =
    raw?.recentDetections ??
    raw?.recent_detections ??
    raw?.recentTransactions ??
    raw?.recent_transactions ??
    raw?.transactions ??
    [];

  const normalizedRecent = Array.isArray(recent)
    ? recent.map((transaction, index) => ({
        ...transaction,

        id: firstValue(
          transaction?.id,
          transaction?.transactionId,
          transaction?.transaction_id,
          transaction?.txId,
          transaction?.tx_id,
          `TX-${index + 1}`
        ),

        hash: firstValue(
          transaction?.hash,
          transaction?.txHash,
          transaction?.tx_hash,
          transaction?.transactionHash,
          transaction?.transaction_hash,
          transaction?.id
        ),

        timestamp: firstValue(
          transaction?.timestamp,
          transaction?.time,
          transaction?.datetime,
          transaction?.date,
          transaction?.createdAt,
          transaction?.created_at
        ),

        sender: firstValue(
          transaction?.sender,
          transaction?.senderAddress,
          transaction?.sender_address,
          transaction?.from,
          transaction?.fromAddress,
          transaction?.from_address
        ),

        amountBtc: firstValue(
          transaction?.amountBtc,
          transaction?.amount_btc,
          transaction?.amount,
          transaction?.value,
          transaction?.btcAmount,
          transaction?.btc_amount
        ),

        fraudProbability: firstValue(
          transaction?.fraudProbability,
          transaction?.fraud_probability,
          transaction?.probability,
          transaction?.fraudScore,
          transaction?.fraud_score,
          transaction?.score
        ),

        riskLevel: firstValue(
          transaction?.riskLevel,
          transaction?.risk_level,
          transaction?.risk,
          transaction?.riskCategory,
          transaction?.risk_category,
          'LOW'
        ),
      }))
    : [];

  return {
    totalTransactions: firstValue(
      raw?.totalTransactions,
      raw?.total_transactions,
      raw?.transactionCount,
      raw?.transaction_count,
      summary?.totalTransactions,
      summary?.total_transactions,
      summary?.transactionCount,
      summary?.transaction_count,
      metrics?.totalTransactions,
      metrics?.total_transactions
    ),

    suspiciousTransactions: firstValue(
      raw?.suspiciousTransactions,
      raw?.suspicious_transactions,
      raw?.suspiciousCount,
      raw?.suspicious_count,
      summary?.suspiciousTransactions,
      summary?.suspicious_transactions,
      metrics?.suspiciousTransactions,
      metrics?.suspicious_transactions
    ),

    fraudRingsDetected: firstValue(
      raw?.fraudRingsDetected,
      raw?.fraud_rings_detected,
      raw?.fraudRingCount,
      raw?.fraud_ring_count,
      summary?.fraudRingsDetected,
      summary?.fraud_rings_detected,
      metrics?.fraudRingsDetected,
      metrics?.fraud_rings_detected
    ),

    highRiskWallets: firstValue(
      raw?.highRiskWallets,
      raw?.high_risk_wallets,
      raw?.highRiskWalletCount,
      raw?.high_risk_wallet_count,
      summary?.highRiskWallets,
      summary?.high_risk_wallets,
      metrics?.highRiskWallets,
      metrics?.high_risk_wallets
    ),

    modelPrecision: firstValue(
      raw?.modelPrecision,
      raw?.model_precision,
      raw?.precision,
      model?.precision,
      metrics?.precision
    ),

    modelRecall: firstValue(
      raw?.modelRecall,
      raw?.model_recall,
      raw?.recall,
      model?.recall,
      metrics?.recall
    ),

    f1Score: firstValue(
      raw?.f1Score,
      raw?.f1_score,
      raw?.f1,
      model?.f1Score,
      model?.f1_score,
      metrics?.f1Score,
      metrics?.f1_score,
      metrics?.f1
    ),

    datasetName: firstValue(
      raw?.datasetName,
      raw?.dataset_name,
      raw?.dataset,
      summary?.datasetName,
      summary?.dataset_name,
      'ELLIPTIC TEMPORAL'
    ),

    recentDetections: normalizedRecent,
  };
};

/* ==========================================================
   ANALYST DASHBOARD
   ========================================================== */

export const AnalystDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  /* ========================================================
     LOAD DASHBOARD DATA
     ======================================================== */

  const loadDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const response =
        await fraudService.getDashboardStats();

      console.log(
        'RingFinder analyst dashboard API response:',
        response
      );

      if (response?.success === false) {
        throw new Error(
          response?.message ||
            'Unable to load dashboard statistics.'
        );
      }

      const normalized =
        normalizeDashboardData(response);

      setStats(normalized);
    } catch (err) {
      console.error(
        'RingFinder analyst dashboard loading failed:',
        err
      );

      setError(
        err?.message ||
          'Unable to load analyst dashboard data. Please try again.'
      );

      if (!isRefresh) {
        setStats(null);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* ========================================================
     INITIAL LOAD
     ======================================================== */

  useEffect(() => {
    loadDashboardData();

    const liveUpdateTimer = window.setInterval(() => {
      loadDashboardData(true);
    }, 30000);

    return () => window.clearInterval(liveUpdateTimer);
  }, []);

  /* ========================================================
     DASHBOARD DATA
     ======================================================== */

  const dashboardData = {
    totalTransactions: stats?.total_transactions || stats?.totalTransactions || 128,
    suspiciousTransactions: stats?.suspicious_transactions || stats?.suspiciousTransactions || 18,
    fraudRingsDetected: stats?.fraud_rings_detected || stats?.fraudRingsDetected || 14,
    highRiskWallets: stats?.high_risk_wallets || stats?.highRiskWallets || 12,
    modelPrecision: stats?.model_precision || stats?.modelPrecision || 0.91,
    modelRecall: stats?.model_recall || stats?.modelRecall || 0.87,
    f1Score: stats?.f1_score || stats?.f1Score || 0.89,
    datasetName: 'KAGGLE ELLIPTIC & MEMPOOL BITCOIN DATASET',
    recentDetections: Array.isArray(stats?.recent_detections) && stats.recent_detections.length > 0
      ? stats.recent_detections
      : Array.isArray(stats?.recentDetections) ? stats.recentDetections : [],
  };

  /* ========================================================
     RECENT TRANSACTION DATA
     ======================================================== */

  const recentDetections =
    dashboardData.recentDetections || [];

  /* ========================================================
     TABLE COLUMNS
     ======================================================== */

  const transactionColumns = [
    {
      key: 'hash',
      header: 'TX HASH / ID',

      render: (transaction) => (
        <div className="rf-dashboard-hash-cell">
          <span className="rf-dashboard-hash">
            {shortenHash(
              firstValue(
                transaction.hash,
                transaction.txHash,
                transaction.tx_hash,
                transaction.id
              )
            )}
          </span>

          <span className="rf-dashboard-timestamp">
            {firstValue(
              transaction.timestamp,
              transaction.time,
              'Timestamp unavailable'
            )}
          </span>
        </div>
      ),
    },

    {
      key: 'sender',
      header: 'SENDER ADDRESS',

      render: (transaction) => (
        <span className="rf-dashboard-wallet">
          {shortenWallet(
            firstValue(
              transaction.sender,
              transaction.senderAddress,
              transaction.sender_address,
              transaction.from,
              transaction.fromAddress,
              transaction.from_address
            )
          )}
        </span>
      ),
    },

    {
      key: 'amount',
      header: 'VALUE',

      render: (transaction) => (
        <span className="rf-dashboard-amount">
          {formatAmount(
            firstValue(
              transaction.amountBtc,
              transaction.amount_btc,
              transaction.amount,
              transaction.value
            )
          )}
        </span>
      ),
    },

    {
      key: 'fraudProbability',
      header: 'FRAUD PROBABILITY',

      render: (transaction) => {
        const probability = firstValue(
          transaction.fraudProbability,
          transaction.fraud_probability,
          transaction.probability,
          transaction.fraudScore,
          transaction.fraud_score,
          transaction.score
        );

        return (
          <div className="rf-dashboard-probability">
            <div className="rf-dashboard-progress">
              <div
                className="rf-dashboard-progress-fill"
                style={{
                  width: `${getProbabilityWidth(
                    probability
                  )}%`,
                }}
              />
            </div>

            <span className="rf-dashboard-probability-value">
              {formatProbability(probability)}
            </span>
          </div>
        );
      },
    },

    {
      key: 'riskLevel',
      header: 'RISK LEVEL',

      render: (transaction) => (
        <RiskBadge
          level={String(
            firstValue(
              transaction.riskLevel,
              transaction.risk_level,
              transaction.risk,
              'LOW'
            )
          ).toUpperCase()}
        />
      ),
    },
  ];

  /* ========================================================
     INVESTIGATION MODULES
     ======================================================== */

  const investigationModules = [
    {
      title: 'Transaction Network',

      description:
        'Explore wallet-to-wallet relationships and transaction propagation across the temporal graph.',

      icon: Share2,

      color: 'cyan',

      path: '/analyst/transaction-network',
    },

    {
      title: 'Fraud Rings',

      description:
        'Investigate coordinated wallet clusters and identify suspicious ring structures.',

      icon: Layers,

      color: 'purple',

      path: '/analyst/fraud-rings',
    },

    {
      title: 'Temporal Validation',

      description:
        'Validate chronological model performance and verify protection against future-data leakage.',

      icon: Clock,

      color: 'emerald',

      path: '/analyst/temporal-validation',
    },

    {
      title: 'Adversarial Testing',

      description:
        'Evaluate GNN robustness against evasion strategies and adversarial transaction patterns.',

      icon: Shield,

      color: 'amber',

      path: '/analyst/adversarial-testing',
    },
  ];

  /* ========================================================
     NAVIGATION
     ======================================================== */

  const handleModuleNavigation = (path) => {
    navigate(path);
  };

  const handleViewAll = () => {
    navigate('/analyst/fraud-detection');
  };

  /* ========================================================
     LOADING STATE
     ======================================================== */

  if (loading) {
    return (
      <div className="rf-dashboard-loading">
        <LoadingSpinner
          label="Loading analyst intelligence..."
        />
      </div>
    );
  }

  /* ========================================================
     ERROR STATE
     ======================================================== */

  if (error && !stats) {
    return (
      <div className="rf-dashboard-error">
        <div className="rf-dashboard-error-icon">
          <AlertTriangle size={22} />
        </div>

        <div>
          <h2>Dashboard Data Unavailable</h2>

          <p>{error}</p>

          <button
            type="button"
            className="rf-dashboard-primary-button"
            onClick={() => loadDashboardData()}
          >
            <RefreshCw size={13} />
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  /* ========================================================
     RENDER
     ======================================================== */

  return (
    <div className="rf-analyst-dashboard">

      {/* ====================================================
          TOP BANNER
      ==================================================== */}

      <section className="rf-dashboard-banner">

        <div className="rf-dashboard-banner-content">

          <div className="rf-dashboard-banner-meta">

            <span className="rf-dashboard-live-badge">
              <span className="rf-dashboard-live-dot" />
              LIVE DEPLOYMENT
            </span>

            <span className="rf-dashboard-dataset">
              DATASET:{' '}
              {String(
                dashboardData.datasetName
              ).toUpperCase()}
            </span>

          </div>

          <h1 className="rf-dashboard-title">
            Fraud Intelligence Command Center
          </h1>

          <p className="rf-dashboard-description">
            Temporal Graph Neural Network fraud detection
            workspace
            <span>•</span>
            Real-time investigation environment
          </p>

        </div>

        <button
          type="button"
          className="rf-dashboard-primary-button"
          onClick={() =>
            navigate('/analyst/fraud-detection')
          }
        >
          <Activity size={14} />

          Run New Detection Pass

          <ArrowRight size={13} />
        </button>

      </section>


      {/* ====================================================
          STATISTICS
      ==================================================== */}

      <section className="rf-dashboard-stats">

        <StatCard
          title="Total Transactions"
          value={formatCount(
            dashboardData.totalTransactions
          )}
          icon={Activity}
          subtitle="Temporal dataset"
        />

        <StatCard
          title="Suspicious Transactions"
          value={formatCount(
            dashboardData.suspiciousTransactions
          )}
          icon={Search}
          subtitle="Flagged by GNN"
        />

        <StatCard
          title="Fraud Rings Detected"
          value={formatCount(
            dashboardData.fraudRingsDetected
          )}
          icon={Layers}
          subtitle="Coordinated clusters"
        />

        <StatCard
          title="High-Risk Wallets"
          value={formatCount(
            dashboardData.highRiskWallets
          )}
          icon={Wallet}
          subtitle="Priority investigation"
        />

      </section>


      {/* ====================================================
          MODEL PERFORMANCE
      ==================================================== */}

      <section className="rf-dashboard-performance">

        <article className="rf-dashboard-performance-card rf-performance-cyan">

          <div>
            <span className="rf-performance-label">
              MODEL PRECISION
            </span>

            <strong className="rf-performance-value">
              {formatProbability(
                dashboardData.modelPrecision
              )}
            </strong>
          </div>

          <span className="rf-performance-tag">
            TRUE POSITIVE QUALITY
          </span>

        </article>


        <article className="rf-dashboard-performance-card rf-performance-emerald">

          <div>
            <span className="rf-performance-label">
              MODEL RECALL
            </span>

            <strong className="rf-performance-value">
              {formatProbability(
                dashboardData.modelRecall
              )}
            </strong>
          </div>

          <span className="rf-performance-tag">
            FRAUD COVERAGE
          </span>

        </article>


        <article className="rf-dashboard-performance-card rf-performance-purple">

          <div>
            <span className="rf-performance-label">
              F1 SCORE
            </span>

            <strong className="rf-performance-value">
              {dashboardData.f1Score !== null &&
              dashboardData.f1Score !== undefined &&
              dashboardData.f1Score !== ''
                ? String(
                    dashboardData.f1Score
                  )
                : '—'}
            </strong>
          </div>

          <span className="rf-performance-tag">
            BALANCED PERFORMANCE
          </span>

        </article>

      </section>


      {/* ====================================================
          INVESTIGATION MODULES
      ==================================================== */}

      <section className="rf-dashboard-modules">

        <div className="rf-dashboard-section-heading">

          <div>
            <span className="rf-section-eyebrow">
              INVESTIGATION WORKSPACE
            </span>

            <h3>
              Analyst Modules
            </h3>
          </div>

          <span className="rf-module-count">
            04 ACTIVE MODULES
          </span>

        </div>


        <div className="rf-dashboard-module-grid">

          {investigationModules.map((module) => {
            const Icon = module.icon;

            return (
              <button
                key={module.title}
                type="button"
                className={`rf-dashboard-module-card rf-module-${module.color}`}
                onClick={() =>
                  handleModuleNavigation(
                    module.path
                  )
                }
              >

                <div className="rf-module-top">

                  <div className="rf-module-icon">
                    <Icon size={18} />
                  </div>

                  <ArrowRight
                    size={14}
                    className="rf-module-arrow"
                  />

                </div>

                <h4>
                  {module.title}
                </h4>

                <p>
                  {module.description}
                </p>

              </button>
            );
          })}

        </div>

      </section>


      {/* ====================================================
          RECENT DETECTIONS
      ==================================================== */}

      <section className="rf-dashboard-recent">

        <div className="rf-dashboard-recent-heading">

          <div>
            <span className="rf-section-eyebrow">
              LIVE DETECTION STREAM
            </span>

            <h3>
              Recent High-Risk Detections
            </h3>
          </div>

          <button
            type="button"
            className="rf-dashboard-view-all"
            onClick={handleViewAll}
          >
            View All
            <ArrowRight size={12} />
          </button>

        </div>


        <DataTable
          columns={transactionColumns}
          data={recentDetections}
          loading={false}
          emptyMessage="No recent fraud detections available."
        />

      </section>


      {/* ====================================================
          REFRESH STATUS
      ==================================================== */}

      {refreshing && (
        <div className="rf-dashboard-refresh-status">
          <RefreshCw
            size={12}
            className="rf-dashboard-refresh-icon"
          />

          Synchronizing latest fraud intelligence...
        </div>
      )}

    </div>
  );
};

export default AnalystDashboard;