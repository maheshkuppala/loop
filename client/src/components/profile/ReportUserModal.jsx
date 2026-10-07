import React, { useState } from 'react';
import { Flag, AlertCircle, CheckCircle2 } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import { reportService } from '../../services/reportService';

/**
 * ReportUserModal Component
 * Facilitates community moderation reports on public user profiles.
 */
export const ReportUserModal = ({
  isOpen,
  onClose,
  targetUserId,
  targetUserName = 'this user'
}) => {
  const [reason, setReason] = useState('Inappropriate behavior or communication');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const reportReasons = [
    'Inappropriate behavior or communication',
    'No-show or repeated handover cancellation',
    'Misleading item condition or unreturned item',
    'Suspected fraudulent activity',
    'Spam or unsolicited messages',
    'Other community guideline violation'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await reportService.reportUser({
        userId: targetUserId,
        reason,
        description: description.trim()
      });

      if (res && res.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setDescription('');
          onClose();
        }, 1500);
      } else {
        throw new Error(res?.message || 'Failed to submit report.');
      }
    } catch (err) {
      console.error('Failed to report user:', err);
      const msg = err.response?.data?.message || err.message || 'Unable to submit report. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Report ${targetUserName}`} maxWidth="500px">
      {success ? (
        <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto'
            }}
          >
            <CheckCircle2 size={28} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-slate-900)', margin: '0 0 8px 0' }}>
            Report Submitted
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-600)', margin: 0 }}>
            Thank you for helping maintain community safety. Our moderation team will investigate this report.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-600)', margin: 0 }}>
            Reports are handled confidentially by LOOOP community moderation. Please provide specific details to help us investigate.
          </p>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-slate-800)', marginBottom: '6px' }}>
              Reason for Report <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={submitting}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-slate-300)',
                fontSize: '0.875rem',
                backgroundColor: '#ffffff'
              }}
            >
              {reportReasons.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-slate-800)', marginBottom: '6px' }}>
              Additional Details / Context
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what occurred, relevant dates, or handover details..."
              disabled={submitting}
              maxLength={1000}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-slate-300)',
                fontSize: '0.875rem',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                fontSize: '0.85rem'
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px', borderTop: '1px solid var(--color-slate-100)' }}>
            <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting} style={{ backgroundColor: '#dc2626' }}>
              {submitting ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Spinner size="sm" />
                  <span>Submitting...</span>
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Flag size={15} />
                  <span>Submit Report</span>
                </span>
              )}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default ReportUserModal;
