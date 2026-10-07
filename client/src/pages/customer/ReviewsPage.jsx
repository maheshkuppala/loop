import React, { useState } from 'react';
import { Star, MessageSquare, ThumbsUp, ShieldCheck, Award, Plus, CheckCircle2 } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import Tabs from '../../components/common/Tabs';
import Modal from '../../components/common/Modal';
import Rating from '../../components/common/Rating';
import Textarea from '../../components/common/Textarea';
import Select from '../../components/common/Select';
import { mockReviewsData, mockUsers, mockTransactions } from '../../data/mockData';
import { formatSharingType } from '../../utils/formatters';
import { useToast } from '../../hooks/useToast';

export const ReviewsPage = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('received');
  const [reviewsState, setReviewsState] = useState(mockReviewsData);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);

  // New review form state
  const [selectedTx, setSelectedTx] = useState(mockTransactions[0]?.id || '');
  const [ratingValue, setRatingValue] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentUser = mockUsers.currentUser;

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      addToast({
        title: 'Review Required',
        message: 'Please write a short note about your sharing experience.',
        variant: 'warning'
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const tx = mockTransactions.find(t => t.id === selectedTx) || mockTransactions[0];
      const newReview = {
        id: `rev-sub-${Date.now()}`,
        recipient: {
          name: tx.owner.id === currentUser.id ? tx.receiver.name : tx.owner.name,
          avatar: tx.owner.id === currentUser.id ? tx.receiver.avatar : tx.owner.avatar
        },
        itemTitle: tx.itemTitle,
        sharingType: tx.sharingType,
        rating: ratingValue,
        date: 'Just now',
        comment: reviewComment
      };

      setReviewsState(prev => ({
        ...prev,
        submitted: [newReview, ...prev.submitted]
      }));

      setIsSubmitting(false);
      setIsWriteModalOpen(false);
      setReviewComment('');
      setActiveTab('submitted');

      addToast({
        title: 'Review Submitted!',
        message: 'Thank you for building community trust on Looop.',
        variant: 'success'
      });
    }, 600);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-slate-900)', marginBottom: '4px' }}>
            Trust & Community Reviews
          </h1>
          <p style={{ color: 'var(--color-slate-600)', fontSize: '0.95rem' }}>
            Transparent feedback from neighbors and fellow sharers across Bengaluru.
          </p>
        </div>

        <Button
          variant="primary"
          iconLeft={Plus}
          onClick={() => setIsWriteModalOpen(true)}
        >
          Write a Review
        </Button>
      </div>

      {/* Trust Score & Rating Overview Banner */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.25rem'
        }}
      >
        <Card style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary-50)',
              border: '1px solid var(--color-primary-200)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Star size={32} color="var(--color-primary-600)" fill="var(--color-primary-500)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-slate-900)', lineHeight: 1 }}>
                4.9
              </span>
              <span style={{ fontSize: '1rem', color: 'var(--color-slate-400)', fontWeight: 600 }}>/ 5.0</span>
            </div>
            <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Rating score={4.9} size={15} />
              <span style={{ fontSize: '0.8rem', color: 'var(--color-slate-500)' }}>
                ({reviewsState.received.length} received reviews)
              </span>
            </div>
          </div>
        </Card>

        <Card style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <ShieldCheck size={32} color="var(--color-primary-600)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-primary-700)', lineHeight: 1 }}>
                {currentUser.trustScore}%
              </span>
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-slate-800)', display: 'block', marginTop: '2px' }}>
              Community Trust Score
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)' }}>
              100% on-time returns & accurate descriptions
            </span>
          </div>
        </Card>

        <Card style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Award size={32} color="#3b82f6" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-slate-900)', lineHeight: 1 }}>
                {reviewsState.submitted.length}
              </span>
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-slate-800)', display: 'block', marginTop: '2px' }}>
              Reviews Given by You
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)' }}>
              Helping good sharers stand out
            </span>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'received', label: 'Received Reviews', count: reviewsState.received.length },
          { id: 'submitted', label: 'Given by You', count: reviewsState.submitted.length }
        ]}
      />

      {/* Reviews List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {activeTab === 'received' ? (
          reviewsState.received.map(rev => {
            const sharing = formatSharingType(rev.sharingType);
            return (
              <Card key={rev.id} style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Avatar src={rev.author.avatar} name={rev.author.name} size="md" />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, color: 'var(--color-slate-900)', fontSize: '1rem' }}>
                          {rev.author.name}
                        </span>
                        <Badge variant="success">
                          {rev.author.trustScore}% Trust
                        </Badge>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-slate-400)' }}>
                        {rev.date}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Badge variant={sharing.badgeVariant}>{sharing.label}</Badge>
                    <Rating score={rev.rating} size={15} />
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--color-slate-50)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '0.75rem', border: '1px solid var(--color-slate-100)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-slate-500)', fontWeight: 500 }}>
                    Item Shared: <strong style={{ color: 'var(--color-slate-800)' }}>{rev.itemTitle}</strong>
                  </span>
                </div>

                <p style={{ color: 'var(--color-slate-700)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                  "{rev.comment}"
                </p>
              </Card>
            );
          })
        ) : (
          reviewsState.submitted.map(rev => {
            const sharing = formatSharingType(rev.sharingType);
            return (
              <Card key={rev.id} style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Avatar src={rev.recipient.avatar} name={rev.recipient.name} size="md" />
                    <div>
                      <span style={{ fontWeight: 700, color: 'var(--color-slate-900)', fontSize: '1rem', display: 'block' }}>
                        Reviewed {rev.recipient.name}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-slate-400)' }}>
                        {rev.date}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Badge variant={sharing.badgeVariant}>{sharing.label}</Badge>
                    <Rating score={rev.rating} size={15} />
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--color-slate-50)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '0.75rem', border: '1px solid var(--color-slate-100)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-slate-500)', fontWeight: 500 }}>
                    Item Transaction: <strong style={{ color: 'var(--color-slate-800)' }}>{rev.itemTitle}</strong>
                  </span>
                </div>

                <p style={{ color: 'var(--color-slate-700)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                  "{rev.comment}"
                </p>
              </Card>
            );
          })
        )}
      </div>

      {/* Write a Review Modal */}
      <Modal
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        title="Leave a Community Review"
      >
        <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Select
            label="Select Completed Transaction"
            value={selectedTx}
            onChange={(e) => setSelectedTx(e.target.value)}
            options={mockTransactions.map(t => ({
              value: t.id,
              label: `${t.itemTitle} (${t.status})`
            }))}
          />

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-slate-700)', marginBottom: '8px' }}>
              Rating (1 to 5 Stars)
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRatingValue(star)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    transition: 'transform var(--transition-fast)'
                  }}
                >
                  <Star
                    size={28}
                    color={star <= ratingValue ? 'var(--color-primary-500)' : 'var(--color-slate-300)'}
                    fill={star <= ratingValue ? 'var(--color-primary-500)' : 'none'}
                  />
                </button>
              ))}
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-slate-700)', marginLeft: '8px' }}>
                {ratingValue} / 5 Stars
              </span>
            </div>
          </div>

          <Textarea
            label="Review & Feedback"
            placeholder="Describe the handover, punctuality, and item condition..."
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            rows={4}
            required
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '0.5rem' }}>
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsWriteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={isSubmitting}
              iconLeft={CheckCircle2}
            >
              Submit Review
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ReviewsPage;
