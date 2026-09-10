import React from 'react';
import '../styles/metric-card.css';

const MetricCard = ({
  title,
  value,
  benchmark,
  description,
  color = 'cyan',
}) => {
  const validColors = [
    'cyan',
    'emerald',
    'purple',
    'amber',
  ];

  const theme = validColors.includes(color)
    ? color
    : 'cyan';

  return (
    <div className={`rf-metric-card rf-metric-${theme}`}>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="rf-metric-header">

        <span className="rf-metric-title">
          {title}
        </span>

        {benchmark && (
          <span className="rf-metric-benchmark">
            Target: {benchmark}
          </span>
        )}

      </div>


      {/* =====================================================
          VALUE
      ===================================================== */}

      <div className="rf-metric-value">
        {value}
      </div>


      {/* =====================================================
          DESCRIPTION
      ===================================================== */}

      {description && (
        <p className="rf-metric-description">
          {description}
        </p>
      )}

    </div>
  );
};

export default MetricCard;