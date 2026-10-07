import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';

export const RemoveItemModal = ({ isOpen, onClose, onConfirm, itemTitle = '', isDeleting = false }) => {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={isDeleting ? undefined : onClose}
      title="Remove Item Listing"
      size="sm"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 0' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: '#fef2f2',
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #fee2e2'
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <AlertTriangle size={20} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#991b1b' }}>
              Remove this item?
            </h4>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#b91c1c' }}>
              This will remove the listing from active discovery.
            </p>
          </div>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-600)', lineHeight: 1.45, margin: 0 }}>
          Are you sure you want to remove <strong>"{itemTitle}"</strong>?
          Community members will no longer be able to discover or request this item. Any past request history will remain preserved in your activity records.
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '0.75rem' }}>
          <Button variant="outline" size="md" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="md"
            iconLeft={Trash2}
            onClick={onConfirm}
            loading={isDeleting}
            disabled={isDeleting}
          >
            {isDeleting ? 'Removing...' : 'Remove Item'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default RemoveItemModal;
