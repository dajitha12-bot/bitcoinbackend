// src/pages/admin/AnalystApproval.jsx

import React, { useEffect, useState } from 'react';
import {
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  XCircle,
  Clock3,
  Mail,
  Building2,
  ArrowRight,
} from 'lucide-react';

import LoadingSpinner from '../../components/LoadingSpinner';
import adminService from '../../services/adminService';

import '../../styles/analyst-approval.css';

const AnalystApproval = () => {
  const [pendingAnalysts, setPendingAnalysts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [message, setMessage] = useState(null);

  /* =========================================================
     LOAD PENDING ANALYSTS
  ========================================================= */

  const loadPendingAnalysts = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setMessage(null);

      const response = await adminService.getPendingAnalysts();

      const data =
        response?.data ??
        response?.analysts ??
        response?.results ??
        response ??
        [];

      setPendingAnalysts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load pending analysts:', error);

      setPendingAnalysts([]);

      setMessage({
        type: 'error',
        text:
          error?.message ||
          'Unable to load pending analyst registrations.',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    loadPendingAnalysts();
  }, []);

  /* =========================================================
     APPROVE ANALYST
  ========================================================= */

  const handleApprove = async (analyst) => {
    const id = analyst?.id;

    if (!id) {
      setMessage({
        type: 'error',
        text: 'Unable to approve analyst: analyst ID is missing.',
      });
      return;
    }

    try {
      setProcessingId(id);
      setMessage(null);

      const response = await adminService.approveAnalyst(id);

      if (response?.success === false) {
        throw new Error(
          response?.message || 'Unable to approve analyst.'
        );
      }

      setMessage({
        type: 'success',
        text: `${analyst?.name || 'Analyst'} has been approved successfully.`,
      });

      await loadPendingAnalysts(true);
    } catch (error) {
      console.error('Approve analyst failed:', error);

      setMessage({
        type: 'error',
        text:
          error?.message ||
          'Unable to approve analyst. Please try again.',
      });
    } finally {
      setProcessingId(null);
    }
  };

  /* =========================================================
     REJECT ANALYST
  ========================================================= */

  const handleReject = async (analyst) => {
    const id = analyst?.id;

    if (!id) {
      setMessage({
        type: 'error',
        text: 'Unable to reject analyst: analyst ID is missing.',
      });
      return;
    }

    try {
      setProcessingId(id);
      setMessage(null);

      const response = await adminService.rejectAnalyst(id);

      if (response?.success === false) {
        throw new Error(
          response?.message || 'Unable to reject analyst.'
        );
      }

      setMessage({
        type: 'success',
        text: `${analyst?.name || 'Analyst'} has been rejected.`,
      });

      await loadPendingAnalysts(true);
    } catch (error) {
      console.error('Reject analyst failed:', error);

      setMessage({
        type: 'error',
        text:
          error?.message ||
          'Unable to reject analyst. Please try again.',
      });
    } finally {
      setProcessingId(null);
    }
  };

  /* =========================================================
     DATE FORMATTER
  ========================================================= */

  const formatDate = (value) => {
    if (!value) return 'N/A';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
  };

  /* =========================================================
     LOADING STATE
  ========================================================= */

  if (loading) {
    return (
      <div className="rf-approval-page">
        <div className="rf-approval-loading">
          <LoadingSpinner label="Loading analyst authorization queue..." />
        </div>
      </div>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="rf-approval-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="rf-approval-header">
        <div className="rf-approval-heading">
          <div className="rf-approval-kicker">
            <UserCheck size={14} />
            ANALYST AUTHORIZATION
          </div>

          <h1>Pending Analyst Registrations</h1>

          <p>
            Review and authorize analysts requesting access to the
            RingFinder platform.
          </p>
        </div>

        <div className="rf-approval-header-actions">

          <button
            type="button"
            className="rf-approval-refresh-btn"
            onClick={() => loadPendingAnalysts(true)}
            disabled={refreshing || processingId !== null}
          >
            <RefreshCw
              size={15}
              className={
                refreshing ? 'rf-approval-spin' : ''
              }
            />

            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>

          <button
            type="button"
            className="rf-approval-review-btn"
            onClick={() =>
              document
                .getElementById('rf-registration-queue')
                ?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                })
            }
          >
            Review Approvals
            <ArrowRight size={17} />
          </button>

        </div>
      </div>

      {/* =====================================================
          MESSAGE
      ===================================================== */}

      {message && (
        <div
          className={`rf-approval-message ${
            message.type === 'success'
              ? 'rf-approval-message-success'
              : 'rf-approval-message-error'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 size={17} />
          ) : (
            <XCircle size={17} />
          )}

          <span>{message.text}</span>
        </div>
      )}

      {/* =====================================================
          REGISTRATION QUEUE
      ===================================================== */}

      <section
        id="rf-registration-queue"
        className="rf-approval-queue"
      >

        <div className="rf-approval-queue-header">
          <div className="rf-approval-queue-label">
            <span className="rf-approval-online-dot" />
            REGISTRATION REVIEW QUEUE
          </div>

          <div className="rf-approval-count">
            {pendingAnalysts.length}{' '}
            {pendingAnalysts.length === 1
              ? 'REQUEST'
              : 'REQUESTS'}
          </div>
        </div>

        {/* ===================================================
            EMPTY STATE
        =================================================== */}

        {pendingAnalysts.length === 0 ? (
          <div className="rf-approval-empty">

            <div className="rf-approval-empty-icon">
              <ShieldCheck size={30} />
            </div>

            <h2>Authorization Queue Clear</h2>

            <p>
              There are currently no analyst registrations waiting
              for administrator approval.
            </p>

            <button
              type="button"
              className="rf-approval-empty-btn"
              onClick={() => loadPendingAnalysts(true)}
              disabled={refreshing}
            >
              <RefreshCw
                size={15}
                className={
                  refreshing ? 'rf-approval-spin' : ''
                }
              />

              {refreshing ? 'Checking...' : 'Check Again'}
            </button>

          </div>
        ) : (

          /* =================================================
             ANALYST REQUEST LIST
          ================================================= */

          <div className="rf-approval-list">

            {pendingAnalysts.map((analyst) => {
              const id = analyst?.id;
              const isProcessing = processingId === id;

              return (
                <article
                  key={id}
                  className="rf-approval-request"
                >

                  {/* REQUEST HEADER */}

                  <div className="rf-request-header">

                    <div className="rf-request-id">
                      {id || 'usr_analyst'}
                    </div>

                    <div className="rf-request-status">
                      <Clock3 size={14} />
                      Pending Approval
                    </div>

                  </div>

                  {/* ANALYST NAME */}

                  <h2 className="rf-request-name">
                    {analyst?.name || 'Unknown Analyst'}
                  </h2>

                  {/* DETAILS */}

                  <div className="rf-request-details">

                    <div className="rf-request-detail">
                      <Mail size={17} />

                      <span>
                        {analyst?.email ||
                          analyst?.emailAddress ||
                          'No email available'}
                      </span>
                    </div>

                    <div className="rf-request-detail">
                      <Building2 size={17} />

                      <span>
                        {analyst?.organization ||
                          analyst?.company ||
                          analyst?.institution ||
                          'Organization not provided'}
                      </span>
                    </div>

                    <div className="rf-request-detail">
                      <Clock3 size={17} />

                      <span>
                        Registered:{' '}
                        {formatDate(
                          analyst?.registeredAt ||
                            analyst?.createdAt ||
                            analyst?.registrationDate ||
                            analyst?.registered_at
                        )}
                      </span>
                    </div>

                  </div>

                  {/* ACTION BUTTONS */}

                  <div className="rf-request-actions">

                    <button
                      type="button"
                      className="rf-approve-btn"
                      onClick={() => handleApprove(analyst)}
                      disabled={isProcessing || processingId !== null}
                    >
                      {isProcessing ? (
                        <RefreshCw
                          size={16}
                          className="rf-approval-spin"
                        />
                      ) : (
                        <UserCheck size={17} />
                      )}

                      <span>
                        {isProcessing
                          ? 'Processing...'
                          : 'Approve Analyst'}
                      </span>
                    </button>

                    <button
                      type="button"
                      className="rf-reject-btn"
                      onClick={() => handleReject(analyst)}
                      disabled={isProcessing || processingId !== null}
                    >
                      <XCircle size={17} />
                      <span>Reject</span>
                    </button>

                  </div>

                </article>
              );
            })}

          </div>
        )}

      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <div className="rf-approval-footer">

        <div className="rf-approval-footer-status">
          <span className="rf-approval-footer-dot" />
          ADMIN REVIEW CHANNEL ONLINE
        </div>

        <div className="rf-approval-footer-system">
          <ShieldCheck size={14} />
          RINGFINDER AUTHORIZATION SERVICE
        </div>

      </div>

    </div>
  );
};

export default AnalystApproval;