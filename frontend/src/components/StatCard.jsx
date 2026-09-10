import React from 'react';
import '../styles/stat-card.css';

export const StatCard = ({
  title,
  value,
  change,
  changeType = 'positive',
  icon: Icon,
  subtext,
  highlight = false,
}) => {
  const changeClass =
    changeType === 'positive'
      ? 'rf-stat-change-positive'
      : changeType === 'negative'
      ? 'rf-stat-change-negative'
      : 'rf-stat-change-neutral';

  return (
    <div
      className={`rf-stat-card ${
        highlight ? 'rf-stat-card-highlight' : ''
      }`}
    >
      {/* HEADER */}
      <div className="rf-stat-header">
        <span className="rf-stat-title">
          {title}
        </span>

        {Icon && (
          <div
            className={`rf-stat-icon ${
              highlight
                ? 'rf-stat-icon-highlight'
                : 'rf-stat-icon-default'
            }`}
          >
            <Icon size={16} strokeWidth={2} />
          </div>
        )}
      </div>

      {/* VALUE + CHANGE */}
      <div className="rf-stat-value-row">
        <h3 className="rf-stat-value">
          {value}
        </h3>

        {change && (
          <span
            className={`rf-stat-change ${changeClass}`}
          >
            {change}
          </span>
        )}
      </div>

      {/* SUBTEXT */}
      {subtext && (
        <p className="rf-stat-subtext">
          {subtext}
        </p>
      )}
    </div>
  );
};

export default StatCard;