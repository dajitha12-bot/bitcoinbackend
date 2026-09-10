import React, { useMemo, useState } from 'react';
import {
  Wallet,
  ShieldAlert,
  Info,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

import RiskBadge from './RiskBadge';
import '../styles/network-graph.css';

const VIEWBOX_WIDTH = 900;
const VIEWBOX_HEIGHT = 500;

const normalizeRisk = (node) => {
  if (!node) return 'LOW';

  if (
    typeof node.risk === 'string' &&
    ['HIGH', 'MEDIUM', 'LOW'].includes(node.risk.toUpperCase())
  ) {
    return node.risk.toUpperCase();
  }

  const score = Number(
    node.riskScore ??
      node.risk_score ??
      node.score ??
      0
  );

  if (score >= 70) return 'HIGH';
  if (score >= 40) return 'MEDIUM';

  if (
    node.isSuspicious ||
    node.is_suspicious ||
    node.suspicious
  ) {
    return 'HIGH';
  }

  return 'LOW';
};

const getNodeId = (node) =>
  String(
    node?.id ??
      node?.address ??
      node?.wallet ??
      node?.wallet_address ??
      ''
  );

const getEdgeSource = (edge) =>
  String(
    edge?.source ??
      edge?.source_id ??
      edge?.from ??
      edge?.from_address ??
      ''
  );

const getEdgeTarget = (edge) =>
  String(
    edge?.target ??
      edge?.target_id ??
      edge?.to ??
      edge?.to_address ??
      ''
  );

const normalizeAmount = (edge) => {
  const amount =
    edge?.amount ??
    edge?.value ??
    edge?.btc_amount ??
    edge?.value_btc ??
    0;

  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return String(amount);
  }

  if (numericAmount >= 100) {
    return numericAmount.toFixed(1);
  }

  if (numericAmount >= 1) {
    return numericAmount.toFixed(2);
  }

  return numericAmount.toFixed(4);
};

const createFallbackPosition = (index, total) => {
  const centerX = VIEWBOX_WIDTH / 2;
  const centerY = VIEWBOX_HEIGHT / 2;

  const radiusX = Math.min(
    310,
    130 + total * 12
  );

  const radiusY = Math.min(
    170,
    80 + total * 8
  );

  const angle =
    (index / Math.max(total, 1)) *
    Math.PI *
    2;

  return {
    x:
      centerX +
      Math.cos(angle) * radiusX,

    y:
      centerY +
      Math.sin(angle) * radiusY,
  };
};

