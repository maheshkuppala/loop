import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronRight,
  Package,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Repeat,
  ShieldCheck,
  User,
  ExternalLink,
  RefreshCw,
  Send,
  HelpCircle,
  PackageCheck,
  Check,
  MessageSquare,
  Star,
  Edit2
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import Spinner from '../../components/common/Spinner';
import Skeleton from '../../components/common/Skeleton';
import Modal from '../../components/common/Modal';
import TransactionTimeline from '../../components/transactions/TransactionTimeline';
import RatingStars from '../../components/reviews/RatingStars';
import ReviewForm from '../../components/reviews/ReviewForm';
import { transactionService } from '../../services/transactionService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { formatDate, formatCondition, formatSharingType } from '../../utils/formatters';

export const TransactionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Handover Scheduling Form State
  const [isEditingHandover, setIsEditingHandover] = useState(false);
  const [handoverMethod, setHandoverMethod] = useState('In Person');
  const [handoverDate, setHandoverDate] = useState('');
  const [handoverTime, setHandoverTime] = useState('');
  const [locality, setLocality] = useState('');
  const [city, setCity] = useState('');
  const [meetingArea, setMeetingArea] = useState('');
  const [handoverNotes, setHandoverNotes] = useState('');
  const [savingHandover, setSavingHandover] = useState(false);

  // Return Form State (for Borrow)
  const [returnNotes, setReturnNotes] = useState('');
  const [startingReturn, setStartingReturn] = useState(false);
  const [confirmingReturn, setConfirmingReturn] = useState(false);
  const [confirmingHandover, setConfirmingHandover] = useState(false);

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewToEdit, setReviewToEdit] = useState(null);

  const fetchTransaction = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await transactionService.getTransactionById(id);
      if (res && res.transaction) {
        setTransaction(res.transaction);
        // Pre-fill handover form fields
        setHandoverMethod(res.transaction.handoverMethod || 'In Person');
        if (res.transaction.handoverDate) {
          setHandoverDate(new Date(res.transaction.handoverDate).toISOString().split('T')[0]);
        }
        setHandoverTime(res.transaction.handoverTime || '');
        setLocality(res.transaction.handoverLocation?.locality || '');
        setCity(res.transaction.handoverLocation?.city || '');
        setMeetingArea(res.transaction.handoverLocation?.meetingArea || '');
        setHandoverNotes(res.transaction.handoverNotes || '');
      } else {
        throw new Error('Transaction record not found.');
      }
    } catch (err) {
      console.error('Failed to load transaction details:', err);
      const status = err.response?.status;
      if (status === 404) {
        setError('Transaction not found. It may have been removed or does not exist.');
      } else if (status === 403) {
        setError('You do not have permission to view this transaction.');
      } else {
        setError(err.response?.data?.message || err.message || "We couldn't load this transaction. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTransaction();
  }, [fetchTransaction]);

  // Handle Save Handover Details
  const handleSaveHandover = async (e) => {
    e.preventDefault();
    setSavingHandover(true);
    try {
      const payload = {
        handoverMethod,
        handoverDate: handoverDate || undefined,
        handoverTime: handoverTime.trim(),
        handoverLocation: {
          city: city.trim(),
          locality: locality.trim(),
          meetingArea: meetingArea.trim()
        },
        handoverNotes: handoverNotes.trim()
      };

      const res = await transactionService.updateHandover(id, payload);
      if (res && res.success) {
        addToast({
          title: 'Handover Scheduled',
          message: 'Meeting details updated successfully. Both participants can now confirm handover.',
          variant: 'success'
        });
        setTransaction(res.transaction);
        setIsEditingHandover(false);
      }
    } catch (err) {
      addToast({
        title: 'Error',
        message: err.response?.data?.message || err.message || 'Unable to update handover details.',
        variant: 'error'
      });
    } finally {
      setSavingHandover(false);
    }
  };

  // Handle Confirm Handover
  const handleConfirmHandover = async () => {
    setConfirmingHandover(true);
    try {
      const res = await transactionService.confirmHandover(id);
      if (res && res.success) {
        addToast({
          title: 'Confirmation Recorded',
          message: res.message || 'Handover confirmation registered.',
          variant: 'success'
        });
        setTransaction(res.transaction);
      }
    } catch (err) {
      addToast({
        title: 'Confirmation Error',
        message: err.response?.data?.message || err.message || 'Unable to confirm handover.',
        variant: 'error'
      });
    } finally {
      setConfirmingHandover(false);
    }
  };

  // Handle Start Return (Borrower only)
  const handleStartReturn = async () => {
    if (!window.confirm('Are you ready to initiate the return of this borrowed item?')) return;
    setStartingReturn(true);
    try {
      const res = await transactionService.startReturn(id, { returnNotes });
      if (res && res.success) {
        addToast({
          title: 'Return Initiated',
          message: 'Return in progress. Coordinate return meeting with the owner.',
          variant: 'info'
        });
        setTransaction(res.transaction);
      }
    } catch (err) {
      addToast({
        title: 'Error',
        message: err.response?.data?.message || err.message || 'Unable to start return.',
        variant: 'error'
      });
    } finally {
      setStartingReturn(false);
    }
  };

  // Handle Confirm Return Receipt (Owner or Borrower)
  const handleConfirmReturn = async () => {
    setConfirmingReturn(true);
    try {
      const res = await transactionService.confirmReturn(id);
      if (res && res.success) {
        addToast({
          title: 'Return Complete',
          message: res.message || 'Item return confirmed.',
          variant: 'success'
        });
        setTransaction(res.transaction);
      }
    } catch (err) {
      addToast({
        title: 'Error',
        message: err.response?.data?.message || err.message || 'Unable to confirm return.',
        variant: 'error'
      });
    } finally {
      setConfirmingReturn(false);
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div style={{ maxWidth: '1050px', margin: '0 auto', paddingBottom: '4rem' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', alignItems: 'center' }}>
          <Skeleton width="90px" height="18px" />
          <Skeleton width="14px" height="14px" />
          <Skeleton width="140px" height="18px" />
        </div>
        <Skeleton width="340px" height="36px" style={{ marginBottom: '8px' }} />
        <Skeleton width="220px" height="20px" style={{ marginBottom: '2rem' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '1.5rem' }}>
          <Skeleton height="280px" borderRadius="var(--radius-lg)" />
          <Skeleton height="280px" borderRadius="var(--radius-lg)" />
        </div>
      </div>
    );
  }

  // Error State
  if (error || !transaction) {
    return (
      <div style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center' }}>
        <Card style={{ padding: '3rem 2rem', border: '1px solid var(--color-slate-200)' }}>
          <AlertCircle size={48} color="var(--color-danger, #ef4444)" style={{ margin: '0 auto 1.25rem auto' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-slate-900)', marginBottom: '0.5rem' }}>
            {error || 'Transaction Not Found'}
          </h2>
          <p style={{ color: 'var(--color-slate-600)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            {error || 'The requested transaction could not be loaded or you are not authorized to view it.'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <Link to="/transactions" style={{ textDecoration: 'none' }}>
              <Button variant="primary" iconLeft={ArrowLeft}>
                Back to Transactions
              </Button>
            </Link>
            <Button variant="outline" iconLeft={RefreshCw} onClick={fetchTransaction}>
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Derived user roles
  const currentUserId = user?.id || user?._id;
  const isOwner =
    transaction.owner &&
    (transaction.owner._id === currentUserId ||
      transaction.owner.id === currentUserId);
  const isRecipient =
    transaction.recipient &&
    (transaction.recipient._id === currentUserId ||
      transaction.recipient.id === currentUserId);

  const conversationId =
    transaction.conversationId ||
    transaction.conversation?._id ||
    transaction.conversation;

  const item = transaction.item;
  const offeredItem = transaction.offeredItem;
  const isBorrow = transaction.type === 'BORROW';
  const isExchange = transaction.type === 'EXCHANGE';
  const status = transaction.status;

  const isPendingHandover = status === 'PENDING_HANDOVER';
  const isHandoverScheduled = status === 'HANDOVER_SCHEDULED';
  const isActive = status === 'ACTIVE';
  const isReturnPending = status === 'RETURN_PENDING';
  const isCompleted = status === 'COMPLETED';

  // Check if current user has already confirmed handover
  const hasUserConfirmedHandover = isOwner
    ? transaction.handoverConfirmedByOwner
    : isRecipient
    ? transaction.handoverConfirmedByRecipient
    : false;

  const getStatusBadge = (s) => {
    switch (s) {
      case 'COMPLETED':
        return <Badge variant="success">Completed</Badge>;
      case 'ACTIVE':
        return <Badge variant="primary">Active Borrowing</Badge>;
      case 'HANDOVER_SCHEDULED':
        return <Badge variant="info">Handover Scheduled</Badge>;
      case 'RETURN_PENDING':
        return <Badge variant="warning">Return In Progress</Badge>;
      case 'PENDING_HANDOVER':
      default:
        return <Badge variant="warning">Pending Handover</Badge>;
    }
  };

  const getTypeLabel = (t) => {
    switch (t) {
      case 'FREE':
        return 'Free Share';
      case 'GIVEAWAY':
        return 'Give Away';
      case 'BORROW':
        return 'Borrow';
      case 'EXCHANGE':
        return 'Exchange';
      default:
        return t;
    }
  };

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto', paddingBottom: '4rem' }} className="transaction-details-page">
      {/* 1. Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '1.25rem',
          fontSize: '0.85rem',
          color: 'var(--color-slate-500)'
        }}
      >
        <Link
          to="/transactions"
          style={{
            color: 'var(--color-slate-600)',
            textDecoration: 'none',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
          className="hover:underline"
        >
          <ArrowLeft size={14} />
          <span>Transactions</span>
        </Link>
        <ChevronRight size={14} color="var(--color-slate-400)" />
        <span style={{ color: 'var(--color-slate-900)', fontWeight: 700 }}>
          Transaction Details
        </span>
      </nav>

      {/* 2. Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '1.5rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: 'var(--color-primary-700)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}
            >
              {getTypeLabel(transaction.type)} Transaction
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-300)' }}>•</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-slate-500)' }}>
              Started {formatDate(transaction.createdAt)}
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(1.5rem, 2.4vw, 2rem)',
              fontWeight: 900,
              color: 'var(--color-slate-900)',
              margin: '0 0 4px 0',
              letterSpacing: '-0.02em',
              lineHeight: 1.25
            }}
          >
            {item?.title || 'Shared Item'}
          </h1>

          <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-400)', fontFamily: 'monospace' }}>
            Transaction Ref: TX-{transaction._id.slice(-8).toUpperCase()}
          </div>
        </div>

        <div>{getStatusBadge(transaction.status)}</div>
      </div>

      {/* Main Two-Column Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.8fr 1fr',
          gap: '1.5rem',
          alignItems: 'start'
        }}
        className="transaction-grid"
      >
        {/* ==================================================== */}
        {/* LEFT COLUMN: Main Information & Workflow Panels      */}
        {/* ==================================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Status Alert Banner */}
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: isCompleted ? '#ecfdf5' : isActive ? '#f0fdf4' : '#fffbeb',
              border: `1px solid ${isCompleted ? '#a7f3d0' : isActive ? '#bbf7d0' : '#fde68a'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '14px'
            }}
          >
            {isCompleted ? (
              <CheckCircle2 size={24} color="#059669" style={{ flexShrink: 0 }} />
            ) : isActive ? (
              <PackageCheck size={24} color="#16a34a" style={{ flexShrink: 0 }} />
            ) : (
              <Clock size={24} color="#d97706" style={{ flexShrink: 0 }} />
            )}

            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: isCompleted ? '#064e3b' : isActive ? '#14532d' : '#92400e' }}>
                {isCompleted
                  ? 'Transaction Completed'
                  : isActive
                  ? 'Item Handed Over — Active Sharing'
                  : isReturnPending
                  ? 'Return In Progress'
                  : isHandoverScheduled
                  ? 'Meeting Scheduled'
                  : 'Pending Handover Coordination'}
              </div>
              <p style={{ fontSize: '0.85rem', margin: '2px 0 0 0', color: isCompleted ? '#047857' : isActive ? '#15803d' : '#b45309', lineHeight: 1.45 }}>
                {isCompleted
                  ? 'This item handover cycle is complete. Thank you for contributing to circular reuse.'
                  : isActive
                  ? isBorrow
                    ? `Item is in active use. Expected return date: ${transaction.expectedReturnDate ? new Date(transaction.expectedReturnDate).toLocaleDateString() : 'As agreed'}.`
                    : 'Item has been handed over successfully.'
                  : isReturnPending
                  ? 'Borrower has initiated the return. Please meet to return the item and confirm receipt.'
                  : 'Coordinate with the other participant to arrange an in-person meeting point and time.'}
              </p>
            </div>
          </div>

          {/* Item Information Card */}
          <Card style={{ padding: '1.5rem', border: '1px solid var(--color-slate-200)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-slate-500)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
                Primary Item
              </h3>
              {item?._id && (
                <Link to={`/items/${item._id}`} style={{ textDecoration: 'none' }}>
                  <Button variant="outline" size="sm" iconRight={ExternalLink}>
                    View Listing
                  </Button>
                </Link>
              )}
            </div>

            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              {item?.images && item.images.length > 0 ? (
                <img
                  src={typeof item.images[0] === 'string' ? item.images[0] : item.images[0]?.url}
                  alt={item.title}
                  style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-200)', flexShrink: 0 }}
                />
              ) : (
                <div style={{ width: '72px', height: '72px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-slate-400)', flexShrink: 0 }}>
                  <Package size={28} />
                </div>
              )}

              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-slate-900)', margin: '0 0 4px 0' }}>
                  {item?.title || 'Shared Item'}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--color-slate-600)' }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-primary-700)' }}>{item?.category}</span>
                  <span>•</span>
                  <span>Condition: {item?.condition}</span>
                  {item?.location?.city && (
                    <>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <MapPin size={12} />
                        {item.location.locality ? `${item.location.locality}, ` : ''}{item.location.city}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Exchange Offered Item (if EXCHANGE) */}
          {isExchange && offeredItem && (
            <Card style={{ padding: '1.5rem', border: '1px solid var(--color-slate-200)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
                  Offered Item in Exchange
                </h3>
                {offeredItem._id && (
                  <Link to={`/items/${offeredItem._id}`} style={{ textDecoration: 'none' }}>
                    <Button variant="outline" size="sm" iconRight={ExternalLink}>
                      View Item
                    </Button>
                  </Link>
                )}
              </div>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-md)', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Repeat size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-slate-900)', margin: '0 0 2px 0' }}>
                    {offeredItem.title}
                  </h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-slate-600)' }}>
                    Category: {offeredItem.category} • Condition: {offeredItem.condition}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Handover Meeting Coordination Panel */}
          <Card style={{ padding: '1.5rem', border: '1px solid var(--color-slate-200)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-slate-500)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
                Handover Arrangement
              </h3>

              {(isPendingHandover || isHandoverScheduled) && !isEditingHandover && (
                <Button variant="outline" size="sm" onClick={() => setIsEditingHandover(true)}>
                  {transaction.handoverDate ? 'Edit Meeting Details' : 'Set Meeting Details'}
                </Button>
              )}
            </div>

            {isEditingHandover ? (
              /* Editable Handover Form */
              <form onSubmit={handleSaveHandover} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--color-slate-700)', display: 'block', marginBottom: '4px' }}>
                      Handover Method
                    </label>
                    <select
                      value={handoverMethod}
                      onChange={(e) => setHandoverMethod(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-300)', fontSize: '0.875rem' }}
                    >
                      <option value="In Person">In Person Meeting</option>
                      <option value="Pickup">Pickup at Locality</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--color-slate-700)', display: 'block', marginBottom: '4px' }}>
                      Meeting Date
                    </label>
                    <input
                      type="date"
                      value={handoverDate}
                      onChange={(e) => setHandoverDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-300)', fontSize: '0.875rem' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--color-slate-700)', display: 'block', marginBottom: '4px' }}>
                      Approximate Time
                    </label>
                    <input
                      type="text"
                      value={handoverTime}
                      onChange={(e) => setHandoverTime(e.target.value)}
                      placeholder="e.g. 10:30 AM or Evening 6 PM"
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-300)', fontSize: '0.875rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--color-slate-700)', display: 'block', marginBottom: '4px' }}>
                      City / Region
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Bengaluru"
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-300)', fontSize: '0.875rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--color-slate-700)', display: 'block', marginBottom: '4px' }}>
                      Neighborhood / Locality
                    </label>
                    <input
                      type="text"
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      placeholder="e.g. Koramangala 4th Block"
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-300)', fontSize: '0.875rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--color-slate-700)', display: 'block', marginBottom: '4px' }}>
                      Public Meeting Point
                    </label>
                    <input
                      type="text"
                      value={meetingArea}
                      onChange={(e) => setMeetingArea(e.target.value)}
                      placeholder="e.g. Metro station gate or Cafe"
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-300)', fontSize: '0.875rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--color-slate-700)', display: 'block', marginBottom: '4px' }}>
                    Notes for Partner
                  </label>
                  <textarea
                    rows={2}
                    value={handoverNotes}
                    onChange={(e) => setHandoverNotes(e.target.value)}
                    placeholder="e.g. I will be wearing a blue jacket outside the pharmacy entrance."
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-300)', fontSize: '0.875rem' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <Button variant="secondary" size="sm" type="button" onClick={() => setIsEditingHandover(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit" loading={savingHandover}>
                    Save Handover Details
                  </Button>
                </div>
              </form>
            ) : (
              /* Display Scheduled Details */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '1rem',
                    backgroundColor: '#f8fafc',
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-slate-200)'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', fontWeight: 600, textTransform: 'uppercase' }}>
                      Method
                    </div>
                    <div style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--color-slate-800)', marginTop: '2px' }}>
                      {transaction.handoverMethod || 'In Person'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', fontWeight: 600, textTransform: 'uppercase' }}>
                      Scheduled Date & Time
                    </div>
                    <div style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--color-slate-800)', marginTop: '2px' }}>
                      {transaction.handoverDate
                        ? `${new Date(transaction.handoverDate).toLocaleDateString()}${transaction.handoverTime ? ` at ${transaction.handoverTime}` : ''}`
                        : 'To be scheduled'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', fontWeight: 600, textTransform: 'uppercase' }}>
                      Meeting Location
                    </div>
                    <div style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--color-slate-800)', marginTop: '2px' }}>
                      {transaction.handoverLocation?.meetingArea
                        ? `${transaction.handoverLocation.meetingArea} (${transaction.handoverLocation.locality || ''})`
                        : transaction.handoverLocation?.locality || transaction.handoverLocation?.city || 'Local area'}
                    </div>
                  </div>
                </div>

                {transaction.handoverNotes && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-slate-600)', fontStyle: 'italic', padding: '0 4px' }}>
                    Note: "{transaction.handoverNotes}"
                  </div>
                )}

                {/* Handover Confirmations Checklist */}
                <div
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--color-slate-200)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-slate-500)', textTransform: 'uppercase' }}>
                    Handover Status Checklist
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span>Owner Handover Confirmation:</span>
                    {transaction.handoverConfirmedByOwner ? (
                      <span style={{ color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Check size={16} /> Confirmed
                      </span>
                    ) : (
                      <span style={{ color: '#d97706', fontWeight: 600 }}>Pending</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span>Recipient Receipt Confirmation:</span>
                    {transaction.handoverConfirmedByRecipient ? (
                      <span style={{ color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Check size={16} /> Confirmed
                      </span>
                    ) : (
                      <span style={{ color: '#d97706', fontWeight: 600 }}>Pending</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Return Coordination Section (for BORROW transactions) */}
          {isBorrow && (
            <Card style={{ padding: '1.5rem', border: '1px solid var(--color-slate-200)', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-slate-500)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 1rem 0' }}>
                Borrow & Return Status
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--color-slate-700)' }}>
                  <Calendar size={16} color="var(--color-primary-700)" />
                  <span>
                    Expected Return Date:{' '}
                    <strong>
                      {transaction.expectedReturnDate
                        ? new Date(transaction.expectedReturnDate).toLocaleDateString()
                        : 'Not specified'}
                    </strong>
                  </span>
                </div>

                {transaction.returnedAt && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#059669', fontWeight: 600 }}>
                    <CheckCircle2 size={16} />
                    <span>Returned on {new Date(transaction.returnedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Participants Card */}
          <Card style={{ padding: '1.5rem', border: '1px solid var(--color-slate-200)', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-slate-500)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 1rem 0' }}>
              Participants
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              {/* Owner Box */}
              <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-200)', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Link to={`/users/${transaction.owner?._id || transaction.owner?.id}`} style={{ textDecoration: 'none' }}>
                  <Avatar src={transaction.owner?.avatar} name={transaction.owner?.name || 'Owner'} size="md" />
                </Link>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-slate-500)', textTransform: 'uppercase' }}>
                    Item Owner {isOwner ? '(You)' : ''}
                  </div>
                  <Link
                    to={`/users/${transaction.owner?._id || transaction.owner?.id}`}
                    style={{ fontWeight: 800, color: 'var(--color-slate-900)', textDecoration: 'none', display: 'block' }}
                    className="hover:underline"
                  >
                    {isOwner ? 'You' : transaction.owner?.name || 'Community Member'}
                  </Link>
                  {transaction.owner?.trustScore && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-primary-700)', fontWeight: 600 }}>
                      Verified Community Member
                    </div>
                  )}
                </div>
              </div>

              {/* Recipient Box */}
              <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-200)', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Link to={`/users/${transaction.recipient?._id || transaction.recipient?.id}`} style={{ textDecoration: 'none' }}>
                  <Avatar src={transaction.recipient?.avatar} name={transaction.recipient?.name || 'Recipient'} size="md" />
                </Link>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-slate-500)', textTransform: 'uppercase' }}>
                    Recipient {isRecipient ? '(You)' : ''}
                  </div>
                  <Link
                    to={`/users/${transaction.recipient?._id || transaction.recipient?.id}`}
                    style={{ fontWeight: 800, color: 'var(--color-slate-900)', textDecoration: 'none', display: 'block' }}
                    className="hover:underline"
                  >
                    {isRecipient ? 'You' : transaction.recipient?.name || 'Community Member'}
                  </Link>
                  {transaction.recipient?.trustScore && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-primary-700)', fontWeight: 600 }}>
                      Verified Community Member
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Completed Handover Community Reviews Card */}
          {isCompleted && (
            <Card style={{ padding: '1.5rem', border: '1px solid var(--color-slate-200)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-slate-900)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Star size={18} fill="#f59e0b" color="#f59e0b" />
                  <span>Transaction Reviews & Trust</span>
                </h3>

                {transaction.reviewStatus?.canReview && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setReviewToEdit(null);
                      setIsReviewModalOpen(true);
                    }}
                  >
                    Leave a Review
                  </Button>
                )}
              </div>

              {/* Your Review */}
              {transaction.reviewStatus?.myReview ? (
                <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-200)', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--color-slate-900)' }}>Your Review</strong>
                      <RatingStars rating={transaction.reviewStatus.myReview.rating} size={14} />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setReviewToEdit(transaction.reviewStatus.myReview);
                        setIsReviewModalOpen(true);
                      }}
                      style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                    >
                      <Edit2 size={12} style={{ marginRight: '4px' }} />
                      Edit
                    </Button>
                  </div>
                  {transaction.reviewStatus.myReview.comment ? (
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-700)', margin: 0 }}>
                      "{transaction.reviewStatus.myReview.comment}"
                    </p>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-slate-400)', fontStyle: 'italic' }}>
                      Rated {transaction.reviewStatus.myReview.rating} stars with no written comment.
                    </span>
                  )}
                </div>
              ) : transaction.reviewStatus?.canReview ? (
                <div style={{ padding: '1rem', backgroundColor: '#ecfdf5', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                  <div>
                    <strong style={{ fontSize: '0.875rem', color: '#064e3b', display: 'block' }}>
                      Share your experience with {otherUser?.name || 'your neighbor'}
                    </strong>
                    <span style={{ fontSize: '0.78rem', color: '#047857' }}>
                      Your genuine rating builds transparent community trust.
                    </span>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setReviewToEdit(null);
                      setIsReviewModalOpen(true);
                    }}
                  >
                    Rate Handover
                  </Button>
                </div>
              ) : null}

              {/* Partner's Review if available */}
              {transaction.reviewStatus?.otherUserReview && (
                <div style={{ padding: '1rem', backgroundColor: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-200)', marginTop: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--color-slate-900)' }}>
                        Feedback from {otherUser?.name || 'Neighbor'}
                      </strong>
                      <RatingStars rating={transaction.reviewStatus.otherUserReview.rating} size={14} />
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-slate-400)' }}>
                      {formatDate(transaction.reviewStatus.otherUserReview.createdAt)}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-700)', margin: 0 }}>
                    "{transaction.reviewStatus.otherUserReview.comment || 'Smooth handover!'}"
                  </p>
                </div>
              )}
            </Card>
          )}

          {/* Timeline */}
          <Card style={{ padding: '1.5rem', border: '1px solid var(--color-slate-200)', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-slate-500)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 1rem 0' }}>
              Transaction Timeline
            </h3>
            <TransactionTimeline transaction={transaction} />
          </Card>
        </div>

        {/* ==================================================== */}
        {/* RIGHT COLUMN: Action Panel & Verification Controls   */}
        {/* ==================================================== */}
        <div style={{ position: 'sticky', top: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Action Card */}
          <Card style={{ padding: '1.5rem', border: '1px solid var(--color-slate-200)', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-slate-500)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 1rem 0' }}>
              Available Actions
            </h3>

            {/* 1. Confirm Handover Button */}
            {(isPendingHandover || isHandoverScheduled) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-600)', margin: 0, lineHeight: 1.5 }}>
                  {isOwner
                    ? 'Confirm when you have met and handed over the item.'
                    : 'Confirm when you have met and safely received the item.'}
                </p>

                <Button
                  variant="primary"
                  size="lg"
                  iconLeft={Check}
                  disabled={hasUserConfirmedHandover || confirmingHandover}
                  loading={confirmingHandover}
                  onClick={handleConfirmHandover}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {hasUserConfirmedHandover
                    ? 'You Confirmed Handover'
                    : isOwner
                    ? 'Confirm Handover'
                    : 'Confirm Receipt'}
                </Button>
              </div>
            )}

            {/* 2. Borrow Return Workflow: Start Return */}
            {isBorrow && isActive && isRecipient && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-600)', margin: 0, lineHeight: 1.5 }}>
                  Finished using the item? Initiate return to arrange meeting the owner.
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  iconLeft={Repeat}
                  loading={startingReturn}
                  disabled={startingReturn}
                  onClick={handleStartReturn}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Start Return
                </Button>
              </div>
            )}

            {/* 3. Borrow Return Confirmation */}
            {isBorrow && isReturnPending && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-600)', margin: 0, lineHeight: 1.5 }}>
                  {isOwner
                    ? 'Item return is in progress. Confirm once you have received your item back.'
                    : 'Item return is in progress. Owner confirmation will complete the transaction.'}
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  iconLeft={CheckCircle2}
                  loading={confirmingReturn}
                  disabled={confirmingReturn}
                  onClick={handleConfirmReturn}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {isOwner ? 'Confirm Return Received' : 'Confirm Item Returned'}
                </Button>
              </div>
            )}

            {/* 4. Completed State Feedback */}
            {isCompleted && (
              <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#065f46', fontWeight: 800, fontSize: '0.9rem' }}>
                  <CheckCircle2 size={16} />
                  <span>Transaction Concluded</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#047857', margin: '4px 0 0 0', lineHeight: 1.45 }}>
                  All handovers and confirmations are complete.
                </p>
              </div>
            )}

            {/* 5. Message Participant Shortcut (Prompt Section 9) */}
            {conversationId && (
              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-slate-100)' }}>
                <Link
                  to={`/messages/${conversationId}`}
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
              </div>
            )}

            {/* Safety Notice Footer */}
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--color-slate-100)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--color-slate-500)' }}>
              <ShieldCheck size={16} color="#059669" style={{ flexShrink: 0 }} />
              <span>Always meet in a well-lit, public community location.</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Review Submission / Editing Modal */}
      {isCompleted && (
        <Modal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          title={reviewToEdit ? 'Update Your Review' : 'Rate & Review Handover'}
          maxWidth="520px"
        >
          <ReviewForm
            transactionId={transaction._id}
            partnerName={otherUser?.name || 'Neighbor'}
            itemTitle={item?.title || 'Shared Item'}
            existingReview={reviewToEdit}
            onCancel={() => setIsReviewModalOpen(false)}
            onSuccess={() => {
              setIsReviewModalOpen(false);
              addToast({
                title: 'Review Saved',
                message: 'Your review has been published and community trust updated.',
                variant: 'success'
              });
              fetchTransaction();
            }}
          />
        </Modal>
      )}

      <style>{`
        @media (max-width: 860px) {
          .transaction-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default TransactionDetails;
