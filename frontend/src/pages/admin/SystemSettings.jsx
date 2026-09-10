import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  Sliders,
  Save,
  CheckCircle2,
  ShieldCheck,
  Database,
  Bell,
  Cpu,
  CalendarClock,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

import LoadingSpinner from '../../components/LoadingSpinner';
import adminService from '../../services/adminService';

import '../../styles/system-settings.css';


/* ============================================================
   ADMIN SYSTEM SETTINGS
   Real Django API Integration
   ============================================================ */

export const SystemSettings = () => {
  const [settings, setSettings] = useState(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const [savedMessage, setSavedMessage] = useState('');

  const [error, setError] = useState('');


  /* ==========================================================
     NORMALIZE BACKEND RESPONSE
     ========================================================== */

  const normalizeSettings = (response) => {
    if (!response) {
      return null;
    }

    const source =
      response?.data ||
      response?.settings ||
      response;

    return {
      ...source,

      riskThreshold:
        source?.riskThreshold ??
        source?.risk_threshold ??
        75,

      temporalCutoffDate:
        source?.temporalCutoffDate ??
        source?.temporal_cutoff_date ??
        '',

      gnnEmbeddingDim:
        source?.gnnEmbeddingDim ??
        source?.gnn_embedding_dim ??
        source?.embeddingDimension ??
        source?.embedding_dimension ??
        128,

      graphHopDepth:
        source?.graphHopDepth ??
        source?.graph_hop_depth ??
        source?.hopDepth ??
        source?.hop_depth ??
        3,

      strictTemporalMode:
        Boolean(
          source?.strictTemporalMode ??
          source?.strict_temporal_mode ??
          false
        ),

      autoFlagHighRiskRings:
        Boolean(
          source?.autoFlagHighRiskRings ??
          source?.auto_flag_high_risk_rings ??
          false
        ),
    };
  };


  /* ==========================================================
     LOAD SETTINGS
     ========================================================== */

  const fetchSettings = useCallback(
    async (isRefresh = false) => {
      try {
        setError('');

        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const response =
          await adminService.getSystemSettings();

        console.log(
          'System Settings API response:',
          response
        );

        const normalized =
          normalizeSettings(response);

        if (!normalized) {
          throw new Error(
            'The backend returned an empty system configuration.'
          );
        }

        setSettings(normalized);

      } catch (err) {
        console.error(
          'Failed to load system settings:',
          err
        );

        setSettings(null);

        setError(
          err?.message ||
          'Unable to retrieve RingFinder system configuration.'
        );

      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );


  /* ==========================================================
     INITIAL LOAD
     ========================================================== */

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);


  /* ==========================================================
     UPDATE FIELD
     ========================================================== */

  const updateSetting = (key, value) => {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));

    setSavedMessage('');
  };


  /* ==========================================================
     SAVE SETTINGS
     ========================================================== */

  const handleSave = async (e) => {
    e.preventDefault();

    if (!settings || saving) {
      return;
    }

    try {
      setSaving(true);
      setSavedMessage('');
      setError('');

      await adminService.updateSystemSettings(
        settings
      );

      setSavedMessage(
        'System Settings Updated & Persisted Successfully'
      );

      setTimeout(() => {
        setSavedMessage('');
      }, 3000);

    } catch (err) {
      console.error(
        'Failed to update system settings:',
        err
      );

      setSavedMessage(
        'Failed to update system settings'
      );

      setError(
        err?.message ||
        'Unable to persist system settings.'
      );

      setTimeout(() => {
        setSavedMessage('');
      }, 4000);

    } finally {
      setSaving(false);
    }
  };


  /* ==========================================================
     LOADING STATE
     ========================================================== */

  if (loading) {
    return (
      <div className="rf-settings-loading">

        <LoadingSpinner
          label="Retrieving GNN Platform Configuration..."
        />

      </div>
    );
  }


  /* ==========================================================
     ERROR / EMPTY STATE
     ========================================================== */

  if (!settings) {
    return (
      <div className="rf-settings-error">

        <div className="rf-settings-error-icon">
          <AlertTriangle size={22} />
        </div>

        <h2>
          Configuration Unavailable
        </h2>

        <p>
          {error ||
            'The RingFinder platform configuration could not be retrieved.'}
        </p>

        <button
          type="button"
          className="rf-secondary-button"
          onClick={() => fetchSettings(true)}
          disabled={refreshing}
          style={{
            marginTop: '14px',
          }}
        >

          <RefreshCw
            size={14}
            className={
              refreshing
                ? 'rf-button-spin'
                : ''
            }
          />

          {refreshing
            ? 'Retrying...'
            : 'Retry'}

        </button>

      </div>
    );
  }


  /* ==========================================================
     SAFE VALUES
     ========================================================== */

  const riskThreshold =
    Number(settings.riskThreshold) || 0;

  const embeddingDimension =
    Number(settings.gnnEmbeddingDim) || 128;

  const hopDepth =
    Number(settings.graphHopDepth) || 3;

  const strictTemporalMode =
    Boolean(settings.strictTemporalMode);

  const autoFlagHighRiskRings =
    Boolean(settings.autoFlagHighRiskRings);


  /* ==========================================================
     MAIN PAGE
     ========================================================== */

  return (
    <div className="rf-settings-page">

      {/* ======================================================
          PAGE HEADER
          ====================================================== */}

      <header className="rf-settings-header">

        <div className="rf-settings-header-content">

          <div className="rf-settings-title-group">

            <div className="rf-settings-title-icon">
              <Sliders size={21} />
            </div>

            <div>

              <div className="rf-settings-kicker">

                <span></span>

                SYSTEM CONFIGURATION

              </div>

              <h1>
                Platform &amp; GNN Model Settings
              </h1>

              <p>
                Configure thresholds, subgraph convolution
                depths &amp; security parameters
              </p>

            </div>

          </div>


          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >

            <button
              type="button"
              className="rf-secondary-button"
              onClick={() => fetchSettings(true)}
              disabled={refreshing || saving}
            >

              <RefreshCw
                size={14}
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


            <button
              type="submit"
              form="ringfinder-settings-form"
              className="rf-settings-save-button"
              disabled={saving}
            >

              {saving ? (
                <>

                  <span className="rf-button-loader"></span>

                  Saving...

                </>
              ) : (
                <>

                  <Save size={14} />

                  Save System Settings

                </>
              )}

            </button>

          </div>

        </div>

      </header>


      {/* ======================================================
          ERROR MESSAGE
          ====================================================== */}

      {error && (

        <div
          style={{
            margin: '16px 24px',
            padding: '13px 15px',
            border:
              '1px solid rgba(239,68,68,0.35)',
            background:
              'rgba(239,68,68,0.08)',
            color: '#fca5a5',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >

          <AlertTriangle size={16} />

          <span>
            {error}
          </span>

        </div>

      )}


      {/* ======================================================
          SAVE NOTIFICATION
          ====================================================== */}

      {savedMessage && (

        <div
          className={`rf-settings-notification ${
            savedMessage.startsWith('Failed')
              ? 'rf-settings-notification-error'
              : 'rf-settings-notification-success'
          }`}
        >

          {savedMessage.startsWith('Failed') ? (
            <AlertTriangle size={16} />
          ) : (
            <CheckCircle2 size={16} />
          )}

          <span>
            {savedMessage}
          </span>

        </div>

      )}


      {/* ======================================================
          SETTINGS FORM
          ====================================================== */}

      <form
        id="ringfinder-settings-form"
        onSubmit={handleSave}
        className="rf-settings-form"
      >

        {/* ====================================================
            RISK & ANOMALY THRESHOLDS
            ==================================================== */}

        <section className="rf-settings-panel">

          <div className="rf-settings-panel-header">

            <div className="rf-settings-panel-icon">
              <AlertTriangle size={15} />
            </div>

            <div>

              <div className="rf-settings-panel-kicker">
                DETECTION ENGINE
              </div>

              <h2>
                Risk &amp; Anomaly Thresholds
              </h2>

            </div>

          </div>


          <div className="rf-settings-fields">

            {/* Risk Score */}

            <div className="rf-settings-field">

              <div className="rf-settings-label-row">

                <label htmlFor="risk-threshold">
                  Minimum Risk Score Threshold
                </label>

                <span className="rf-settings-value">
                  {riskThreshold}%
                </span>

              </div>

              <input
                id="risk-threshold"
                type="range"
                min="50"
                max="95"
                value={riskThreshold}
                onChange={(e) =>
                  updateSetting(
                    'riskThreshold',
                    parseInt(
                      e.target.value,
                      10
                    )
                  )
                }
                className="rf-settings-range"
              />

              <div className="rf-settings-range-labels">

                <span>50%</span>

                <span>95%</span>

              </div>

              <p className="rf-settings-help">
                Transactions above this score will
                trigger immediate analyst alerts.
              </p>

            </div>


            {/* Temporal Cutoff */}

            <div className="rf-settings-field">

              <label
                htmlFor="temporal-cutoff"
                className="rf-settings-label"
              >
                Temporal Cutoff Boundary Date
              </label>

              <div className="rf-settings-input-wrapper">

                <CalendarClock size={14} />

                <input
                  id="temporal-cutoff"
                  type="date"
                  value={
                    settings.temporalCutoffDate || ''
                  }
                  onChange={(e) =>
                    updateSetting(
                      'temporalCutoffDate',
                      e.target.value
                    )
                  }
                  className="rf-settings-input"
                />

              </div>

              <p className="rf-settings-help">
                Cutoff barrier separating historical
                training from test inference.
              </p>

            </div>

          </div>

        </section>


        {/* ====================================================
            GNN PARAMETERS
            ==================================================== */}

        <section className="rf-settings-panel">

          <div className="rf-settings-panel-header">

            <div className="rf-settings-panel-icon rf-settings-panel-icon-cyan">
              <Cpu size={15} />
            </div>

            <div>

              <div className="rf-settings-panel-kicker">
                GRAPH NEURAL NETWORK
              </div>

              <h2>
                Graph Neural Network Parameters
              </h2>

            </div>

          </div>


          <div className="rf-settings-fields">

            {/* Embedding Dimensions */}

            <div className="rf-settings-field">

              <label
                htmlFor="embedding-dim"
                className="rf-settings-label"
              >
                Graph Embedding Dimensions
              </label>

              <div className="rf-settings-select-wrapper">

                <Database size={13} />

                <select
                  id="embedding-dim"
                  value={embeddingDimension}
                  onChange={(e) =>
                    updateSetting(
                      'gnnEmbeddingDim',
                      parseInt(
                        e.target.value,
                        10
                      )
                    )
                  }
                  className="rf-settings-select"
                >

                  <option value={64}>
                    64 Dimensions (Fast Inference)
                  </option>

                  <option value={128}>
                    128 Dimensions (Balanced Production)
                  </option>

                  <option value={256}>
                    256 Dimensions (High Precision Deep)
                  </option>

                </select>

              </div>

              <p className="rf-settings-help">
                Controls the dimensionality of graph
                node embeddings.
              </p>

            </div>


            {/* Hop Depth */}

            <div className="rf-settings-field">

              <label
                htmlFor="hop-depth"
                className="rf-settings-label"
              >
                Subgraph Hop Depth
              </label>

              <div className="rf-settings-select-wrapper">

                <Cpu size={13} />

                <select
                  id="hop-depth"
                  value={hopDepth}
                  onChange={(e) =>
                    updateSetting(
                      'graphHopDepth',
                      parseInt(
                        e.target.value,
                        10
                      )
                    )
                  }
                  className="rf-settings-select"
                >

                  <option value={2}>
                    2 Hops (Direct Counterparties)
                  </option>

                  <option value={3}>
                    3 Hops (Layering &amp; Mixers)
                  </option>

                  <option value={4}>
                    4 Hops (Deep Sybil Networks)
                  </option>

                </select>

              </div>

              <p className="rf-settings-help">
                Determines how many graph layers are
                traversed during neighborhood analysis.
              </p>

            </div>

          </div>

        </section>


        {/* ====================================================
            SECURITY CONTROLS
            ==================================================== */}

        <section className="rf-settings-panel rf-settings-security-panel">

          <div className="rf-settings-panel-header">

            <div className="rf-settings-panel-icon rf-settings-panel-icon-green">
              <ShieldCheck size={15} />
            </div>

            <div>

              <div className="rf-settings-panel-kicker">
                SECURITY AUTOMATION
              </div>

              <h2>
                Automated Sentinel Controls
              </h2>

            </div>

          </div>


          <div className="rf-settings-security-grid">

            {/* Strict Temporal Mode */}

            <label
              htmlFor="strict-temporal"
              className={`rf-settings-toggle-card ${
                strictTemporalMode
                  ? 'rf-settings-toggle-active'
                  : ''
              }`}
            >

              <div className="rf-settings-checkbox-wrapper">

                <input
                  id="strict-temporal"
                  type="checkbox"
                  checked={strictTemporalMode}
                  onChange={(e) =>
                    updateSetting(
                      'strictTemporalMode',
                      e.target.checked
                    )
                  }
                />

                <span className="rf-settings-custom-check">

                  <CheckCircle2 size={12} />

                </span>

              </div>


              <div className="rf-settings-toggle-content">

                <div className="rf-settings-toggle-title">

                  <ShieldCheck size={13} />

                  Enforce Strict Temporal Validation

                </div>

                <span className="rf-settings-toggle-description">
                  Block random train/test data splitting
                  globally.
                </span>

              </div>


              <span className="rf-settings-toggle-state">

                {strictTemporalMode
                  ? 'ENABLED'
                  : 'DISABLED'}

              </span>

            </label>


            {/* Auto Flag */}

            <label
              htmlFor="auto-flag-rings"
              className={`rf-settings-toggle-card ${
                autoFlagHighRiskRings
                  ? 'rf-settings-toggle-active'
                  : ''
              }`}
            >

              <div className="rf-settings-checkbox-wrapper">

                <input
                  id="auto-flag-rings"
                  type="checkbox"
                  checked={autoFlagHighRiskRings}
                  onChange={(e) =>
                    updateSetting(
                      'autoFlagHighRiskRings',
                      e.target.checked
                    )
                  }
                />

                <span className="rf-settings-custom-check">

                  <CheckCircle2 size={12} />

                </span>

              </div>


              <div className="rf-settings-toggle-content">

                <div className="rf-settings-toggle-title">

                  <Bell size={13} />

                  Auto-Flag High Risk Rings

                </div>

                <span className="rf-settings-toggle-description">
                  Automatically isolate ring clusters
                  with score &gt; 90.
                </span>

              </div>


              <span className="rf-settings-toggle-state">

                {autoFlagHighRiskRings
                  ? 'ENABLED'
                  : 'DISABLED'}

              </span>

            </label>

          </div>

        </section>

      </form>


      {/* ======================================================
          FOOTER
          ====================================================== */}

      <footer className="rf-settings-footer">

        <div className="rf-settings-footer-status">

          <span></span>

          PLATFORM CONFIGURATION ONLINE

        </div>

        <div className="rf-settings-footer-text">

          Configuration changes are persisted through
          the RingFinder administration service.

        </div>

      </footer>

    </div>
  );
};


export default SystemSettings;