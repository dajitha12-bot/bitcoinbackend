import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldAlert,
  KeyRound,
  Mail,
  ArrowRight,
  UserCheck,
  AlertCircle,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

import '../../styles/login.css';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();

    setError('');
    setLoading(true);

    try {
      const response = await login(email, password);

      if (response?.user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/analyst/dashboard');
      }
    } catch (err) {
      if (err?.status === 'pending') {
        navigate('/pending-approval');
      } else {
        setError(
          err?.message ||
            'Failed to authenticate. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'admin') {
      setEmail('admin@ringfinder.ai');
      setPassword('admin123');
    } else {
      setEmail('analyst@ringfinder.ai');
      setPassword('analyst123');
    }

    setError('');
  };

  return (
    <div className="rf-login-page">

      {/* =====================================================
          1. BACKGROUND
      ===================================================== */}

      <div className="rf-login-grid" />

      <div className="rf-login-glow rf-login-glow-one" />
      <div className="rf-login-glow rf-login-glow-two" />


      {/* =====================================================
          2. LOGIN CARD
      ===================================================== */}

      <main className="rf-login-card">

        <div className="rf-login-accent" />


        {/* ===================================================
            3. BRAND
        =================================================== */}

        <div className="rf-login-brand">

          <div className="rf-login-logo">
            <ShieldAlert size={31} />
          </div>

          <div className="rf-login-brand-title">
            RingFinder <span>Sentinel</span>
          </div>

          <p className="rf-login-subtitle">
            Bitcoin Network Fraud-Ring Intelligence Platform
          </p>

          <div className="rf-login-status">
            <span className="rf-login-status-dot" />
            AI Detection System Online
          </div>

        </div>


        {/* ===================================================
            4. HEADING
        =================================================== */}

        <div className="rf-login-heading">

          <span className="rf-login-heading-kicker">
            SECURE AUTHENTICATION
          </span>

          <h2>
            Welcome Back
          </h2>

          <p>
            Sign in to access your secure fraud intelligence
            workspace.
          </p>

        </div>


        {/* ===================================================
            5. ERROR MESSAGE
        =================================================== */}

        {error && (
          <div
            className="rf-login-error"
            role="alert"
          >
            <AlertCircle size={17} />

            <span>
              {error}
            </span>
          </div>
        )}


        {/* ===================================================
            6. LOGIN FORM
        =================================================== */}

        <form
          onSubmit={handleLogin}
          className="rf-login-form"
        >

          {/* Email */}

          <div className="rf-login-form-group">

            <label htmlFor="email">
              Email Address
            </label>

            <div className="rf-login-input-wrapper">

              <Mail
                className="rf-login-input-icon"
                size={17}
              />

              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="analyst@ringfinder.ai"
                autoComplete="email"
              />

            </div>

          </div>


          {/* Password */}

          <div className="rf-login-form-group">

            <label htmlFor="password">
              Password
            </label>

            <div className="rf-login-input-wrapper">

              <KeyRound
                className="rf-login-input-icon"
                size={17}
              />

              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter your password"
                autoComplete="current-password"
              />

            </div>

          </div>


          {/* Submit */}

          <button
            type="submit"
            disabled={loading}
            className="rf-login-submit"
          >

            {loading ? (
              <>
                <span className="rf-login-spinner" />
                Authenticating...
              </>
            ) : (
              <>
                Sign In to Portal
                <ArrowRight size={17} />
              </>
            )}

          </button>

        </form>


        {/* ===================================================
            7. DEMO ACCOUNTS
        =================================================== */}

        <section className="rf-login-demo-section">

          <div className="rf-login-demo-title">
            <span />
            Quick Demo Accounts
            <span />
          </div>

          <div className="rf-login-demo-buttons">

            {/* Admin */}

            <button
              type="button"
              onClick={() => fillDemo('admin')}
              className="rf-login-demo-button rf-login-demo-admin"
            >

              <div className="rf-login-demo-icon">
                <UserCheck size={17} />
              </div>

              <div className="rf-login-demo-content">
                <strong>
                  Admin Demo
                </strong>

                <small>
                  System Administrator
                </small>
              </div>

              <ArrowRight
                size={14}
                className="rf-login-demo-arrow"
              />

            </button>


            {/* Analyst */}

            <button
              type="button"
              onClick={() => fillDemo('analyst')}
              className="rf-login-demo-button rf-login-demo-analyst"
            >

              <div className="rf-login-demo-icon">
                <UserCheck size={17} />
              </div>

              <div className="rf-login-demo-content">
                <strong>
                  Analyst Demo
                </strong>

                <small>
                  Fraud Analyst
                </small>
              </div>

              <ArrowRight
                size={14}
                className="rf-login-demo-arrow"
              />

            </button>

          </div>

        </section>


        {/* ===================================================
            8. REGISTRATION
        =================================================== */}

        <div className="rf-login-register-section">

          <span>
            Don't have an account?
          </span>

          <Link to="/register">
            Register Analyst Access
            <ArrowRight size={15} />
          </Link>

        </div>


        {/* ===================================================
            9. FOOTER
        =================================================== */}

        <footer className="rf-login-footer">

          <span>
            RINGFINDER SENTINEL
          </span>

          <span className="rf-login-footer-dot">
            •
          </span>

          <span>
            SECURE AI PLATFORM
          </span>

        </footer>

      </main>

    </div>
  );
};

export default Login;