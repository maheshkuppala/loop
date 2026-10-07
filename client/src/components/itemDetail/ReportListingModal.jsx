import React, { useState } from 'react';
import { AlertTriangle, Send } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';

const REPORT_REASONS = [
  'Incorrect or misleading description',
  'Commercial advertisement or selling for profit',
  'Suspected fraud or scam',
  'Inappropriate or offensive content',
  'Broken, defective, or unsafe item',
  'Other violation of community guidelines'
];

export const ReportListingModal = ({
  item,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false
}) => {
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState('');

  if (!item) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      reason: selectedReason,
      details: details.trim()
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Report this Listing"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={isSubmitting}
            onClick={handleSubmit}
            iconLeft={AlertTriangle}
          >
            Submit Report
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-600)', margin: 0 }}>
          Help us maintain a trustworthy community. Please let us know why this item violates LOOOP guidelines:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="report-reason" style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--color-slate-800)' }}>
            Reason for Report
          </label>
          <select
            id="report-reason"
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-slate-300)',
              backgroundColor: '#ffffff',
              color: 'var(--color-slate-900)',
              fontSize: '0.875rem'
            }}
          >
            {REPORT_REASONS.map((r, i) => (
              <option key={i} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="report-details" style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--color-slate-800)' }}>
            Additional Details (Optional)
          </label>
          <textarea
            id="report-details"
            rows={3}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Provide any additional context for the moderation team..."
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-slate-300)',
              backgroundColor: '#ffffff',
              color: 'var(--color-slate-900)',
              fontSize: '0.875rem',
              resize: 'vertical'
            }}
          />
        </div>
      </form>
    </Modal>
  );
};

export default ReportListingModal;
