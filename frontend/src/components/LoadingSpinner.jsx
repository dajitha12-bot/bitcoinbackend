import React from 'react';
import { Cpu } from 'lucide-react';
import '../styles/loading-spinner.css';

export const LoadingSpinner = ({
  label = 'Running GNN Neural Inference...',
}) => {
  return (
    <div className="rf-loading-container">

      <div className="rf-loading-spinner-wrapper">

        <div className="rf-loading-ring"></div>

        <div className="rf-loading-cpu">
          <Cpu size={20} />
        </div>

      </div>

      <div className="rf-loading-label">
        <span className="rf-loading-dot"></span>
        {label}
      </div>

      <div className="rf-loading-progress">
        <span></span>
      </div>

      <div className="rf-loading-subtext">
        RINGFINDER SENTINEL • SECURE PROCESSING
      </div>

    </div>
  );
};

export default LoadingSpinner;