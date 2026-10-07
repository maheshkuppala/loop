import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  X,
  Ban,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  PackageCheck,
  MessageSquare
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';

export const RequestActions = ({
  request,
  isOwner,
  isRequester,
  onAccept,
  onDecline,
  onCancel,
  loadingAction = null // 'accept' | 'decline' | 'cancel' | null
}) => {
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  if (!request) return null;

  const status = (request.status || 'PENDING').toUpperCase();
  const isPending = status === 'PENDING';
  const isAccepted = status === 'ACCEPTED';
  const isDeclined = status === 'DECLINED';
  const isCancelled = status === 'CANCELLED';
  const isCompleted = status === 'COMPLETED';

  const handleConfirmDecline = () => {
    setShowDeclineModal(false);
    onDecline();
  };

  const handleConfirmCancel = () => {
    setShowCancelModal(false);
    onCancel();
  };

  return (
    <>
      <Card style={{ padding: '1.5rem', border: '1px solid var(--color-slate-200)', borderRadius: 'var(--radius-lg)' }}>
        <h3
          style={{
            fontSize: '0.85rem',
            fontWeight: 800,
            color: 'var(--color-slate-500)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            margin: '0 0 1rem 0'
          }}
        >
          Request Management
        </h3>

        {/* 1. OWNER ACTIONS (When PENDING) */}
        {isOwner && isPending && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-600)', margin: '0 0 4px 0', lineHeight: 1.5 }}>
              Review this request. If accepted, you and the requester will arrange safe handover logistics.
            </p>

            <Button
              variant="primary"
              size="lg"
              iconLeft={Check}
              loading={loadingAction === 'accept'}
              disabled={!!loadingAction}
              onClick={onAccept}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Accept Request
            </Button>

            <Button
              variant="outline"
              size="md"
              iconLeft={X}
              loading={loadingAction === 'decline'}
              disabled={!!loadingAction}
              onClick={() => setShowDeclineModal(true)}
              style={{ width: '100%', justifyContent: 'center', color: 'var(--color-danger)', borderColor: 'var(--color-danger-border, #fecaca)' }}
            >
              Decline Request
            </Button>
          </div>
        )}

        {/* 2. REQUESTER ACTIONS (When PENDING) */}
        {isRequester && isPending && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-600)', margin: '0 0 4px 0', lineHeight: 1.5 }}>
              Your request is pending review by the item owner. You can cancel it at any time before it is accepted.
            </p>

            <Button
              variant="secondary"
              size="md"
              iconLeft={Ban}
              loading={loadingAction === 'cancel'}
              disabled={!!loadingAction}
              onClick={() => setShowCancelModal(true)}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Cancel Request
            </Button>
          </div>
        )}

        {/* 3. ACCEPTED STATE */}
        {isAccepted && (
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#065f46', fontWeight: 800, fontSize: '0.95rem' }}>
              <CheckCircle2 size={18} color="#059669" />
              <span>Request Accepted</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#047857', margin: 0, lineHeight: 1.5 }}>
              Handover coordination and item tracking are open in your transaction dashboard.
            </p>
            {request.transaction && (
              <Link
                to={`/transactions/${request.transaction._id || request.transaction.id || request.transaction}`}
                style={{ textDecoration: 'none' }}
              >
                <Button
                  variant="primary"
                  size="md"
                  iconRight={ArrowRight}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  View Transaction
                </Button>
              </Link>
            )}

            {(request.conversationId || request.conversation) && (isOwner || isRequester) && (
              <Link
                to={`/messages/${request.conversationId || request.conversation?._id || request.conversation}`}
                style={{ textDecoration: 'none' }}
              >
                <Button
                  variant="outline"
                  size="md"
                  iconLeft={MessageSquare}
                  style={{ width: '100%', justifyContent: 'center', borderColor: '#059669', color: '#059669' }}
                >
                  Message Participant
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* 4. DECLINED STATE */}
        {isDeclined && (
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#991b1b', fontWeight: 800, fontSize: '0.95rem', marginBottom: '4px' }}>
              <X size={18} color="#dc2626" />
              <span>Request Declined</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#b91c1c', margin: 0, lineHeight: 1.5 }}>
              This request was declined by the item owner. No further actions are needed.
            </p>
          </div>
        )}

        {/* 5. CANCELLED STATE */}
        {isCancelled && (
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontWeight: 800, fontSize: '0.95rem', marginBottom: '4px' }}>
              <Ban size={18} color="#64748b" />
              <span>Request Cancelled</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
              This request was cancelled by the requester and is permanently closed.
            </p>
          </div>
        )}

        {/* 6. COMPLETED STATE */}
        {isCompleted && (
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: 800, fontSize: '0.95rem', marginBottom: '4px' }}>
              <PackageCheck size={18} color="#16a34a" />
              <span>Request Completed</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#15803d', margin: 0, lineHeight: 1.5 }}>
              This sharing transaction has been successfully concluded.
            </p>
          </div>
        )}

        {/* Security & Verification Assurance Footer */}
        <div
          style={{
            marginTop: '1.25rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--color-slate-100)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.78rem',
            color: 'var(--color-slate-500)'
          }}
        >
          <ShieldCheck size={15} color="#059669" style={{ flexShrink: 0 }} />
          <span>Verified LOOOP Community Protection</span>
        </div>
      </Card>

      {/* Decline Confirmation Modal */}
      <Modal
        isOpen={showDeclineModal}
        onClose={() => setShowDeclineModal(false)}
        title="Decline this request?"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowDeclineModal(false)}
              disabled={loadingAction === 'decline'}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={loadingAction === 'decline'}
              disabled={loadingAction === 'decline'}
              onClick={handleConfirmDecline}
            >
              Decline Request
            </Button>
          </>
        }
      >
        <p style={{ color: 'var(--color-slate-700)', fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>
          The requester will be notified that this request was declined.
        </p>
      </Modal>

      {/* Cancel Request Confirmation Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel this request?"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowCancelModal(false)}
              disabled={loadingAction === 'cancel'}
            >
              Keep Request
            </Button>
            <Button
              variant="danger"
              loading={loadingAction === 'cancel'}
              disabled={loadingAction === 'cancel'}
              onClick={handleConfirmCancel}
            >
              Cancel Request
            </Button>
          </>
        }
      >
        <p style={{ color: 'var(--color-slate-700)', fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>
          This request will be cancelled and the item owner will no longer be expected to respond.
        </p>
      </Modal>
    </>
  );
};

export default RequestActions;
