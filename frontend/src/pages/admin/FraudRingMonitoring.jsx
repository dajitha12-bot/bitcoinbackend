import React, { useEffect, useState } from 'react';
import {
  Eye,
  Layers,
  ShieldAlert,
  RefreshCw,
  Activity,
} from 'lucide-react';

import FraudRingCard from '../../components/FraudRingCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import fraudService from '../../services/fraudService';

import '../../styles/fraud-ring-monitoring.css';

export const FraudRingMonitoring = () => {
  const [rings, setRings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /* ==========================================================
     LOAD FRAUD RINGS
     ========================================================== */

  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const list = await fraudService.getFraudRings();

      setRings(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to load fraud rings:', err);

      setRings([]);
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
      <div className="rf-ring-monitor-loading">
        <LoadingSpinner
          label="Polling Active Fraud Ring Monitors..."
        />
      </div>
    );
  }

  /* ==========================================================
     MAIN PAGE
     ========================================================== */

  return (
    <div className="rf-ring-monitor-page">

      {/* ======================================================
          PAGE HEADER
          ====================================================== */}

      <header className="rf-ring-monitor-header">

        <div className="rf-ring-monitor-header-content">

          <div className="rf-ring-monitor-title-group">

            <div className="rf-ring-monitor-title-icon">
              <Eye size={21} />
            </div>

            <div>
              <div className="rf-ring-monitor-kicker">
                <span></span>
                RING SURVEILLANCE
              </div>

              <h1>
                Admin Fraud Ring Surveillance
              </h1>

              <p>
                Real-time cluster tracking &amp; automated
                alerts for high-volume Bitcoin syndicates
              </p>
            </div>

          </div>

          <div className="rf-ring-monitor-actions">

            <button
              type="button"
              className="rf-ring-monitor-refresh"
              onClick={() => loadData(true)}
              disabled={refreshing}
            >
              <RefreshCw
                size={13}
                className={
                  refreshing
                    ? 'rf-button-spin'
                    : ''
                }
              />

              {refreshing
                ? 'Refreshing...'
                : 'Refresh'}
            </button>

            <div className="rf-ring-monitor-count">

              <Layers size={13} />

              <div>
                <span className="rf-ring-monitor-count-label">
                  MONITORED RINGS
                </span>

                <strong>
                  {rings.length}
                </strong>
              </div>

            </div>

          </div>

        </div>

      </header>

      {/* ======================================================
          MONITOR STATUS
          ====================================================== */}

      <div className="rf-ring-monitor-status">

        <div className="rf-ring-monitor-status-left">

          <span className="rf-ring-monitor-live-dot"></span>

          <span className="rf-ring-monitor-status-label">
            FRAUD RING MONITORING ENGINE
          </span>

          <span className="rf-ring-monitor-active">
            ACTIVE
          </span>

        </div>

        <div className="rf-ring-monitor-status-right">

          <Activity size={12} />

          <span>
            LIVE CLUSTER ANALYSIS
          </span>

        </div>

      </div>

      {/* ======================================================
          RING SUMMARY
          ====================================================== */}

      <section className="rf-ring-monitor-summary">

        <div className="rf-ring-monitor-summary-card">

          <div className="rf-ring-summary-icon">
            <Layers size={16} />
          </div>

          <div>
            <span className="rf-ring-summary-label">
              ACTIVE CLUSTERS
            </span>

            <strong>
              {rings.length}
            </strong>
          </div>

        </div>

        <div className="rf-ring-monitor-summary-card">

          <div className="rf-ring-summary-icon rf-ring-summary-icon-alert">
            <ShieldAlert size={16} />
          </div>

          <div>
            <span className="rf-ring-summary-label">
              SURVEILLANCE MODE
            </span>

            <strong>
              CONTINUOUS
            </strong>
          </div>

        </div>

      </section>

      {/* ======================================================
          FRAUD RINGS
          ====================================================== */}

      <section className="rf-ring-monitor-section">

        <div className="rf-ring-monitor-section-header">

          <div>

            <div className="rf-ring-monitor-section-kicker">
              DETECTION CLUSTERS
            </div>

            <h2>
              Monitored Fraud Rings
            </h2>

            <p>
              Active transaction clusters identified by
              the RingFinder graph analysis pipeline.
            </p>

          </div>

          <div className="rf-ring-monitor-record-count">

            <span></span>

            {rings.length} ACTIVE
            {rings.length !== 1 ? ' RINGS' : ' RING'}

          </div>

        </div>

        {rings.length === 0 ? (

          <div className="rf-ring-monitor-empty">

            <div className="rf-ring-monitor-empty-icon">
              <ShieldAlert size={25} />
            </div>

            <h3>
              No Active Fraud Rings
            </h3>

            <p>
              The monitoring engine has not identified
              any active fraud ring clusters.
            </p>

          </div>

        ) : (

          <div className="rf-ring-monitor-grid">

            {rings.map((ring, index) => (
              <FraudRingCard
                key={
                  ring?.id ||
                  ring?._id ||
                  `fraud-ring-${index}`
                }
                ring={ring}
              />
            ))}

          </div>

        )}

      </section>

      {/* ======================================================
          FOOTER
          ====================================================== */}

      <footer className="rf-ring-monitor-footer">

        <div className="rf-ring-monitor-footer-status">

          <span></span>

          RING MONITORING CHANNEL ONLINE

        </div>

        <div className="rf-ring-monitor-footer-text">
          Continuous graph-based surveillance enabled
        </div>

      </footer>

    </div>
  );
};

export default FraudRingMonitoring;