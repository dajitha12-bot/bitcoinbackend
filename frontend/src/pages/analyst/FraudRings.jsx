import React, { useState, useEffect, useCallback } from 'react';
import {
  Layers,
  Wallet,
  X,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  Server,
} from 'lucide-react';

import FraudRingCard from '../../components/FraudRingCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import RiskBadge from '../../components/RiskBadge';
import fraudService from '../../services/fraudService';

import '../../styles/fraud-rings.css';

/* ==========================================================
   FRAUD RINGS
   ========================================================== */

export const FraudRings = () => {
  const [rings, setRings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRing, setSelectedRing] = useState(null);
  const [error, setError] = useState('');

  /* ========================================================
     LOAD FRAUD RINGS
  ======================================================== */

  const fetchRings = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError('');

    try {
      const response =
        await fraudService.getFraudRings();

      console.log(
        'Fraud Rings API response:',
        response
      );

      /*
       * Support both:
       *   [ ...rings ]
       *
       * and:
       *   { rings: [ ...rings ] }
       *
       * and:
       *   { data: [ ...rings ] }
       */

      let ringData = response;

      if (
        response &&
        !Array.isArray(response)
      ) {
        ringData =
          response.rings ??
          response.data ??
          response.results ??
          [];
      }

      setRings(
        Array.isArray(ringData)
          ? ringData
          : []
      );
    } catch (err) {
      console.error(
        'Failed to fetch fraud rings:',
        err
      );

      setRings([]);

      setError(
        err?.message ||
          'Unable to load fraud-ring detection results.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  /* ========================================================
     INITIAL LOAD
  ======================================================== */

  useEffect(() => {
    fetchRings();
  }, [fetchRings]);

  /* ========================================================
     CALCULATE TOTAL FLAGGED VALUE
  ======================================================== */

  const totalFlaggedValue = rings.reduce(
    (total, ring) => {
      const value =
        ring.totalBtc ??
        ring.total_btc ??
        ring.volumeBtc ??
        ring.volume_btc ??
        ring.amount ??
        ring.value ??
        0;

      const numericValue =
        Number(value);

      return (
        total +
        (Number.isFinite(numericValue)
          ? numericValue
          : 0)
      );
    },
    0
  );

  const totalWallets = rings.reduce(
    (total, ring) => {
      const count =
        ring.walletsCount ??
        ring.wallets_count ??
        ring.walletCount ??
        ring.wallet_count ??
        (Array.isArray(ring.wallets)
          ? ring.wallets.length
          : 0);

      const numericCount =
        Number(count);

      return (
        total +
        (Number.isFinite(numericCount)
          ? numericCount
          : 0)
      );
    },
    0
  );

  const totalTransactions = rings.reduce(
    (total, ring) => {
      const count =
        ring.transactionsCount ??
        ring.transactions_count ??
        ring.transactionCount ??
        ring.transaction_count ??
        0;

      const numericCount =
        Number(count);

      return (
        total +
        (Number.isFinite(numericCount)
          ? numericCount
          : 0)
      );
    },
    0
  );

  /* ========================================================
     FORMAT BTC
  ======================================================== */

  const formatBtc = (value) => {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
      return '0.00';
    }

    return numericValue.toLocaleString(
      undefined,
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 8,
      }
    );
  };

  /* ========================================================
     LOADING STATE
  ======================================================== */

  if (loading) {
    return (
      <div className="rf-rings-loading">
        <LoadingSpinner
          label="Clustering Graph Sub-structures & Detecting Fraud Rings..."
        />
      </div>
    );
  }

  /* ========================================================
     RENDER
  ======================================================== */

  return (
    <div className="rf-fraud-rings-page">

      {/* ====================================================
          PAGE HEADER
      ==================================================== */}

      <section className="rf-rings-header">

        <div className="rf-rings-header-content">

          <div className="rf-rings-title-row">

            <div className="rf-rings-title-icon">
              <Layers size={22} />
            </div>

            <div>

              <div className="rf-rings-title-line">

                <h2>
                  Detected Fraud Rings & Syndicates
                </h2>

                <span className="rf-rings-active-badge">
                  <span className="rf-rings-status-dot" />
                  ACTIVE MONITORING
                </span>

              </div>

              <p>
                Graph Community Detection & Cyclical
                Subgraph Pattern Clustering Results
              </p>

            </div>

          </div>

        </div>

        {/* FLAGGED VALUE */}

        <div className="rf-rings-value-card">

          <span className="rf-rings-value-label">
            TOTAL FLAGGED VALUE
          </span>

          <strong>
            {formatBtc(totalFlaggedValue)} BTC
          </strong>

          <span className="rf-rings-value-usd">
            Backend-derived transaction value
          </span>

        </div>

      </section>

      {/* ====================================================
          ERROR
      ==================================================== */}

      {error && (
        <section className="rf-rings-error">

          <AlertTriangle size={16} />

          <div>
            <strong>
              Fraud Ring API Error
            </strong>

            <span>
              {error}
            </span>
          </div>

          <button
            type="button"
            onClick={() => fetchRings()}
          >
            Retry
          </button>

        </section>
      )}

      {/* ====================================================
          SUMMARY BAR
      ==================================================== */}

      <section className="rf-rings-summary-bar">

        {/* DETECTED RINGS */}

        <div className="rf-rings-summary-item">

          <div className="rf-rings-summary-icon rf-rings-summary-purple">
            <Layers size={16} />
          </div>

          <div>

            <span>
              Detected Rings
            </span>

            <strong>
              {rings.length}
            </strong>

          </div>

        </div>

        <div className="rf-rings-summary-divider" />

        {/* WALLETS */}

        <div className="rf-rings-summary-item">

          <div className="rf-rings-summary-icon rf-rings-summary-cyan">
            <Wallet size={16} />
          </div>

          <div>

            <span>
              Wallets Involved
            </span>

            <strong>
              {totalWallets.toLocaleString()}
            </strong>

          </div>

        </div>

        <div className="rf-rings-summary-divider" />

        {/* TRANSACTIONS */}

        <div className="rf-rings-summary-item">

          <div className="rf-rings-summary-icon rf-rings-summary-red">
            <ShieldAlert size={16} />
          </div>

          <div>

            <span>
              Transactions
            </span>

            <strong>
              {totalTransactions.toLocaleString()}
            </strong>

          </div>

        </div>

        <div className="rf-rings-summary-divider" />

        {/* DETECTION STATUS */}

        <div className="rf-rings-summary-item">

          <div className="rf-rings-summary-icon rf-rings-summary-green">
            <CheckCircle2 size={16} />
          </div>

          <div>

            <span>
              Detection Status
            </span>

            <strong>
              OPERATIONAL
            </strong>

          </div>

        </div>

        <div className="rf-rings-summary-refresh">

          <button
            type="button"
            onClick={() => fetchRings(true)}
            disabled={refreshing}
            className="rf-rings-refresh-button"
          >
            <RefreshCw
              size={13}
              className={
                refreshing
                  ? 'rf-rings-refresh-spin'
                  : ''
              }
            />

            {refreshing
              ? 'Refreshing...'
              : 'Refresh'}
          </button>

        </div>

      </section>

      {/* ====================================================
          BACKEND SOURCE
      ==================================================== */}

      <div className="rf-rings-data-source">

        <Server size={13} />

        <span>
          Django Fraud Detection API
        </span>

        <span className="rf-rings-api-status">
          API CONNECTED
        </span>

      </div>

      {/* ====================================================
          RING CARDS
      ==================================================== */}

      {rings.length > 0 ? (

        <section className="rf-rings-grid">

          {rings.map((ring, index) => (

            <FraudRingCard
              key={
                ring.id ||
                ring._id ||
                ring.ringId ||
                `ring-${index}`
              }
              ring={ring}
              onViewDetails={(selected) =>
                setSelectedRing(selected)
              }
            />

          ))}

        </section>

      ) : (

        <section className="rf-rings-empty">

          <div className="rf-rings-empty-icon">
            <Layers size={25} />
          </div>

          <h3>
            No Fraud Rings Detected
          </h3>

          <p>
            No clustered fraud-ring records are
            currently available for inspection.
          </p>

          <button
            type="button"
            className="rf-rings-refresh-button"
            onClick={() => fetchRings(true)}
          >
            <RefreshCw size={13} />
            Refresh Detection Results
          </button>

        </section>

      )}

      {/* ====================================================
          DETAIL MODAL
      ==================================================== */}

      {selectedRing && (

        <div
          className="rf-ring-modal-overlay"
          onClick={() =>
            setSelectedRing(null)
          }
        >

          <div
            className="rf-ring-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* ==============================================
                MODAL HEADER
            ============================================== */}

            <div className="rf-ring-modal-header">

              <div>

                <div className="rf-ring-modal-id-row">

                  <span className="rf-ring-modal-id">
                    {selectedRing.id ||
                      selectedRing._id ||
                      selectedRing.ringId ||
                      'RING-N/A'}
                  </span>

                  <RiskBadge
                    level={
                      selectedRing.status ||
                      selectedRing.riskLevel ||
                      selectedRing.risk_level ||
                      selectedRing.risk ||
                      'UNKNOWN'
                    }
                    score={
                      selectedRing.riskScore ??
                      selectedRing.risk_score ??
                      selectedRing.score ??
                      0
                    }
                  />

                </div>

                <h3>
                  {selectedRing.name ||
                    selectedRing.ring_name ||
                    'Unnamed Fraud Ring'}
                </h3>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedRing(null)
                }
                className="rf-ring-modal-close"
                aria-label="Close fraud ring inspection"
              >
                <X size={18} />
              </button>

            </div>

            {/* ==============================================
                RING METRICS
            ============================================== */}

            <div className="rf-ring-detail-grid">

              {/* RISK SCORE */}

              <div className="rf-ring-detail-card rf-ring-detail-red">

                <span>
                  RISK SCORE
                </span>

                <strong>
                  {selectedRing.riskScore ??
                    selectedRing.risk_score ??
                    selectedRing.score ??
                    0}

                  <small>
                    /100
                  </small>
                </strong>

              </div>

              {/* WALLETS */}

              <div className="rf-ring-detail-card rf-ring-detail-cyan">

                <span>
                  WALLETS INVOLVED
                </span>

                <strong>
                  {selectedRing.walletsCount ??
                    selectedRing.wallets_count ??
                    selectedRing.walletCount ??
                    selectedRing.wallet_count ??
                    (Array.isArray(
                      selectedRing.wallets
                    )
                      ? selectedRing.wallets.length
                      : 0)}
                </strong>

              </div>

              {/* TRANSACTIONS */}

              <div className="rf-ring-detail-card rf-ring-detail-purple">

                <span>
                  TRANSACTIONS
                </span>

                <strong>
                  {selectedRing.transactionsCount ??
                    selectedRing.transactions_count ??
                    selectedRing.transactionCount ??
                    selectedRing.transaction_count ??
                    0}
                </strong>

              </div>

              {/* VOLUME */}

              <div className="rf-ring-detail-card rf-ring-detail-green">

                <span>
                  VOLUME BTC
                </span>

                <strong>
                  {formatBtc(
                    selectedRing.totalBtc ??
                      selectedRing.total_btc ??
                      selectedRing.volumeBtc ??
                      selectedRing.volume_btc ??
                      selectedRing.amount ??
                      selectedRing.value ??
                      0
                  )}

                  <small>
                    {' '}BTC
                  </small>
                </strong>

              </div>

            </div>

            {/* ==============================================
                PRIMARY TOPOLOGY
            ============================================== */}

            <div className="rf-ring-detail-section">

              <h4>
                PRIMARY EVASION TOPOLOGY
              </h4>

              <div className="rf-ring-pattern-box">
                {selectedRing.primaryPattern ||
                  selectedRing.primary_pattern ||
                  selectedRing.pattern ||
                  selectedRing.topology ||
                  'No primary topology description available.'}
              </div>

            </div>

            {/* ==============================================
                ASSOCIATED WALLETS
            ============================================== */}

            <div className="rf-ring-detail-section">

              <div className="rf-ring-wallet-heading">

                <h4>
                  ASSOCIATED WALLET ADDRESSES
                </h4>

                <span>
                  {Array.isArray(
                    selectedRing.wallets
                  )
                    ? selectedRing.wallets.length
                    : selectedRing.walletsCount ??
                      selectedRing.wallets_count ??
                      0}
                </span>

              </div>

              <div className="rf-ring-wallet-list">

                {Array.isArray(
                  selectedRing.wallets
                ) &&
                selectedRing.wallets.length > 0 ? (

                  selectedRing.wallets.map(
                    (wallet, index) => {

                      const walletValue =
                        typeof wallet === 'object'
                          ? wallet.address ||
                            wallet.wallet_address ||
                            wallet.id ||
                            JSON.stringify(wallet)
                          : wallet;

                      return (
                        <div
                          key={`${walletValue}-${index}`}
                          className="rf-ring-wallet-row"
                        >

                          <span>
                            {walletValue}
                          </span>

                          <Wallet size={14} />

                        </div>
                      );
                    }
                  )

                ) : (

                  <div className="rf-ring-wallet-empty">
                    No associated wallet addresses available.
                  </div>

                )}

              </div>

            </div>

            {/* ==============================================
                MODAL FOOTER
            ============================================== */}

            <div className="rf-ring-modal-footer">

              <div className="rf-ring-inspection-status">

                <span />

                INSPECTION MODE

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedRing(null)
                }
                className="rf-ring-close-button"
              >
                Close Inspection
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default FraudRings;