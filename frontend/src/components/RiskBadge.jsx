import React from 'react';
import '../styles/risk-badge.css';

export const RiskBadge = ({ level, score }) => {
  const normalized = (level || 'UNKNOWN').toUpperCase();

  let badgeClass = 'rf-risk-badge-default';

  if (
    normalized === 'HIGH' ||
    normalized === 'CRITICAL' ||
    normalized === 'FLAGGED_HIGH_RISK'
  ) {
    badgeClass = 'rf-risk-badge-high';
  } else if (
    normalized === 'MEDIUM' ||
    normalized === 'MONITORING'
  ) {
    badgeClass = 'rf-risk-badge-medium';
  } else if (
    normalized === 'LOW' ||
    normalized === 'APPROVED' ||
    normalized === 'SAFE'
  ) {
    badgeClass = 'rf-risk-badge-low';
  } else if (
    normalized === 'ACTIVE_INVESTIGATION' ||
    normalized === 'PENDING'
  ) {
    badgeClass = 'rf-risk-badge-active';
  }

  return (
    <span className={`rf-risk-badge ${badgeClass}`}>

      <span className="rf-risk-badge-dot"></span>

      <span className="rf-risk-badge-label">
        {normalized}
      </span>

      {score !== undefined && score !== null && (
        <span className="rf-risk-badge-score">
          ({score}%)
        </span>
      )}

    </span>
  );
};

export default RiskBadge;