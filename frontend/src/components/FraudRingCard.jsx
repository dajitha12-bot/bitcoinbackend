import React from 'react';
import {
  Layers,
  Wallet,
  Repeat,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

import RiskBadge from './RiskBadge';
import '../styles/fraud-ring-card.css';

export const FraudRingCard = ({
  ring,
  onViewDetails,
}) => {
  if (!ring) {
    return null;
  }

  return (
    <div className="rf-ring-card">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="rf-ring-header">

        <div className="rf-ring-identity">

          <div className="rf-ring-icon">
            <Layers size={20} />
          </div>

          <div className="rf-ring-title-area">

            <div className="rf-ring-title-row">

              <span className="rf-ring-id">
                {ring.id || 'UNKNOWN-RING'}
              </span>

              <RiskBadge
                level={ring.status || ring.riskLevel || 'UNKNOWN'}
              />

            </div>

            <h4 className="rf-ring-name">
              {ring.name || 'Unnamed Fraud Ring'}
            </h4>

          </div>

        </div>


        <div className="rf-ring-risk-score">

          <span>
            RISK SCORE
          </span>

          <strong>
            {ring.riskScore ?? 0}/100
          </strong>

        </div>

      </div>


      {/* =====================================================
          PRIMARY PATTERN
      ===================================================== */}

      <div className="rf-ring-pattern">

        <AlertTriangle size={14} />

        <span>
          Pattern: {ring.primaryPattern || 'Pattern unavailable'}
        </span>

      </div>


      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <div className="rf-ring-stats">

        {/* Wallets */}

        <div className="rf-ring-stat">

          <span className="rf-ring-stat-label">
            WALLETS
          </span>

          <strong className="rf-ring-stat-value">
            <Wallet size={13} />
            {ring.walletsCount ?? 0}
          </strong>

        </div>


        {/* Transactions */}

        <div className="rf-ring-stat">

          <span className="rf-ring-stat-label">
            TRANSACTIONS
          </span>

          <strong className="rf-ring-stat-value">
            <Repeat size={13} />
            {ring.transactionsCount ?? 0}
          </strong>

        </div>


        {/* Volume */}

        <div className="rf-ring-stat">

          <span className="rf-ring-stat-label">
            VOLUME
          </span>

          <strong
            className="rf-ring-volume"
            title={`${ring.totalBtc ?? 0} BTC`}
          >
            {ring.totalBtc ?? 0} BTC
          </strong>

        </div>

      </div>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <div className="rf-ring-footer">

        <span className="rf-ring-confidence">
          Confidence:{' '}
          <strong>
            {ring.confidence ?? 'N/A'}
          </strong>
        </span>

        <button
          type="button"
          className="rf-ring-view-button"
          onClick={() => onViewDetails?.(ring)}
        >
          <span>
            View Details
          </span>

          <ArrowRight size={14} />

        </button>

      </div>

    </div>
  );
};

export default FraudRingCard;