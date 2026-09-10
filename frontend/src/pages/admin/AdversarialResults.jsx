import React, { useEffect, useState, useCallback } from 'react';

import {
  Shield,
  CheckCircle2,
  Zap,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

import LoadingSpinner from '../../components/LoadingSpinner';
import fraudService from '../../services/fraudService';

import '../../styles/adversarial-results.css';


/* ============================================================
   ADMIN ADVERSARIAL RESULTS
   Real Django API Integration
   ============================================================ */

export const AdversarialResults = () => {
  const [advData, setAdvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');


  /* ==========================================================
     NORMALIZE BACKEND RESPONSE
     ========================================================== */

  const normalizeResponse = (response) => {
    if (!response) {
      return {
        robustnessScore: null,
        scenarios: [],
      };
    }

    const source =
      response?.data ||
      response;

    let scenarios =
      source?.scenarios ||
      source?.results ||
      source?.tests ||
      source?.data?.scenarios ||
      [];

    if (!Array.isArray(scenarios)) {
      scenarios = [];
    }

    const robustnessScore =
      source?.robustnessScore ??
      source?.robustness_score ??
      source?.overallRobustness ??
      source?.overall_robustness ??
      source?.score ??
      null;

    return {
      ...source,
      robustnessScore,
      scenarios,
    };
  };


  /* ==========================================================
     FORMAT ROBUSTNESS SCORE
     ========================================================== */

  const formatScore = (value) => {
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


  /* ==========================================================
     FORMAT SCENARIO SCORE
     ========================================================== */

  const formatScenarioScore = (value) => {
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


  /* ==========================================================
     LOAD ADVERSARIAL DATA
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
        await fraudService.getAdversarialTestingData();

      console.log(
        'Adversarial Results API response:',
        response
      );

      const normalized =
        normalizeResponse(response);

      setAdvData(normalized);

    } catch (err) {
      console.error(
        'Failed to fetch adversarial results:',
        err
      );

      setAdvData(null);

      setError(
        err?.message ||
        'Unable to load adversarial resilience metrics from the backend.'
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
     LOADING
     ========================================================== */

  if (loading) {
    return (
      <div className="rf-adversarial-loading">

        <LoadingSpinner
          label="Loading Adversarial Metrics Payload..."
        />

      </div>
    );
  }


  /* ==========================================================
     ERROR STATE
     ========================================================== */

  if (error) {
    return (
      <div className="rf-adversarial-error">

        <div className="rf-adversarial-error-icon">
          <AlertTriangle size={22} />
        </div>

        <div>
          <h2>
            Adversarial Metrics Unavailable
          </h2>

          <p>
            {error}
          </p>
        </div>

        <button
          type="button"
          className="rf-adversarial-refresh"
          onClick={() => fetchData(true)}
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
            ? 'Refreshing'
            : 'Retry'}

        </button>

      </div>
    );
  }


  /* ==========================================================
     SAFE DATA
     ========================================================== */

  const scenarios =
    Array.isArray(advData?.scenarios)
      ? advData.scenarios
      : [];

  const robustnessScore =
    formatScore(
      advData?.robustnessScore
    );


  /* ==========================================================
     DETECTION SUMMARY
     ========================================================== */

  const detectedCount =
    scenarios.filter((scenario) => {
      const status =
        String(
          scenario?.status ||
          scenario?.result ||
          ''
        ).toUpperCase();

      return (
        status === 'DETECTED' ||
        status === 'PASS' ||
        status === 'PASSED' ||
        status === 'SUCCESS'
      );
    }).length;


  /* ==========================================================
     MAIN PAGE
     ========================================================== */

  return (
    <div className="rf-adversarial-page">

      {/* ======================================================
          HEADER
          ====================================================== */}

      <header className="rf-adversarial-header">

        <div className="rf-adversarial-header-content">

          <div className="rf-adversarial-title-group">

            <div className="rf-adversarial-title-icon">
              <Shield size={21} />
            </div>

            <div>

              <div className="rf-adversarial-kicker">

                <span></span>

                SECURITY VALIDATION

              </div>

              <h1>
                Admin Adversarial Resilience Metrics
              </h1>

              <p>
                Systemic Attack Resistance &amp; Graph
                Evasion Benchmark Analytics
              </p>

            </div>

          </div>


          {/* ==================================================
              OVERALL SCORE
              ================================================== */}

          <div className="rf-adversarial-score">

            <div className="rf-adversarial-score-icon">
              <Zap size={15} />
            </div>

            <div>

              <span>
                OVERALL ROBUSTNESS
              </span>

              <strong>
                {robustnessScore}
              </strong>

            </div>

          </div>

        </div>

      </header>


      {/* ======================================================
          SUMMARY
          ====================================================== */}

      <section className="rf-adversarial-summary">

        <div className="rf-adversarial-summary-item">

          <span className="rf-adversarial-summary-label">
            TEST SCENARIOS
          </span>

          <strong>
            {scenarios.length}
          </strong>

        </div>


        <div className="rf-adversarial-summary-divider"></div>


        <div className="rf-adversarial-summary-item">

          <span className="rf-adversarial-summary-label">
            DETECTED
          </span>

          <strong className="rf-text-green">
            {detectedCount}
          </strong>

        </div>


        <div className="rf-adversarial-summary-divider"></div>


        <div className="rf-adversarial-summary-item">

          <span className="rf-adversarial-summary-label">
            MODEL DEFENSE
          </span>

          <strong className="rf-text-cyan">
            {scenarios.length > 0
              ? 'ENABLED'
              : 'N/A'}
          </strong>

        </div>


        <button
          type="button"
          className="rf-adversarial-refresh"
          onClick={() => fetchData(true)}
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
            ? 'Refreshing'
            : 'Refresh Metrics'}

        </button>

      </section>


      {/* ======================================================
          SCENARIOS
          ====================================================== */}

      <section className="rf-adversarial-section">

        <div className="rf-adversarial-section-header">

          <div>

            <div className="rf-section-kicker">

              <Shield size={14} />

              ADVERSARIAL TEST SUITE

            </div>

            <h2>
              Attack Resistance Scenarios
            </h2>

            <p>
              Controlled graph manipulation scenarios
              evaluated against the fraud detection
              architecture.
            </p>

          </div>


          <span className="rf-adversarial-live">

            <span></span>

            {scenarios.length > 0
              ? 'BENCHMARK COMPLETE'
              : 'NO BENCHMARK DATA'}

          </span>

        </div>


        <div className="rf-adversarial-scenarios">

          {scenarios.length > 0 ? (

            scenarios.map((scenario, index) => {

              const scenarioName =
                scenario?.name ||
                scenario?.scenario ||
                scenario?.attackType ||
                scenario?.attack_type ||
                `Scenario ${index + 1}`;

              const description =
                scenario?.description ||
                scenario?.details ||
                scenario?.message ||
                'Adversarial test scenario evaluated by the fraud detection pipeline.';

              const robustness =
                scenario?.robustness ??
                scenario?.robustnessScore ??
                scenario?.robustness_score ??
                scenario?.score ??
                scenario?.accuracy ??
                null;

              const status =
                scenario?.status ||
                scenario?.result ||
                scenario?.outcome ||
                'EVALUATED';


              return (
                <div
                  key={
                    scenario?.id ??
                    scenario?._id ??
                    scenario?.scenarioId ??
                    index
                  }
                  className="rf-adversarial-scenario"
                >

                  {/* ==========================================
                      SCENARIO NUMBER
                      ========================================== */}

                  <div className="rf-adversarial-number">

                    {String(index + 1).padStart(2, '0')}

                  </div>


                  {/* ==========================================
                      SCENARIO INFORMATION
                      ========================================== */}

                  <div className="rf-adversarial-scenario-info">

                    <div className="rf-adversarial-scenario-name">
                      {scenarioName}
                    </div>

                    <div className="rf-adversarial-scenario-description">
                      {description}
                    </div>

                  </div>


                  {/* ==========================================
                      RESULT
                      ========================================== */}

                  <div className="rf-adversarial-result">

                    <div className="rf-adversarial-result-score">

                      <CheckCircle2 size={14} />

                      <strong>
                        {formatScenarioScore(
                          robustness
                        )}
                      </strong>

                    </div>

                    <span>
                      {String(status).toUpperCase()}
                    </span>

                  </div>

                </div>
              );
            })

          ) : (

            <div className="rf-adversarial-empty">

              <Shield size={25} />

              <h3>
                No Adversarial Scenarios
              </h3>

              <p>
                No resilience benchmark scenarios
                are currently available from the backend.
              </p>

              <button
                type="button"
                className="rf-adversarial-refresh"
                onClick={() => fetchData(true)}
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

          )}

        </div>

      </section>


      {/* ======================================================
          SECURITY NOTE
          ====================================================== */}

      <section className="rf-adversarial-note">

        <div className="rf-adversarial-note-icon">
          <Shield size={17} />
        </div>

        <div>

          <span>
            DEFENSE VALIDATION
          </span>

          <p>
            Adversarial testing evaluates whether the
            temporal graph neural network maintains fraud
            detection capability when transaction topology
            or timing characteristics are intentionally
            manipulated.
          </p>

        </div>

      </section>

    </div>
  );
};


export default AdversarialResults;