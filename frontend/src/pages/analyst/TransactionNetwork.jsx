import React, { useState, useEffect, useCallback } from 'react';
import {
  Share2,
  Info,
  Eye,
  Layers,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

import NetworkGraph from '../../components/NetworkGraph';
import LoadingSpinner from '../../components/LoadingSpinner';
import fraudService from '../../services/fraudService';

import '../../styles/transaction-network.css';

export const TransactionNetwork = () => {
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchGraph = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError('');

    try {
      const data = await fraudService.getNetworkData();

      console.log('Transaction Network API response:', data);

      if (!data) {
        throw new Error('No graph data received from the backend.');
      }

      const nodes = Array.isArray(data.nodes)
        ? data.nodes
        : [];

      const edges = Array.isArray(data.edges)
        ? data.edges
        : [];

      setGraphData({
        ...data,
        nodes,
        edges,
      });
    } catch (err) {
      console.error(
        'Failed to fetch transaction network:',
        err
      );

      setGraphData(null);

      setError(
        err?.message ||
          'Unable to connect to the transaction network API.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchGraph();
  }, [fetchGraph]);

  /* =========================================================
     LOADING STATE
  ========================================================= */

  if (loading) {
    return (
      <div className="rf-network-loading">
        <LoadingSpinner
          label="Loading Bitcoin Transaction Network..."
        />
      </div>
    );
  }

  /* =========================================================
     ERROR STATE
  ========================================================= */

  if (!graphData) {
    return (
      <div className="rf-network-error">
        <div className="rf-network-error-icon">
          <AlertTriangle size={21} />
        </div>

        <div className="rf-network-error-content">
          <span className="rf-network-error-label">
            GRAPH ENGINE ERROR
          </span>

          <h2>
            Transaction Network Unavailable
          </h2>

          <p>
            {error ||
              'Unable to load Bitcoin transaction graph data.'}
          </p>

          <div className="rf-network-error-hint">
            <span />
            Verify that the Django backend is running on
            localhost:8000.
          </div>

          <button
            type="button"
            className="rf-network-retry-button"
            onClick={() => fetchGraph()}
          >
            <RefreshCw size={14} />
            Retry Graph Load
          </button>
        </div>
      </div>
    );
  }

  /* =========================================================
     GRAPH DATA
  ========================================================= */

  const nodeCount = Array.isArray(graphData.nodes)
    ? graphData.nodes.length
    : 0;

  const edgeCount = Array.isArray(graphData.edges)
    ? graphData.edges.length
    : 0;

  const graphStats = graphData.stats || {};

  return (
    <div className="rf-transaction-network-page">

      {/* =====================================================
          1. PAGE HEADER
      ===================================================== */}

      <section className="rf-network-page-header">

        <div className="rf-network-header-content">

          <div className="rf-network-title-row">

            <div className="rf-network-title-icon">
              <Share2 size={22} />
            </div>

            <div className="rf-network-title-content">

              <div className="rf-network-title-line">

                <h2>
                  Bitcoin Transaction Sub-Graph Visualizer
                </h2>

                <span className="rf-network-live-badge">
                  <span className="rf-network-live-dot" />
                  LIVE GRAPH
                </span>

              </div>

              <p>
                Visualizing Directed Hops, Multi-Input Wash
                Loops, and Sybil Node Clusters
              </p>

            </div>

          </div>

        </div>

        {/* =================================================
            GRAPH STATISTICS
        ================================================= */}

        <div className="rf-network-header-actions">

          <div className="rf-network-stats">

            <div className="rf-network-stat-card">

              <div className="rf-network-stat-icon rf-network-stat-cyan">
                <Eye size={15} />
              </div>

              <div className="rf-network-stat-content">

                <span>
                  Nodes
                </span>

                <strong>
                  {nodeCount.toLocaleString()}
                </strong>

                <small>
                  Wallets
                </small>

              </div>

            </div>

            <div className="rf-network-stat-card">

              <div className="rf-network-stat-icon rf-network-stat-purple">
                <Layers size={15} />
              </div>

              <div className="rf-network-stat-content">

                <span>
                  Edges
                </span>

                <strong>
                  {edgeCount.toLocaleString()}
                </strong>

                <small>
                  Hops
                </small>

              </div>

            </div>

          </div>

          <button
            type="button"
            className="rf-network-refresh-button"
            onClick={() => fetchGraph(true)}
            disabled={refreshing}
          >
            <RefreshCw
              size={14}
              className={
                refreshing
                  ? 'rf-network-refresh-spin'
                  : ''
              }
            />

            {refreshing
              ? 'Refreshing...'
              : 'Refresh Graph'}
          </button>

        </div>

      </section>

      {/* =====================================================
          2. GRAPH STATUS BAR
      ===================================================== */}

      <section className="rf-network-status-bar">

        <div className="rf-network-status-left">

          <span className="rf-network-operational">
            <span />
            GRAPH ENGINE OPERATIONAL
          </span>

          <span className="rf-network-status-divider" />

          <span>
            Directed Transaction Analysis
          </span>

        </div>

        <div className="rf-network-status-right">

          <Info size={13} />

          <span>
            Select nodes or transaction edges for inspection
          </span>

        </div>

      </section>

      {/* =====================================================
          3. INTERACTIVE GRAPH
      ===================================================== */}

      <section className="rf-network-graph-section">

        <div className="rf-network-graph-heading">

          <div>

            <span className="rf-network-eyebrow">
              GRAPH ANALYTICS ENGINE
            </span>

            <h3>
              Transaction Relationship Network
            </h3>

            <p>
              Directed wallet-to-wallet transaction
              relationships extracted from the active
              Bitcoin transaction dataset.
            </p>

          </div>

          <span className="rf-network-engine-badge">
            GNN SUB-GRAPH
          </span>

        </div>

        {/* Backend status information */}

        <div className="rf-network-data-meta">

          <div className="rf-network-data-source">
            <span className="rf-network-meta-dot" />

            <span>
              BACKEND GRAPH DATA
            </span>
          </div>

          {graphStats?.suspicious_nodes !== undefined && (
            <div className="rf-network-meta-item">
              Suspicious Nodes:{' '}
              <strong>
                {Number(
                  graphStats.suspicious_nodes
                ).toLocaleString()}
              </strong>
            </div>
          )}

          {graphStats?.suspicious_edges !== undefined && (
            <div className="rf-network-meta-item">
              Suspicious Edges:{' '}
              <strong>
                {Number(
                  graphStats.suspicious_edges
                ).toLocaleString()}
              </strong>
            </div>
          )}

        </div>

        <div className="rf-network-graph-container">
          <NetworkGraph data={graphData} />
        </div>

      </section>

      {/* =====================================================
          4. GRAPH FOOTER
      ===================================================== */}

      <footer className="rf-network-footer">

        <div className="rf-network-footer-status">
          <span className="rf-network-footer-dot" />
          NETWORK ANALYSIS ACTIVE
        </div>

        <span className="rf-network-footer-divider" />

        <span>
          {nodeCount.toLocaleString()} wallet nodes
          {' • '}
          {edgeCount.toLocaleString()} transaction edges
        </span>

      </footer>

    </div>
  );
};

export default TransactionNetwork;