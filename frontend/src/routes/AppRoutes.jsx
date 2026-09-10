import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute from './ProtectedRoute';

// ============================================================
// LAYOUTS
// ============================================================

import AnalystLayout from '../layouts/AnalystLayout';
import AdminLayout from '../layouts/AdminLayout';

// ============================================================
// AUTH PAGES
// ============================================================

import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import PendingApproval from '../pages/auth/PendingApproval';

// ============================================================
// ANALYST PAGES
// ============================================================

import AnalystDashboard from '../pages/analyst/AnalystDashboard';
import FraudDetection from '../pages/analyst/FraudDetection';
import TransactionNetwork from '../pages/analyst/TransactionNetwork';
import FraudRings from '../pages/analyst/FraudRings';
import TemporalValidation from '../pages/analyst/TemporalValidation';
import AdversarialTesting from '../pages/analyst/AdversarialTesting';
import Results from '../pages/analyst/Results';

// ============================================================
// ADMIN PAGES
// ============================================================

import AdminDashboard from '../pages/admin/AdminDashboard';
import AnalystApproval from '../pages/admin/AnalystApproval';
import AnalystManagement from '../pages/admin/AnalystManagement';
import DatasetManagement from '../pages/admin/DatasetManagement';
import TransactionManagement from '../pages/admin/TransactionManagement';
import FraudResults from '../pages/admin/FraudResults';
import FraudRingMonitoring from '../pages/admin/FraudRingMonitoring';
import ModelPerformance from '../pages/admin/ModelPerformance';
import TemporalResults from '../pages/admin/TemporalResults';
import AdversarialResults from '../pages/admin/AdversarialResults';
import ActivityLogs from '../pages/admin/ActivityLogs';
import SystemSettings from '../pages/admin/SystemSettings';


// ============================================================
// APPLICATION ROUTES
// ============================================================

export const AppRoutes = () => {
  return (
    <Routes>

      {/* ======================================================
          PUBLIC AUTH ROUTES
          ====================================================== */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/pending-approval"
        element={<PendingApproval />}
      />


      {/* ======================================================
          ANALYST ROUTES
          ====================================================== */}

      <Route
        path="/analyst"
        element={
          <ProtectedRoute requiredRole="analyst">
            <AnalystLayout />
          </ProtectedRoute>
        }
      >

        {/* /analyst -> /analyst/dashboard */}
        <Route
          index
          element={
            <Navigate
              to="dashboard"
              replace
            />
          }
        />

        <Route
          path="dashboard"
          element={<AnalystDashboard />}
        />

        <Route
          path="fraud-detection"
          element={<FraudDetection />}
        />

        <Route
          path="transaction-network"
          element={<TransactionNetwork />}
        />

        <Route
          path="fraud-rings"
          element={<FraudRings />}
        />

        <Route
          path="temporal-validation"
          element={<TemporalValidation />}
        />

        <Route
          path="adversarial-testing"
          element={<AdversarialTesting />}
        />

        <Route
          path="results"
          element={<Results />}
        />

      </Route>


      {/* ======================================================
          ADMIN ROUTES
          ====================================================== */}

      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >

        {/* /admin -> /admin/dashboard */}
        <Route
          index
          element={
            <Navigate
              to="dashboard"
              replace
            />
          }
        />

        <Route
          path="dashboard"
          element={<AdminDashboard />}
        />

        <Route
          path="analyst-approval"
          element={<AnalystApproval />}
        />

        <Route
          path="analyst-management"
          element={<AnalystManagement />}
        />

        <Route
          path="dataset-management"
          element={<DatasetManagement />}
        />

        <Route
          path="transaction-management"
          element={<TransactionManagement />}
        />

        <Route
          path="fraud-results"
          element={<FraudResults />}
        />

        <Route
          path="fraud-ring-monitoring"
          element={<FraudRingMonitoring />}
        />

        <Route
          path="model-performance"
          element={<ModelPerformance />}
        />

        <Route
          path="temporal-results"
          element={<TemporalResults />}
        />

        <Route
          path="adversarial-results"
          element={<AdversarialResults />}
        />

        <Route
          path="activity-logs"
          element={<ActivityLogs />}
        />

        <Route
          path="system-settings"
          element={<SystemSettings />}
        />

      </Route>


      {/* ======================================================
          CATCH-ALL ROUTE
          ====================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />

    </Routes>
  );
};

export default AppRoutes;