export const NetworkGraph = ({ data }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [filterRiskOnly, setFilterRiskOnly] = useState(false);

  /* =========================================================
     NORMALIZE BACKEND GRAPH DATA
  ========================================================= */

  const normalizedData = useMemo(() => {
    if (!data) {
      return {
        nodes: [],
        edges: [],
      };
    }

    const rawNodes = Array.isArray(data.nodes)
      ? data.nodes
      : [];

    const rawEdges = Array.isArray(data.edges)
      ? data.edges
      : [];

    const nodes = rawNodes
      .map((node, index) => {
        const id = getNodeId(node);

        if (!id) {
          return null;
        }

        const fallback =
          createFallbackPosition(
            index,
            rawNodes.length
          );

        const x = Number(node.x);
        const y = Number(node.y);

        const risk = normalizeRisk(node);

        const riskScore = Number(
          node.riskScore ??
            node.risk_score ??
            node.score ??
            0
        );

        return {
          ...node,

          id,

          label:
            node.label ??
            node.address ??
            node.wallet ??
            node.wallet_address ??
            id,

          x: Number.isFinite(x)
            ? x
            : fallback.x,

          y: Number.isFinite(y)
            ? y
            : fallback.y,

          risk,

          riskScore: Number.isFinite(riskScore)
            ? riskScore
            : 0,

          btcBalance:
            node.btcBalance ??
            node.btc_balance ??
            node.balance ??
            0,

          type:
            node.type ??
            node.node_type ??
            node.role ??
            'wallet',

          ring:
            node.ring ??
            node.ring_id ??
            node.fraud_ring ??
            null,
        };
      })
      .filter(Boolean);

    const validNodeIds = new Set(
      nodes.map((node) => node.id)
    );

    const edges = rawEdges
      .map((edge, index) => {
        const source = getEdgeSource(edge);
        const target = getEdgeTarget(edge);

        if (
          !source ||
          !target ||
          !validNodeIds.has(source) ||
          !validNodeIds.has(target)
        ) {
          return null;
        }

        const suspicious =
          Boolean(
            edge.isSuspicious ??
              edge.is_suspicious ??
              edge.suspicious ??
              edge.is_fraud ??
              edge.fraudulent
          );

        return {
          ...edge,

          id:
            edge.id ??
            edge.txHash ??
            edge.tx_hash ??
            `edge-${index}`,

          source,

          target,

          amount: normalizeAmount(edge),

          txHash:
            edge.txHash ??
            edge.tx_hash ??
            edge.transaction_hash ??
            edge.hash ??
            `Transaction ${index + 1}`,

          isSuspicious: suspicious,
        };
      })
      .filter(Boolean);

    return {
      ...data,
      nodes,
      edges,
    };
  }, [data]);

  const allNodes = normalizedData.nodes;
  const allEdges = normalizedData.edges;

  /* =========================================================
     FILTER NODES
  ========================================================= */

  const nodes = filterRiskOnly
    ? allNodes.filter(
        (node) => node.risk === 'HIGH'
      )
    : allNodes;

  const visibleNodeIds = useMemo(
    () =>
      new Set(
        nodes.map((node) => node.id)
      ),
    [nodes]
  );

  const edges = filterRiskOnly
    ? allEdges.filter(
        (edge) =>
          visibleNodeIds.has(edge.source) &&
          visibleNodeIds.has(edge.target)
      )
    : allEdges;

  /* =========================================================
     NODE COLORS
  ========================================================= */

  const getNodeColor = (risk) => {
    switch (risk) {
      case 'HIGH':
        return {
          fill: '#ef4444',
          stroke: '#f87171',
          glow: 'rgba(239, 68, 68, 0.4)',
        };

      case 'MEDIUM':
        return {
          fill: '#f59e0b',
          stroke: '#fbbf24',
          glow: 'rgba(245, 158, 11, 0.4)',
        };

      default:
        return {
          fill: '#10b981',
          stroke: '#34d399',
          glow: 'rgba(16, 185, 129, 0.3)',
        };
    }
  };

  /* =========================================================
     SELECTION
  ========================================================= */

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  };

  const handleEdgeClick = (edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  };

  const clearSelection = () => {
    setSelectedNode(null);
    setSelectedEdge(null);
  };

  /* =========================================================
     HELPERS
  ========================================================= */

  const getNodeById = (id) =>
    nodes.find(
      (node) => node.id === String(id)
    );

  const formatBalance = (balance) => {
    const value = Number(balance);

    if (!Number.isFinite(value)) {
      return String(balance ?? '0');
    }

    return value.toLocaleString(
      undefined,
      {
        maximumFractionDigits: 8,
      }
    );
  };

  const truncateAddress = (
    address,
    start = 8,
    end = 6
  ) => {
    const value = String(address ?? '');

    if (value.length <= start + end + 3) {
      return value;
    }

    return `${value.slice(
      0,
      start
    )}...${value.slice(-end)}`;
  };

  /* =========================================================
     EMPTY GRAPH
  ========================================================= */

  if (!data || allNodes.length === 0) {
    return (
      <div className="rf-network-graph rf-network-graph-empty">
        <div className="rf-network-empty-icon">
          <Wallet size={30} />
        </div>

        <h3>
          No Transaction Network Data
        </h3>

        <p>
          The backend returned an empty Bitcoin
          transaction graph.
        </p>
      </div>
    );
  }

  return (
    <div className="rf-network-graph">

      {/* =====================================================
          GRAPH AREA
      ===================================================== */}

      <div className="rf-network-canvas">

        {/* ===================================================
            CONTROL BAR
        =================================================== */}

        <div className="rf-network-toolbar">

          <div className="rf-network-toolbar-left">

            <div className="rf-network-title">

              <span className="rf-network-live-dot" />

              <span>
                Bitcoin Network Topology
              </span>

            </div>

            <span className="rf-network-count">
              ({nodes.length} Wallets&nbsp; | &nbsp;
              {edges.length} Directed Hops)
            </span>

          </div>

          <div className="rf-network-toolbar-right">

            {/* Risk Filter */}

            <button
              type="button"
              onClick={() =>
                setFilterRiskOnly(
                  (previous) => !previous
                )
              }
              className={`rf-network-filter ${
                filterRiskOnly
                  ? 'rf-network-filter-active'
                  : ''
              }`}
            >
              {filterRiskOnly
                ? 'Show All Nodes'
                : 'Filter High Risk Only'}
            </button>

            {/* Zoom */}

            <div className="rf-network-zoom">

              <button
                type="button"
                onClick={() =>
                  setZoomLevel(
                    (previous) =>
                      Math.min(
                        previous + 0.15,
                        1.5
                      )
                  )
                }
                aria-label="Zoom in"
              >
                <ZoomIn size={14} />
              </button>

              <span>
                {(zoomLevel * 100).toFixed(0)}%
              </span>

              <button
                type="button"
                onClick={() =>
                  setZoomLevel(
                    (previous) =>
                      Math.max(
                        previous - 0.15,
                        0.6
                      )
                  )
                }
                aria-label="Zoom out"
              >
                <ZoomOut size={14} />
              </button>

            </div>

          </div>

        </div>

        {/* ===================================================
            SVG GRAPH
        =================================================== */}

        <div className="rf-network-svg-wrapper">

          <svg
            viewBox="0 0 900 500"
            className="rf-network-svg"
            style={{
              transform: `scale(${zoomLevel})`,
            }}
          >

            <defs>

              <marker
                id="rf-arrow"
                viewBox="0 0 10 10"
                refX="22"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path
                  d="M 0 0 L 10 5 L 0 10 z"
                  fill="#64748b"
                />
              </marker>

              <marker
                id="rf-arrow-risk"
                viewBox="0 0 10 10"
                refX="22"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path
                  d="M 0 0 L 10 5 L 0 10 z"
                  fill="#ef4444"
                />
              </marker>

            </defs>

            {/* =================================================
                TRANSACTION EDGES
            ================================================= */}

            {edges.map((edge) => {

              const srcNode =
                getNodeById(edge.source);

              const tgtNode =
                getNodeById(edge.target);

              if (!srcNode || !tgtNode) {
                return null;
              }

              const isSelected =
                selectedEdge?.id === edge.id;

              const midX =
                (srcNode.x + tgtNode.x) / 2;

              const midY =
                (srcNode.y + tgtNode.y) / 2;

              return (
                <g
                  key={edge.id}
                  className="rf-network-edge"
                  onClick={() =>
                    handleEdgeClick(edge)
                  }
                >

                  <line
                    x1={srcNode.x}
                    y1={srcNode.y}
                    x2={tgtNode.x}
                    y2={tgtNode.y}
                    stroke={
                      edge.isSuspicious
                        ? '#ef4444'
                        : isSelected
                        ? '#22d3ee'
                        : '#475569'
                    }
                    strokeWidth={
                      edge.isSuspicious ||
                      isSelected
                        ? 2.5
                        : 1.5
                    }
                    strokeDasharray={
                      edge.isSuspicious
                        ? '4 2'
                        : 'none'
                    }
                    markerEnd={
                      edge.isSuspicious
                        ? 'url(#rf-arrow-risk)'
                        : 'url(#rf-arrow)'
                    }
                    className="rf-network-edge-line"
                  />

                  {/* Amount Badge */}

                  <rect
                    x={midX - 30}
                    y={midY - 10}
                    width="60"
                    height="18"
                    rx="4"
                    fill="#0b1220"
                    stroke={
                      edge.isSuspicious
                        ? '#ef4444'
                        : '#334155'
                    }
                    strokeWidth="1"
                  />

                  <text
                    x={midX}
                    y={midY + 2}
                    fill={
                      edge.isSuspicious
                        ? '#fca5a5'
                        : '#94a3b8'
                    }
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="600"
                    textAnchor="middle"
                  >
                    {edge.amount} BTC
                  </text>

                </g>
              );
            })}

            {/* =================================================
                WALLET NODES
            ================================================= */}

            {nodes.map((node) => {

              const styling =
                getNodeColor(node.risk);

              const isSelected =
                selectedNode?.id === node.id;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="rf-network-node"
                  onClick={() =>
                    handleNodeClick(node)
                  }
                >

                  {/* Selected / High Risk Glow */}

                  {(node.risk === 'HIGH' ||
                    isSelected) && (
                    <circle
                      r={
                        isSelected
                          ? 27
                          : 22
                      }
                      fill={styling.glow}
                      className="rf-network-node-glow"
                    />
                  )}

                  {/* Main Node */}

                  <circle
                    r={
                      isSelected
                        ? 18
                        : 15
                    }
                    fill={styling.fill}
                    stroke={
                      isSelected
                        ? '#ffffff'
                        : styling.stroke
                    }
                    strokeWidth={
                      isSelected
                        ? 3
                        : 2
                    }
                    className="rf-network-node-circle"
                  />

                  {/* Wallet Label */}

                  <text
                    y="30"
                    textAnchor="middle"
                    fill="#e2e8f0"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="700"
                    className="rf-network-node-label"
                  >
                    {truncateAddress(node.label)}
                  </text>

                </g>
              );
            })}

          </svg>

        </div>

        {/* =====================================================
            LEGEND
        ===================================================== */}

        <div className="rf-network-legend">

          <div className="rf-network-legend-items">

            <span className="rf-network-legend-item">
              <span className="rf-legend-dot rf-legend-red" />
              Suspicious Wallet
            </span>

            <span className="rf-network-legend-item">
              <span className="rf-legend-dot rf-legend-amber" />
              Tumbler / Mixer
            </span>

            <span className="rf-network-legend-item">
              <span className="rf-legend-dot rf-legend-green" />
              Legitimate Wallet
            </span>

          </div>

          <span className="rf-network-legend-help">
            Click any node/edge for forensics
          </span>

        </div>

      </div>

      {/* =====================================================
          INSPECTOR PANEL
      ===================================================== */}

      <aside className="rf-network-inspector">

        <div className="rf-inspector-content">

          {/* Inspector Header */}

          <div className="rf-inspector-title">

            <Info size={15} />

            <span>
              Wallet Inspector
            </span>

          </div>

          {/* =================================================
              NODE INSPECTOR
          ================================================= */}

          {selectedNode && (

            <div className="rf-inspector-section">

              <div className="rf-inspector-address">

                <div className="rf-inspector-address-header">

                  <span>
                    Selected Address
                  </span>

                  <RiskBadge
                    level={selectedNode.risk}
                    score={
                      selectedNode.riskScore
                    }
                  />

                </div>

                <p>
                  {selectedNode.label}
                </p>

              </div>

              {/* Node Stats */}

              <div className="rf-inspector-stats">

                <div className="rf-inspector-stat">

                  <span>
                    Balance
                  </span>

                  <strong>
                    {formatBalance(
                      selectedNode.btcBalance
                    )}{' '}
                    BTC
                  </strong>

                </div>

                <div className="rf-inspector-stat">

                  <span>
                    Node Role
                  </span>

                  <strong>
                    {String(
                      selectedNode.type ||
                        'Unknown'
                    )
                      .replaceAll('_', ' ')
                      .replace(
                        /\b\w/g,
                        (char) =>
                          char.toUpperCase()
                      )}
                  </strong>

                </div>

              </div>

              {/* Risk Score */}

              <div className="rf-inspector-stat">

                <span>
                  Risk Score
                </span>

                <strong>
                  {selectedNode.riskScore}
                </strong>

              </div>

              {/* Fraud Ring */}

              {selectedNode.ring && (

                <div className="rf-inspector-fraud">

                  <div className="rf-inspector-fraud-title">

                    <ShieldAlert size={14} />

                    <span>
                      Associated Fraud Ring
                    </span>

                  </div>

                  <p>
                    {selectedNode.ring}
                  </p>

                </div>

              )}

            </div>

          )}

          {/* =================================================
              EDGE INSPECTOR
          ================================================= */}

          {!selectedNode && selectedEdge && (

            <div className="rf-inspector-section">

              <div className="rf-inspector-address">

                <span className="rf-inspector-label">
                  Selected Transaction
                </span>

                <p className="rf-inspector-hash">
                  {selectedEdge.txHash}
                </p>

              </div>

              <div className="rf-transaction-details">

                <div className="rf-transaction-row">

                  <span>
                    Transfer Amount
                  </span>

                  <strong className="rf-value-green">
                    {selectedEdge.amount} BTC
                  </strong>

                </div>

                <div className="rf-transaction-row">

                  <span>
                    From
                  </span>

                  <strong>
                    {selectedEdge.source}
                  </strong>

                </div>

                <div className="rf-transaction-row">

                  <span>
                    To
                  </span>

                  <strong>
                    {selectedEdge.target}
                  </strong>

                </div>

                <div className="rf-transaction-row">

                  <span>
                    Status
                  </span>

                  <strong
                    className={
                      selectedEdge.isSuspicious
                        ? 'rf-value-red'
                        : 'rf-value-green'
                    }
                  >
                    {selectedEdge.isSuspicious
                      ? 'SUSPICIOUS'
                      : 'NORMAL'}
                  </strong>

                </div>

              </div>

            </div>

          )}

          {/* =================================================
              EMPTY INSPECTOR
          ================================================= */}

          {!selectedNode &&
            !selectedEdge && (

              <div className="rf-inspector-empty">

                <Wallet size={32} />

                <p>
                  Select any node or transaction
                  link on the network canvas to view
                  full cryptographic telemetry.
                </p>

              </div>
            )}

        </div>

        {/* CLEAR BUTTON */}

        <div className="rf-inspector-footer">

          <button
            type="button"
            onClick={clearSelection}
            className="rf-inspector-clear"
          >
            Clear Selection
          </button>

        </div>

      </aside>

    </div>
  );
};

export default NetworkGraph;