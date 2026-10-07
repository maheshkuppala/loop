import React, { useState } from 'react';
import {
  Send,
  Heart,
  Share2,
  AlertTriangle,
  CheckCircle2,
  Lock,
  UserCheck,
  Edit,
  Sparkles
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

  // 1. Ownership verification
  const currentUserId = currentUser?.id || currentUser?._id;
  const itemOwnerId = typeof item.owner === 'object' ? (item.owner?._id || item.owner?.id) : item.owner;
  const isOwner = !!(
    (currentUserId && itemOwnerId && currentUserId.toString() === itemOwnerId.toString()) ||
    (currentUser?.email && item.owner?.email && currentUser.email === item.owner.email)
  );
  const isAvailable = item.status === 'AVAILABLE' || !item.status;

  // 2. Derive primary button label based on sharing type
  const getPrimaryLabel = () => {
    if (!isAvailable) return 'Currently Unavailable';
    if (item.sharingType === 'borrow') return 'Request to Borrow';
    if (item.sharingType === 'exchange') return 'Request Exchange';
    return 'Request Item';
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
      onSaveToggle(next);
      addToast({
        title: next ? 'Item Saved' : 'Removed from Saved',
        message: next ? `"${item.title}" saved to your collection.` : `Removed from saved items.`,
        variant: next ? 'success' : 'info'
      });
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
          // Standard Borrower/Recipient Primary Action
          <Button
            variant="primary"
            size="lg"
            disabled={!isAvailable}
            onClick={onRequestClick}
            style={{
              flex: '1 1 240px',
              fontSize: '1rem',
              fontWeight: 800,
              boxShadow: '0 6px 16px rgba(16, 185, 129, 0.25)'
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
            color: isSaved ? 'var(--color-danger)' : 'var(--color-slate-700)',
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
