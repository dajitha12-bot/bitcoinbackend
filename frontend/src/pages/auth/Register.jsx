import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldAlert,
  User,
  Mail,
  KeyRound,
  Building,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import '../../styles/register.css';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    organization: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    setError('');
    setLoading(true);

    try {
      await register(formData);
      navigate('/pending-approval');
    } catch (err) {
      setError(
        err?.message || 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rf-register-page">

      {/* =========================================================
          BACKGROUND
      ========================================================= */}

      <div className="rf-register-grid" />

      <div className="rf-register-glow rf-register-glow-one" />
      <div className="rf-register-glow rf-register-glow-two" />


      {/* =========================================================
          REGISTRATION CARD
      ========================================================= */}

      <div className="rf-register-card">

        {/* Top Accent */}

        <div className="rf-register-accent" />


        {/* =====================================================
            BRAND
        ===================================================== */}

        <div className="rf-register-brand">

          <div className="rf-register-logo">
            <ShieldAlert size={29} />
          </div>

          <h1 className="rf-register-title">
            Analyst Registration
          </h1>

          <p className="rf-register-subtitle">
            Request Fraud Analyst Privileges
          </p>

          <div className="rf-register-status">
            <span className="rf-register-status-dot" />
            Secure Registration Gateway
          </div>

        </div>


        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div
            className="rf-register-error"
            role="alert"
          >
            <AlertCircle size={17} />

            <span>
              {error}
            </span>
          </div>
        )}


        {/* =====================================================
            REGISTRATION FORM
        ===================================================== */}

        <form
          onSubmit={handleRegister}
          className="rf-register-form"
        >

          {/* Full Name */}

          <div className="rf-register-field">

            <label htmlFor="register-name">
              Full Name
            </label>

            <div className="rf-register-input-wrapper">

              <User
                className="rf-register-input-icon"
                size={17}
              />

              <input
                id="register-name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={(event) =>
                  handleChange('name', event.target.value)
                }
                placeholder="Dr. Evelyn Reed"
                autoComplete="name"
              />

            </div>

          </div>


          {/* Email */}

          <div className="rf-register-field">

            <label htmlFor="register-email">
              Email Address
            </label>

            <div className="rf-register-input-wrapper">

              <Mail
                className="rf-register-input-icon"
                size={17}
              />

              <input
                id="register-email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={(event) =>
                  handleChange('email', event.target.value)
                }
                placeholder="evelyn.reed@cybersec.org"
                autoComplete="email"
              />

            </div>

          </div>


          {/* Organization */}

          <div className="rf-register-field">

            <label htmlFor="register-organization">
              Organization / Firm
            </label>

            <div className="rf-register-input-wrapper">

              <Building
                className="rf-register-input-icon"
                size={17}
              />

              <input
                id="register-organization"
                name="organization"
                type="text"
                value={formData.organization}
                onChange={(event) =>
                  handleChange(
                    'organization',
                    event.target.value
                  )
                }
                placeholder="Blockchain Forensics Lab"
                autoComplete="organization"
              />

            </div>

          </div>


          {/* Password */}

          <div className="rf-register-field">

            <label htmlFor="register-password">
              Password
            </label>

            <div className="rf-register-input-wrapper">

              <KeyRound
                className="rf-register-input-icon"
                size={17}
              />

              <input
                id="register-password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={(event) =>
                  handleChange('password', event.target.value)
                }
                placeholder="••••••••"
                autoComplete="new-password"
              />

            </div>

          </div>


          {/* ===================================================
              SUBMIT
          =================================================== */}

          <button
            type="submit"
            disabled={loading}
            className="rf-register-submit"
          >

            {loading ? (
              <>
                <span className="rf-register-spinner" />
                Submitting Registration...
              </>
            ) : (
              <>
                Submit Registration Request
                <ArrowRight size={17} />
              </>
            )}

          </button>

        </form>


        {/* =====================================================
            LOGIN LINK
        ===================================================== */}

        <div className="rf-register-login">

          <span>
            Already registered?
          </span>

          <Link to="/login">
            Sign In Here
            <ArrowRight size={14} />
          </Link>

        </div>


        {/* =====================================================
            FOOTER
        ===================================================== */}

        <div className="rf-register-footer">

          <span>
            RINGFINDER SENTINEL
          </span>

          <span>
            •
          </span>

          <span>
            ANALYST ACCESS CONTROL
          </span>

        </div>

      </div>

    </div>
  );
};

export default Register;