import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

export const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // ============================================================
  // AUTHENTICATION LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="rf-protected-loading">
        <LoadingSpinner
          label="Authenticating session token..."
        />
      </div>
    );
  }

  // ============================================================
  // NOT AUTHENTICATED
  // ============================================================

  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // ============================================================
  // PENDING ANALYST
  // ============================================================

  if (
    user.role === 'analyst' &&
    user.status === 'pending'
  ) {
    return (
      <Navigate
        to="/pending-approval"
        replace
      />
    );
  }

  // ============================================================
  // REJECTED ANALYST
  // ============================================================

  if (
    user.role === 'analyst' &&
    user.status === 'rejected'
  ) {
    return (
      <Navigate
        to="/login"
        state={{
          error:
            'Account registration rejected by Administrator.',
        }}
        replace
      />
    );
  }

  // ============================================================
  // ROLE VALIDATION
  // ============================================================

  if (
    requiredRole &&
    user.role !== requiredRole
  ) {
    const dashboard =
      user.role === 'admin'
        ? '/admin/dashboard'
        : '/analyst/dashboard';

    return (
      <Navigate
        to={dashboard}
        replace
      />
    );
  }

  // ============================================================
  // AUTHORIZED
  // ============================================================

  return children;
};

export default ProtectedRoute;