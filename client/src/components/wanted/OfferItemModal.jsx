import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  Sparkles,
  Package,
  AlertCircle,
  CheckCircle2,
  Clock,
  MapPin,
  Tag,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { itemService } from '../../services/itemService';
import { requestService } from '../../services/requestService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';

export const OfferItemModal = ({ wantedItem, isOpen, onClose, onOfferSuccess }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [myItems, setMyItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const isLoggedIn = !!(user && (isAuthenticated || user.id || user.email));

  useEffect(() => {
    if (isOpen && isLoggedIn) {
      const loadUserItems = async () => {
        setLoadingItems(true);
        setError(null);
        try {
          const res = await itemService.getMyItems({ status: 'available', limit: 30 });
          const items = (res?.items || []).filter(
            (i) => i.availability === 'Available' || i.status === 'AVAILABLE' || !i.status
          );
          setMyItems(items);
          if (items.length > 0) {
            // Prioritize item matching the wanted category if available
            const categoryMatch = items.find((i) => i.category === wantedItem?.category);
            setSelectedItemId(categoryMatch ? (categoryMatch.id || categoryMatch._id) : (items[0].id || items[0]._id));
          }
        } catch (err) {
          console.error('Failed to load user items:', err);
        } finally {
          setLoadingItems(false);
        }
      };
      loadUserItems();
    }
  }, [isOpen, isLoggedIn, wantedItem?.category]);

  if (!wantedItem) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isLoggedIn) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (!selectedItemId) {
      setError('Please select one of your available items to offer.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await requestService.createRequest({
        wantedItemId: wantedItem.id || wantedItem._id,
        offeredItemId: selectedItemId,
        message: message.trim()
      });

      if (response && response.success) {
        addToast({
          title: 'Offer Submitted!',
          message: `Your offer to help with "${wantedItem.title}" has been sent to ${wantedItem.requester?.name || 'the requester'}.`,
          variant: 'success'
        });
        if (onOfferSuccess) onOfferSuccess(response.request);
        onClose();
      } else {
        throw new Error(response?.message || 'Could not submit offer.');
      }
    } catch (err) {
      console.error('Offer submission error:', err);
      setError(err.response?.data?.message || err.message || 'Unable to submit offer right now.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedItemObj = myItems.find((i) => (i.id || i._id) === selectedItemId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Offer an Item to Help"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            loading={submitting}
            disabled={submitting || myItems.length === 0}
            onClick={handleSubmit}
            iconLeft={Send}
          >
            Send Offer
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-danger-bg, #fef2f2)',
              color: '#991b1b',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid var(--color-danger-border, #fecaca)'
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Wanted Request Summary */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 800, color: '#065f46', textTransform: 'uppercase', marginBottom: '4px' }}>
            <Sparkles size={13} />
            <span>Wanted Request</span>
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#064e3b' }}>
            {wantedItem.title}
          </div>
          <div style={{ fontSize: '0.825rem', color: '#047857', marginTop: '2px' }}>
            Category: {wantedItem.category} • Seeking: {(wantedItem.preferredSharingType || 'any').replace('_', ' ')} • Condition: {(wantedItem.conditionPreference || 'any').replace('_', ' ')}
          </div>
        </div>

        {/* Select Offered Item */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-slate-800)' }}>
            Choose an item from your collection to offer <span style={{ color: 'var(--color-danger)' }}>*</span>
          </label>

          {loadingItems ? (
            <div style={{ fontSize: '0.85rem', color: 'var(--color-slate-500)', padding: '12px', textAlign: 'center' }}>
              Loading your available items...
            </div>
          ) : myItems.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
              {myItems.map((item) => {
                const itemId = item.id || item._id;
                const isSelected = selectedItemId === itemId;
                const img = Array.isArray(item.images) && item.images.length > 0
                  ? (typeof item.images[0] === 'string' ? item.images[0] : item.images[0]?.url)
                  : null;

                return (
                  <div
                    key={itemId}
                    onClick={() => setSelectedItemId(itemId)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? '2px solid var(--color-primary-600)' : '1px solid var(--color-slate-200)',
                      backgroundColor: isSelected ? '#ecfdf5' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {img ? (
                      <img src={img} alt={item.title} style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: 'var(--radius-xs)', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-xs)', backgroundColor: 'var(--color-slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-slate-400)', flexShrink: 0 }}>
                        <Package size={20} />
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: isSelected ? 'var(--color-primary-800)' : 'var(--color-slate-800)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: isSelected ? 'var(--color-primary-700)' : 'var(--color-slate-500)', textTransform: 'capitalize' }}>
                        {item.category} • Condition: {item.condition} • {item.sharingType?.replace('_', ' ')}
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 size={18} color="var(--color-primary-600)" style={{ flexShrink: 0 }} />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', backgroundColor: '#fffbeb', border: '1px solid #fef3c7', textAlign: 'center' }}>
              <Package size={32} color="#d97706" style={{ margin: '0 auto 8px auto' }} />
              <div style={{ fontWeight: 700, color: '#92400e', marginBottom: '4px' }}>No available items to offer</div>
              <p style={{ fontSize: '0.825rem', color: '#b45309', margin: '0 0 10px 0' }}>
                You don't currently have any items listed as available. You can post an item first to offer it to neighbors.
              </p>
              <Button
                variant="outline"
                size="sm"
                iconLeft={PlusCircle}
                onClick={() => {
                  onClose();
                  navigate('/share');
                }}
              >
                Share an Item Now
              </Button>
            </div>
          )}
        </div>

        {/* Offer Message Textarea */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="offer-message" style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-slate-800)' }}>
            Offer Message
          </label>
          <textarea
            id="offer-message"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. I have this calculator available and can lend it to you for two weeks."
            maxLength={2000}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-slate-300)',
              backgroundColor: '#ffffff',
              color: 'var(--color-slate-900)',
              fontSize: '0.875rem',
              lineHeight: 1.5,
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)', lineHeight: 1.45 }}>
          * Your offer will be sent to the requester. If accepted, safe pickup logistics will be coordinated through LOOOP.
        </div>
      </form>
    </Modal>
  );
};

export default OfferItemModal;
