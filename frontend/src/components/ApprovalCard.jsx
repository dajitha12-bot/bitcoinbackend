import React, { useState } from 'react';
import {
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Mail,
  ShieldCheck,
  User,
  XCircle,
} from 'lucide-react';

import '../styles/approval-card.css';

/* ============================================================
   HELPERS
   ============================================================ */

const getAnalystId = (analyst) =>
  analyst?.id ||
  analyst?._id ||
  analyst?.userId ||
  'UNKNOWN';

const getInitials = (name = '') => {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return 'AN';
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
};

const formatDate = (date) => {
  if (!date) {
    return 'Not available';
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString(
    'en-GB',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }
  );
};

/* ============================================================
   APPROVAL CARD
   ============================================================ */

export const ApprovalCard = ({
  analyst,
  onApprove,
  onReject,
}) => {
  const [processing, setProcessing] =
    useState(null);

  if (!analyst) {
    return null;
  }

  const analystId =
    getAnalystId(analyst);

  const name =
    analyst?.name ||
    'Unknown Analyst';

  const email =
    analyst?.email ||
    'No email available';

  const organization =
    analyst?.organization ||
    'Organization not specified';

  const status =
    analyst?.status ||
    'pending';

  const initials =
    getInitials(name);

  const isPending =
    status.toLowerCase() === 'pending';

  /* ==========================================================
     APPROVE
     ========================================================== */

  const handleApprove = async () => {
    if (
      processing ||
      !analystId ||
      typeof onApprove !== 'function'
    ) {
      return;
    }

    try {
      setProcessing('approve');

      await onApprove(analystId);
    } catch (error) {
      console.error(
        'Approval action failed:',
        error
      );
    } finally {
      setProcessing(null);
    }
  };

  /* ==========================================================
     REJECT
     ========================================================== */

  const handleReject = async () => {
    if (
      processing ||
      !analystId ||
      typeof onReject !== 'function'
    ) {
      return;
    }

    const confirmed = window.confirm(
      `Reject analyst registration for ${name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessing('reject');

      await onReject(analystId);
    } catch (error) {
      console.error(
        'Rejection action failed:',
        error
      );
    } finally {
      setProcessing(null);
    }
  };

  return (
    <article className="rf-approval-card">

      {/* ======================================================
          TOP HEADER
          ====================================================== */}

      <div className="rf-approval-header">

        <div className="rf-approval-avatar">
          {initials}
        </div>

        <div className="rf-approval-identity">

          <span className="rf-approval-user-id">
            {analystId}
          </span>

          <span className="rf-approval-status">
            <span className="rf-approval-status-dot" />

            {status === 'approved'
              ? 'APPROVED'
              : status === 'rejected'
                ? 'REJECTED'
                : 'PENDING APPROVAL'}
          </span>

        </div>

      </div>

      {/* ======================================================
          ANALYST NAME
          ====================================================== */}

      <div className="rf-approval-name-section">

        <div className="rf-approval-name-icon">
          <User size={17} />
        </div>

        <div className="rf-approval-name-content">

          <span className="rf-approval-section-label">
            ANALYST
          </span>

          <h3>
            {name}
          </h3>

        </div>

      </div>

      {/* ======================================================
          DETAILS
          ====================================================== */}

      <div className="rf-approval-details">

        {/* EMAIL */}

        <div className="rf-approval-detail">

          <div className="rf-approval-detail-icon">
            <Mail size={15} />
          </div>

          <div className="rf-approval-detail-content">

            <span className="rf-approval-detail-label">
              EMAIL ADDRESS
            </span>

            <strong
              title={email}
            >
              {email}
            </strong>

          </div>

        </div>

        {/* ORGANIZATION */}

        <div className="rf-approval-detail">

          <div className="rf-approval-detail-icon">
            <Building2 size={15} />
          </div>

          <div className="rf-approval-detail-content">

            <span className="rf-approval-detail-label">
              ORGANIZATION
            </span>

            <strong
              title={organization}
            >
              {organization}
            </strong>

          </div>

        </div>

        {/* REGISTERED DATE */}

        <div className="rf-approval-detail">

          <div className="rf-approval-detail-icon">
            <CalendarClock size={15} />
          </div>

          <div className="rf-approval-detail-content">

            <span className="rf-approval-detail-label">
              REGISTERED
            </span>

            <strong>
              {formatDate(
                analyst?.createdAt ||
                analyst?.registeredAt
              )}
            </strong>

          </div>

        </div>

      </div>

      {/* ======================================================
          ACTIONS
          ====================================================== */}

      {isPending && (
        <div className="rf-approval-actions">

          <button
            type="button"
            className="rf-approve-button"
            onClick={handleApprove}
            disabled={Boolean(processing)}
          >

            {processing === 'approve' ? (
              <Clock3
                size={15}
                className="rf-approval-spinner"
              />
            ) : (
              <CheckCircle2 size={15} />
            )}

            <span>
              {processing === 'approve'
                ? 'Approving...'
                : 'Approve Analyst'}
            </span>

          </button>

          <button
            type="button"
            className="rf-reject-button"
            onClick={handleReject}
            disabled={Boolean(processing)}
          >

            {processing === 'reject' ? (
              <Clock3
                size={15}
                className="rf-approval-spinner"
              />
            ) : (
              <XCircle size={15} />
            )}

            <span>
              {processing === 'reject'
                ? 'Rejecting...'
                : 'Reject'}
            </span>

          </button>

        </div>
      )}

      {/* ======================================================
          APPROVED MESSAGE
          ====================================================== */}

      {status === 'approved' && (
        <div className="rf-approval-state-message rf-approval-approved">
          <ShieldCheck size={15} />

          <span>
            Analyst access is active.
          </span>
        </div>
      )}

      {/* ======================================================
          REJECTED MESSAGE
          ====================================================== */}

      {status === 'rejected' && (
        <div className="rf-approval-state-message rf-approval-rejected">
          <XCircle size={15} />

          <span>
            Registration has been rejected.
          </span>
        </div>
      )}

      {/* ======================================================
          FOOTER
          ====================================================== */}

      <div className="rf-approval-footer">

        <div className="rf-approval-footer-status">

          <span className="rf-approval-footer-dot" />

          <span>
            ADMIN REVIEW CHANNEL ONLINE
          </span>

        </div>

        <span className="rf-approval-footer-code">
          RINGFINDER / AUTH
        </span>

      </div>

    </article>
  );
};

export default ApprovalCard;