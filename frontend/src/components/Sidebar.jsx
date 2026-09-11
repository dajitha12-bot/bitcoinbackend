import React from 'react';
import { NavLink } from 'react-router-dom';

import {
  ShieldAlert,
  LayoutDashboard,
  Search,
  Share2,
  Layers,
  Clock,
  Shield,
  Award,
  UserCheck,
  Users,
  Database,
  ListFilter,
  FileCheck,
  Eye,
  Activity,
  GitCommit,
  History,
  Sliders,
  LogOut,
  ChevronRight,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import '../styles/sidebar.css';

export const Sidebar = ({ role }) => {
  const { logout, user } = useAuth();

  const analystLinks = [
    {
      path: '/analyst/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      path: '/analyst/fraud-detection',
      label: 'Fraud Detection',
      icon: Search,
    },
    {
      path: '/analyst/transaction-network',
      label: 'Transaction Network',
      icon: Share2,
    },
    {
      path: '/analyst/fraud-rings',
      label: 'Fraud Rings',
      icon: Layers,
    },
    {
      path: '/analyst/temporal-validation',
      label: 'Temporal Validation',
      icon: Clock,
    },
    {
      path: '/analyst/adversarial-testing',
      label: 'Adversarial Testing',
      icon: Shield,
    },
    {
      path: '/analyst/dataset-management',
      label: 'Dataset Management',
      icon: Database,
    },
    {
      path: '/analyst/results',
      label: 'Final Results',
      icon: Award,
    },
  ];

  const adminLinks = [
    {
      path: '/admin/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      path: '/admin/analyst-approval',
      label: 'Analyst Approval',
      icon: UserCheck,
    },
    {
      path: '/admin/analyst-management',
      label: 'Analyst Management',
      icon: Users,
    },
    {
      path: '/admin/dataset-management',
      label: 'Dataset Management',
      icon: Database,
    },
    {
      path: '/admin/transaction-management',
      label: 'Transactions',
      icon: ListFilter,
    },
    {
      path: '/admin/fraud-results',
      label: 'Fraud Results',
      icon: FileCheck,
    },
    {
      path: '/admin/fraud-ring-monitoring',
      label: 'Ring Monitoring',
      icon: Eye,
    },
    {
      path: '/admin/model-performance',
      label: 'Model Performance',
      icon: Activity,
    },
    {
      path: '/admin/temporal-results',
      label: 'Temporal Analytics',
      icon: GitCommit,
    },
    {
      path: '/admin/adversarial-results',
      label: 'Adversarial Metrics',
      icon: Shield,
    },
    {
      path: '/admin/activity-logs',
      label: 'Activity Logs',
      icon: History,
    },
    {
      path: '/admin/system-settings',
      label: 'System Settings',
      icon: Sliders,
    },
  ];

  const links = role === 'admin' ? adminLinks : analystLinks;

  const userName =
    user?.name ||
    user?.email?.split('@')[0] ||
    (role === 'admin' ? 'Administrator' : 'Analyst');

  return (
    <aside className="rf-sidebar">

      {/* BRAND */}
      <div className="rf-sidebar-brand">
        <div className="rf-brand-logo">
          <ShieldAlert size={25} strokeWidth={2.4} />
        </div>

        <div className="rf-brand-content">
          <div className="rf-brand-title">
            RingFinder
            <span>v2.4</span>
          </div>

          <div className="rf-brand-subtitle">
            Bitcoin GNN Sentinel
          </div>
        </div>
      </div>

      {/* WORKSPACE */}
      <div className="rf-workspace">
        <div className="rf-workspace-label">
          <span className="rf-workspace-dot"></span>
          WORKSPACE
        </div>

        <div
          className={`rf-role-badge ${
            role === 'admin'
              ? 'rf-role-admin'
              : 'rf-role-analyst'
          }`}
        >
          {role === 'admin'
            ? 'SYSTEM ADMIN'
            : 'FRAUD ANALYST'}
        </div>
      </div>

      {/* NAVIGATION */}
      <div className="rf-nav-wrapper">
        <div className="rf-nav-title">
          <span>PLATFORM</span>
        </div>

        <nav className="rf-sidebar-nav">
          {links.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `rf-nav-item ${
                    isActive
                      ? 'rf-nav-item-active'
                      : ''
                  }`
                }
              >
                <span className="rf-nav-icon">
                  <Icon
                    size={17}
                    strokeWidth={2}
                  />
                </span>

                <span className="rf-nav-label">
                  {item.label}
                </span>

                <ChevronRight
                  className="rf-nav-arrow"
                  size={13}
                />
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* SYSTEM STATUS */}
      <div className="rf-sidebar-status">
        <div className="rf-status-header">
          <span className="rf-status-title">
            SYSTEM STATUS
          </span>

          <span className="rf-status-online">
            ONLINE
          </span>
        </div>

        <div className="rf-status-row">
          <span className="rf-status-indicator"></span>
          <span>Detection Engine</span>
        </div>

        <div className="rf-status-row">
          <span className="rf-status-indicator"></span>
          <span>Graph Database</span>
        </div>
      </div>

      {/* USER FOOTER */}
      <div className="rf-sidebar-user">
        <div className="rf-user-avatar">
          {userName.charAt(0).toUpperCase()}
        </div>

        <div className="rf-user-info">
          <div className="rf-user-name">
            {userName}
          </div>

          <div className="rf-user-role">
            {role === 'admin'
              ? 'Chief Security Officer'
              : 'Fraud Analyst'}
          </div>
        </div>

        <button
          type="button"
          className="rf-logout-button"
          onClick={logout}
          title="Log out"
          aria-label="Log out"
        >
          <LogOut size={17} />
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;