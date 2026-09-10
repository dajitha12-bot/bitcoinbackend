import React, { useEffect, useState, useCallback } from 'react';
import {
  Eye,
  Layers,
  ShieldAlert,
  RefreshCw,
  Activity,
  AlertTriangle,
} from 'lucide-react';

import FraudRingCard from '../../components/FraudRingCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import fraudService from '../../services/fraudService';

import '../../styles/fraud-ring-monitoring.css';


/* ============================================================
   FRAUD RING MONITORING
   Admin Module
   Real Django API Integration
   ============================================================ */

export const FraudRingMonitoring = () => {
  const [rings, setRings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');


  /* ==========================================================
     NORMALIZE BACKEND RESPONSE
     ========================================================== */

  const normalizeRings = (response) => {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.results)) {
      return response.results;
    }

    if (Array.isArray(response?.rings)) {
      return response.rings;
    }

    if (Array.isArray(response?.data?.rings)) {
      return response.data.rings;
    }

    return [];
  };


  /* ==========================================================
     LOAD FRAUD RINGS
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
        await fraudService.getFraudRings();

      const normalizedRings =
        normalizeRings(response);

      setRings(normalizedRings);

    } catch (err) {
      console.error(
        'Failed to load fraud rings:',
        err
      );

      setRings([]);

      setError(
        err?.message ||
        'Unable to load fraud ring data from the backend.'
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
     LOADING STATE
     ========================================================== */

  if (loading) {
    return (
      <div className="rf-ring-monitor-loading">
        <LoadingSpinner
          label="Loading Fraud Ring Intelligence..."
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


          {/* ==================================================
              HEADER ACTIONS
              ================================================== */}

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
          ERROR MESSAGE
          ====================================================== */}

      {error && (
        <div className="rf-ring-monitor-error">

          <div className="rf-ring-monitor-error-icon">
            <AlertTriangle size={18} />
          </div>

          <div className="rf-ring-monitor-error-content">

            <strong>
              Unable to load fraud ring data
            </strong>

            <span>
              {error}
            </span>

          </div>

          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="rf-ring-monitor-error-retry"
          >
            <RefreshCw size={14} />

            Retry
          </button>

        </div>
      )}


      {/* ======================================================
          RING SUMMARY
          ====================================================== */}

      <section className="rf-ring-monitor-summary">

        {/* ACTIVE CLUSTERS */}

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


        {/* SURVEILLANCE MODE */}

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
            {rings.length !== 1
              ? ' RINGS'
              : ' RING'}

          </div>

        </div>


        {/* ====================================================
            NO RINGS
            ==================================================== */}

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
                ? 'Checking...'
                : 'Check Again'}

            </button>

          </div>

        ) : (

          /* ==================================================
             RING CARDS
             ================================================== */

          <div className="rf-ring-monitor-grid">

            {rings.map((ring, index) => (

              <FraudRingCard
                key={
                  ring?.id ??
                  ring?._id ??
                  ring?.ring_id ??
                  ring?.ringId ??
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