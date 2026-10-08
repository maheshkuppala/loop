import React, { useState } from 'react';
import {
  Send,
  Heart,
  Share2,
  AlertTriangle,
  Lock,
  UserCheck,
  Edit,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Button from '../common/Button';
import { useToast } from '../../hooks/useToast';
import { itemService } from '../../services/itemService';

export const ItemActions = ({
  item,
  currentUser,
  onRequestClick,
  onReportClick,
  isSaved = false,
  onSaveToggle
}) => {
  const { addToast } = useToast();
  const [saveLoading, setSaveLoading] = useState(false);

  if (!item) return null;

  // 1. Ownership & Status verification
  const currentUserId = currentUser?.id || currentUser?._id;
  const itemOwnerId = typeof item.owner === 'object' ? (item.owner?._id || item.owner?.id) : item.owner;
  const isOwner = !!(
    (currentUserId && itemOwnerId && currentUserId.toString() === itemOwnerId.toString()) ||
    (currentUser?.email && item.owner?.email && currentUser.email === item.owner.email)
  );

  const isReserved = item.availability === 'Reserved' || item.status === 'RESERVED';
  const isReused = item.availability === 'Unavailable' || item.status === 'COMPLETED' || item.status === 'REUSED' || item.status === 'removed';
  const isAvailable = !isReserved && !isReused;

  // 2. Derive primary button label based on sharing type & status
  const getPrimaryLabel = () => {
    if (isReserved) return 'This item is currently reserved';
    if (isReused) return 'This item has already found a new owner';
    const type = (item.sharingType || '').toLowerCase();
    if (type === 'give_away' || type === 'free') return 'REQUEST TO REUSE';
    if (type === 'borrow') return 'BORROW THIS ITEM';
    if (type === 'exchange') return 'REQUEST EXCHANGE';
    if (type === 'low_cost') return 'REQUEST ITEM';
    return 'REQUEST ITEM';
  };

  // 3. Handle Share Action (Web Share API or Clipboard Fallback)
  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: `${item.title} on LOOOP`,
      text: `Check out "${item.title}" available on LOOOP community sharing circle:`,
      url: shareUrl
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          copyToClipboard(shareUrl);
        }
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url).then(
      () => {
        addToast({
          title: 'Link Copied',
          message: 'Item link copied to your clipboard.',
          variant: 'success'
        });
      },
      () => {
        addToast({
          title: 'Unable to Copy',
          message: 'Could not copy item link.',
          variant: 'error'
        });
      }
    );
  };

  // 4. Handle Save Toggle
  const handleSave = async () => {
    setSaveLoading(true);
    try {
      await itemService.saveItem(item.id);
      const next = !isSaved;
      if (onSaveToggle) {
        onSaveToggle(next);
      } else {
        addToast({
          title: next ? 'Item Saved' : 'Removed from Saved',
          message: next ? `"${item.title}" saved to your collection.` : `Removed from saved items.`,
          variant: next ? 'success' : 'info'
        });
      }
    } catch {
      addToast({
        title: 'Error',
        message: 'Could not update saved status.',
        variant: 'error'
      });
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} className="item-actions-wrapper">
      {/* Reserved / Reused Banners */}
      {isReserved && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#fffbeb',
            border: '1.5px solid #fde68a',
            borderRadius: 'var(--radius-lg)',
            color: '#92400e',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.9rem',
            fontWeight: 700
          }}
        >
          <Clock size={18} color="#b45309" style={{ flexShrink: 0 }} />
          <span>This item is currently reserved for an ongoing handover.</span>
        </div>
      )}

      {isReused && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#f1f5f9',
            border: '1.5px solid #cbd5e1',
            borderRadius: 'var(--radius-lg)',
            color: '#475569',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.9rem',
            fontWeight: 700
          }}
        >
          <CheckCircle2 size={18} color="#059669" style={{ flexShrink: 0 }} />
          <span>This item has already found a new owner in the community.</span>
        </div>
      )}

      {/* 1. Main Action Buttons Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        {isOwner ? (
          // Owner State Banner & Manage Action
          <div
            style={{
              flex: '1 1 240px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 18px',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: 'var(--radius-md)',
              color: '#065f46'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck size={18} color="#059669" />
              <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>This is your item.</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              iconLeft={Edit}
              onClick={() => {
                addToast({
                  title: 'Item Management',
                  message: 'Editing listings will be enabled in the upcoming item management module.',
                  variant: 'info'
                });
              }}
            >
              Manage
            </Button>
          </div>
        ) : (
          // Standard Borrower/Recipient Primary Action Button
          <Button
            variant="primary"
            size="lg"
            disabled={!isAvailable}
            onClick={onRequestClick}
            style={{
              flex: '1 1 240px',
              fontSize: '1rem',
              fontWeight: 800,
              boxShadow: isAvailable ? '0 6px 16px rgba(16, 185, 129, 0.25)' : 'none',
              backgroundColor: !isAvailable ? '#94a3b8' : undefined,
              borderColor: !isAvailable ? '#94a3b8' : undefined
            }}
            iconLeft={Send}
          >
            {getPrimaryLabel()}
          </Button>
        )}

        {/* Save Item Button */}
        <Button
          variant={isSaved ? 'secondary' : 'outline'}
          size="lg"
          onClick={handleSave}
          loading={saveLoading}
          iconLeft={Heart}
          aria-label={isSaved ? 'Remove from saved' : 'Save item'}
          style={{
            minWidth: '110px',
            color: isSaved ? '#ef4444' : 'var(--color-slate-700)',
            borderColor: isSaved ? '#fecaca' : 'var(--color-slate-300)',
            backgroundColor: isSaved ? '#fef2f2' : '#ffffff'
          }}
        >
          {isSaved ? 'Saved' : 'Save'}
        </Button>

        {/* Share Button */}
        <Button
          variant="outline"
          size="lg"
          onClick={handleShare}
          iconLeft={Share2}
          aria-label="Share listing"
          title="Share listing"
          style={{ minWidth: '50px', padding: '0 14px' }}
        >
          Share
        </Button>
      </div>

      {/* 2. Safety Handover Note & Discreet Report Action */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          fontSize: '0.78rem',
          color: 'var(--color-slate-500)',
          paddingTop: '6px'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Lock size={13} color="#059669" />
          <span>Protected by 4-digit handover verification code</span>
        </span>

        <button
          type="button"
          onClick={onReportClick}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-slate-400)',
            fontSize: '0.78rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 4px'
          }}
          className="report-listing-btn"
        >
          <AlertTriangle size={12} />
          <span>Report listing</span>
        </button>
      </div>

      <style>{`
        .report-listing-btn:hover {
          color: var(--color-danger) !important;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default ItemActions;
