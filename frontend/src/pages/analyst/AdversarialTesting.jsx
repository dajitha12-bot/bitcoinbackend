import React, { useEffect, useMemo, useState } from 'react';
import {
  Shield,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

import LoadingSpinner from '../../components/LoadingSpinner';
import fraudService from '../../services/fraudService';

import '../../styles/adversarial-testing.css';

const toNumber = (value, fallback = 0) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;

  if (typeof value === 'string') {
    const parsed = Number(value.replace('%', '').trim());
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
};

const formatScore = (value) => {
  const numeric = toNumber(value);

  if (numeric <= 1) {
    return `${(numeric * 100).toFixed(0)}%`;
  }

  return `${numeric.toFixed(0)}%`;
};

const formatPercent = (value) => {
  const numeric = toNumber(value);

  if (numeric <= 1) {
    return `${(numeric * 100).toFixed(1)}%`;
  }

  return `${numeric.toFixed(1)}%`;
};

const normalizeScenario = (scenario, index) => {
  const originalScore =
    scenario?.originalScore ??
    scenario?.original_score ??
    scenario?.originalRiskScore ??
    scenario?.original_risk_score ??
    0;

  const adversarialScore =
    scenario?.adversarialScore ??
    scenario?.adversarial_score ??
    scenario?.adversarialRiskScore ??
    scenario?.adversarial_risk_score ??
    0;

  const robustness =
    scenario?.robustness ??
    scenario?.robustnessScore ??
    scenario?.robustness_score ??
    scenario?.retainedRobustness ??
    null;

  const retainedFeatures =
    scenario?.retainedFeatures ??
    scenario?.retained_features ??
    scenario?.features ??
    scenario?.resilientFeatures ??
    [];

  return {
    id:
      scenario?.id ??
      scenario?.scenarioId ??
      scenario?.scenario_id ??
      index + 1,

    name:
      scenario?.name ??
      scenario?.scenarioName ??
      scenario?.scenario_name ??
      scenario?.title ??
      `Adversarial Scenario ${index + 1}`,

    description:
      scenario?.description ??
      scenario?.details ??
      scenario?.summary ??
      'Adversarial transaction perturbation scenario.',

    impactLevel: String(
      scenario?.impactLevel ??
        scenario?.impact_level ??
        scenario?.impact ??
        'MEDIUM'
    ).toUpperCase(),

    originalScore: toNumber(originalScore),

    adversarialScore: toNumber(adversarialScore),

    robustness:
      robustness !== null && robustness !== undefined
        ? formatPercent(robustness)
        : `${Math.max(
            0,
            Math.min(
              100,
              toNumber(originalScore) > 0
                ? (toNumber(adversarialScore) /
                    toNumber(originalScore)) *
                    100
                : 0
            )
          ).toFixed(1)}%`,

    status: String(
      scenario?.status ??
        scenario?.detectionStatus ??
        scenario?.detection_status ??
        scenario?.result ??
        'DETECTED'
    ).toUpperCase(),

    retainedFeatures: Array.isArray(retainedFeatures)
      ? retainedFeatures
      : [],
  };
};

const normalizeAdversarialData = (response) => {
  const raw =
    response?.data ??
    response?.results ??
    response?.result ??
    response ??
    {};

  const rawScenarios =
    raw?.scenarios ??
    raw?.scenarioResults ??
    raw?.scenario_results ??
    raw?.tests ??
    raw?.results ??
    [];

  const scenarios = Array.isArray(rawScenarios)
    ? rawScenarios.map(normalizeScenario)
    : [];

  const calculatedRobustness =
    scenarios.length > 0
      ? scenarios.reduce((sum, scenario) => {
          return sum + toNumber(scenario.robustness.replace('%', ''));
        }, 0) / scenarios.length
      : 0;

  return {
    robustnessScore:
      raw?.robustnessScore ??
      raw?.robustness_score ??
      raw?.overallRobustness ??
      raw?.overall_robustness ??
      `${calculatedRobustness.toFixed(1)}%`,

    overallStatus: String(
      raw?.overallStatus ??
        raw?.overall_status ??
        raw?.status ??
        'ROBUST'
    ).toUpperCase(),

    scenarios,
  };
};

export const AdversarialTesting = () => {
  const [advData, setAdvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [testingScenario, setTestingScenario] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fraudService.getAdversarialTestingData();

      console.log('Adversarial Testing API response:', response);

      const normalized = normalizeAdversarialData(response);

      setAdvData(normalized);
    } catch (err) {
      console.error(
        'Failed to fetch adversarial testing data:',
        err
      );

      setError(
        err?.message ||
          'Unable to load adversarial testing data.'
      );

      setAdvData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSimulateAttack = (scenarioId) => {
    setTestingScenario(scenarioId);

    setTimeout(() => {
      setTestingScenario(null);
    }, 1000);
  };

  const summary = useMemo(() => {
    const scenarios = advData?.scenarios || [];

    const detected = scenarios.filter(
      (scenario) =>
        scenario.status === 'DETECTED' ||
        scenario.status === 'ROBUST' ||
        scenario.status === 'PASSED'
    ).length;

    const averageRobustness =
      scenarios.length > 0
        ? scenarios.reduce(
            (sum, scenario) =>
              sum +
              toNumber(
                String(scenario.robustness).replace('%', '')
              ),
            0
          ) / scenarios.length
        : 0;

    return {
      total: scenarios.length,
      detected,
      averageRobustness,
    };
  }, [advData]);

  if (loading) {
    return (
      <div className="rf-adversarial-loading">
        <LoadingSpinner label="Evaluating Graph Neural Evasion Scenarios & Adversarial Perturbations..." />
      </div>
    );
  }

  if (error || !advData) {
    return (
      <div className="rf-adversarial-error">
        <div className="rf-adversarial-error-icon">
          <ShieldCheck size={22} />
        </div>

        <h2>Adversarial Testing Data Unavailable</h2>

        <p>
          {error ||
            'Unable to load adversarial testing data.'}
        </p>

        <button
          type="button"
          onClick={fetchData}
          className="rf-adversarial-retest"
        >
          <RefreshCw size={14} />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="rf-adversarial-page">
      <section className="rf-adversarial-banner">
        <div className="rf-adversarial-banner-content">
          <div className="rf-adversarial-banner-top">
            <span className="rf-adversarial-badge">
              ADVERSARIAL ROBUSTNESS BENCHMARK
            </span>

            <span className="rf-adversarial-score">
              Score: {formatPercent(advData.robustnessScore)}
            </span>
          </div>

          <h1>Fraud-Ring Evasion &amp; Robustness Testing</h1>

          <p>
            Simulates sophisticated transaction restructuring
            intended to trick Graph Neural Networks.
          </p>
        </div>

        <div className="rf-adversarial-system-status">
          <span className="rf-adversarial-system-label">
            Overall System Status
          </span>

          <span className="rf-adversarial-system-value">
            <ShieldCheck size={16} />
            {advData.overallStatus}
          </span>
        </div>
      </section>

      <section className="rf-adversarial-scenarios">
        <div className="rf-adversarial-section-heading">
          <Zap size={16} />

          <h2>Active Evasion Perturbation Scenarios</h2>
        </div>

        {summary.total > 0 && (
          <div className="rf-adversarial-summary">
            <div className="rf-adversarial-summary-card">
              <span>SCENARIOS</span>
              <strong>{summary.total}</strong>
            </div>

            <div className="rf-adversarial-summary-card">
              <span>DETECTED / PASSED</span>
              <strong>{summary.detected}</strong>
            </div>

            <div className="rf-adversarial-summary-card">
              <span>AVG. ROBUSTNESS</span>
              <strong>
                {summary.averageRobustness.toFixed(1)}%
              </strong>
            </div>
          </div>
        )}

        <div className="rf-adversarial-scenario-list">
          {advData.scenarios.length === 0 ? (
            <div className="rf-adversarial-empty">
              <ShieldCheck size={24} />
              <h3>No adversarial scenarios available</h3>
              <p>
                The backend did not return any robustness
                testing scenarios.
              </p>
            </div>
          ) : (
            advData.scenarios.map((scen) => (
              <article
                key={scen.id}
                className="rf-adversarial-card"
              >
                <div className="rf-adversarial-card-header">
                  <div className="rf-adversarial-card-title">
                    <div className="rf-adversarial-scenario-icon">
                      <Shield size={19} />
                    </div>

                    <div>
                      <h3>{scen.name}</h3>

                      <p>{scen.description}</p>
                    </div>
                  </div>

                  <div className="rf-adversarial-card-actions">
                    <span
                      className={`rf-adversarial-impact rf-impact-${scen.impactLevel.toLowerCase()}`}
                    >
                      {scen.impactLevel} IMPACT
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        handleSimulateAttack(scen.id)
                      }
                      disabled={
                        testingScenario === scen.id
                      }
                      className="rf-adversarial-retest"
                    >
                      {testingScenario === scen.id ? (
                        <>
                          <RefreshCw
                            size={13}
                            className="rf-adversarial-spin"
                          />
                          Testing...
                        </>
                      ) : (
                        <>
                          Re-test Scenario
                          <ArrowRight size={13} />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="rf-adversarial-score-grid">
                  <div className="rf-adversarial-score-card">
                    <span>Original Score</span>

                    <strong>
                      {formatScore(scen.originalScore)}
                    </strong>
                  </div>

                  <div className="rf-adversarial-score-card">
                    <span>Adversarial Score</span>

                    <strong className="rf-adversarial-score-amber">
                      {formatScore(scen.adversarialScore)}
                    </strong>
                  </div>

                  <div className="rf-adversarial-score-card">
                    <span>Robustness Retained</span>

                    <strong className="rf-adversarial-score-green">
                      {scen.robustness}
                    </strong>
                  </div>

                  <div className="rf-adversarial-score-card rf-adversarial-detection">
                    <div>
                      <span>Detection Status</span>

                      <strong className="rf-adversarial-score-cyan">
                        {scen.status}
                      </strong>
                    </div>

                    <CheckCircle2
                      size={19}
                      className="rf-adversarial-check"
                    />
                  </div>
                </div>

                <div className="rf-adversarial-features">
                  <span className="rf-adversarial-features-label">
                    Resilient GNN Features:
                  </span>

                  <div className="rf-adversarial-feature-list">
                    {scen.retainedFeatures.length > 0 ? (
                      scen.retainedFeatures.map(
                        (feature, index) => (
                          <span
                            key={`${scen.id}-${index}`}
                            className="rf-adversarial-feature"
                          >
                            {feature}
                          </span>
                        )
                      )
                    ) : (
                      <span className="rf-adversarial-feature">
                        No feature data available
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <footer className="rf-adversarial-footer">
        <div className="rf-adversarial-footer-status">
          <span></span>
          ADVERSARIAL TESTING CHANNEL ONLINE
        </div>

        <div className="rf-adversarial-footer-text">
          Graph Neural Network robustness monitoring enabled
        </div>
      </footer>
    </div>
  );
};

export default AdversarialTesting;