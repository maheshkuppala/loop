import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  MapPin,
  Calendar,
  Star,
  Package,
  Repeat,
  Flag,
  Lock,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Skeleton from '../../components/common/Skeleton';
import ItemCard from '../../components/common/ItemCard';
import RatingStars from '../../components/reviews/RatingStars';
import RatingSummary from '../../components/reviews/RatingSummary';
import ReviewList from '../../components/reviews/ReviewList';
import ReportUserModal from '../../components/profile/ReportUserModal';
import { userService } from '../../services/userService';
import { reviewService } from '../../services/reviewService';
import { impactService } from '../../services/impactService';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/formatters';

export const PublicProfilePage = () => {
  const { id } = useParams();
  const { user: currentUser, isAuthenticated } = useAuth();

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [reviewSummary, setReviewSummary] = useState(null);
  const [publicItems, setPublicItems] = useState([]);
  const [isRestricted, setIsRestricted] = useState(false);
  const [impactData, setImpactData] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsTotalPages, setReviewsTotalPages] = useState(1);
  const [loadingMoreReviews, setLoadingMoreReviews] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const loadPublicProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsRestricted(false);

    try {
      const res = await userService.getPublicProfile(id);

      if (res && res.isRestricted) {
        setIsRestricted(true);
        setProfile(res.user);
        return;
      }

      if (res && res.success && res.user) {
        setProfile(res.user);
        setStats(res.stats);
        setReviewSummary(res.reviewSummary);
        setPublicItems(res.publicItems || []);

        // Load reviews and public environmental impact in parallel
        try {
          const [revRes, impRes] = await Promise.all([
            reviewService.getUserReviews(id, { page: 1, limit: 10 }),
            impactService.getUserPublicImpact(id).catch(() => null)
          ]);

          if (revRes && revRes.success) {
            setReviews(revRes.reviews || []);
            setReviewsTotal(revRes.total || 0);
            setReviewsPage(revRes.page || 1);
            setReviewsTotalPages(revRes.totalPages || 1);
          }

          if (impRes && impRes.success) {
            setImpactData(impRes.impact);
          }
        } catch (revErr) {
          console.warn('Could not load public profile sub-resources:', revErr);
        }
      } else {
        throw new Error(res?.message || 'User not found.');
      }
    } catch (err) {
      console.error('Failed to load public profile:', err);
      const status = err.response?.status;
      if (status === 404) {
        setError('User profile not found. This user may not exist or has been removed.');
      } else {
        setError(err.response?.data?.message || err.message || 'Unable to load member profile.');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPublicProfile();
    window.scrollTo(0, 0);
  }, [loadPublicProfile]);

  const handleLoadMoreReviews = async () => {
    if (loadingMoreReviews || reviewsPage >= reviewsTotalPages) return;
    setLoadingMoreReviews(true);
    try {
      const nextPage = reviewsPage + 1;
      const res = await reviewService.getUserReviews(id, { page: nextPage, limit: 10 });
      if (res && res.success) {
        setReviews((prev) => [...prev, ...(res.reviews || [])]);
        setReviewsPage(nextPage);
      }
    } catch (err) {
      console.error('Failed to load more reviews:', err);
    } finally {
      setLoadingMoreReviews(false);
    }
  };

  const currentUserId = currentUser?._id || currentUser?.id;
  const isSelf = currentUserId && (currentUserId.toString() === id);

  if (loading) {
    return (
      <div style={{ maxWidth: '1040px', margin: '2rem auto', padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <Card style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <Skeleton width="88px" height="88px" circle />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              <Skeleton width="200px" height="26px" />
              <Skeleton width="140px" height="16px" />
              <Skeleton width="260px" height="14px" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (isRestricted) {
    return (
      <div style={{ maxWidth: '600px', margin: '3rem auto', padding: '0 1rem' }}>
        <Card style={{ padding: '3rem 2rem', textAlign: 'center', borderRadius: 'var(--radius-xl)' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              backgroundColor: '#f1f5f9',
              color: 'var(--color-slate-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto'
            }}
          >
            <Lock size={26} />
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-slate-900)', marginBottom: '8px' }}>
            Community-Only Profile
          </h2>
          <p style={{ color: 'var(--color-slate-600)', fontSize: '0.9rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            {profile?.name || 'This member'} has set their profile visibility to verified community members only. Please log in or register to connect and view their profile.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Button variant="primary">Sign In to LOOOP</Button>
            </Link>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <Button variant="outline">Create Account</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={{ maxWidth: '600px', margin: '3rem auto', padding: '0 1rem' }}>
        <Card style={{ padding: '3rem 2rem', textAlign: 'center', borderRadius: 'var(--radius-xl)' }}>
          <AlertCircle size={44} color="#ef4444" style={{ margin: '0 auto 1rem auto' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-slate-900)', marginBottom: '8px' }}>
            Profile Unavailable
          </h2>
          <p style={{ color: 'var(--color-slate-600)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            {error || 'This member profile is not accessible or does not exist.'}
          </p>
          <Link to="/browse" style={{ textDecoration: 'none' }}>
            <Button variant="primary">Browse Community Listings</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const memberSinceFormatted = profile.memberSince ? formatDate(profile.memberSince) : 'Recently';
  const averageRating = reviewSummary?.averageRating || profile.rating || 0;
  const totalReviews = reviewSummary?.totalReviews || profile.reviewsCount || 0;
  const completedTxCount = stats?.completedTransactions || 0;

  // Approximate location only (city, state) - NEVER street or locality
  const approximateLocation = [profile.city, profile.state].filter(Boolean).join(', ');

  return (
    <div style={{ maxWidth: '1080px', margin: '2rem auto', padding: '0 1.25rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 1. Public Profile Header Card */}
      <Card
        style={{
          padding: '2.5rem',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-slate-200)',
          boxShadow: '0 4px 14px rgba(15, 23, 42, 0.03)'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1.75rem'
          }}
        >
          {/* Avatar & Main Info */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
            <Avatar src={profile.avatar} name={profile.name} size="xl" />

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--color-slate-900)', margin: 0 }}>
                  {profile.name}
                </h1>
                {profile.verified && (
                  <Badge variant="success">
                    <ShieldCheck size={13} style={{ marginRight: '4px' }} />
                    Verified Sharer
                  </Badge>
                )}
                {isSelf && (
                  <Badge variant="info">
                    Your Profile
                  </Badge>
                )}
              </div>

              {/* Bio */}
              {profile.bio ? (
                <p style={{ fontSize: '0.925rem', color: 'var(--color-slate-600)', margin: '4px 0 10px 0', maxWidth: '550px', lineHeight: 1.5 }}>
                  {profile.bio}
                </p>
              ) : (
                <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-400)', fontStyle: 'italic', margin: '4px 0 10px 0' }}>
                  No bio added yet.
                </p>
              )}

              {/* Approximate Location & Joined */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', color: 'var(--color-slate-500)', fontSize: '0.85rem', marginBottom: '10px' }}>
                {approximateLocation ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <MapPin size={15} color="var(--color-primary-600)" />
                    {approximateLocation}
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--color-slate-400)' }}>
                    <MapPin size={15} />
                    Location area not specified
                  </span>
                )}

                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Calendar size={15} />
                  Member since {memberSinceFormatted}
                </span>
              </div>

              {/* Ratings Summary Pill */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RatingStars rating={Math.round(averageRating)} size={16} />
                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--color-slate-800)' }}>
                  {totalReviews > 0 ? averageRating.toFixed(1) : 'New Member'}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-slate-500)' }}>
                  ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            </div>
          </div>

          {/* Action: Report User button or Edit own */}
          <div>
            {isSelf ? (
              <Link to="/profile" style={{ textDecoration: 'none' }}>
                <Button variant="outline">Manage Profile</Button>
              </Link>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsReportModalOpen(true)}
                style={{ color: 'var(--color-slate-500)', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Flag size={14} />
                <span>Report User</span>
              </Button>
            )}
          </div>
        </div>

        {/* Real Metrics Counter Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '1rem',
            paddingTop: '1.75rem',
            marginTop: '1.75rem',
            borderTop: '1px solid var(--color-slate-100)',
            textAlign: 'center'
          }}
        >
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--color-slate-900)' }}>
              {publicItems.length}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)', fontWeight: 600, textTransform: 'uppercase' }}>
              Active Listings
            </div>
          </div>

          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--color-primary-600)' }}>
              {completedTxCount}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)', fontWeight: 600, textTransform: 'uppercase' }}>
              Completed Handovers
            </div>
          </div>

          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0284c7' }}>
              {stats?.itemsShared || publicItems.length}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)', fontWeight: 600, textTransform: 'uppercase' }}>
              Items Shared
            </div>
          </div>

          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#d97706' }}>
              {totalReviews}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)', fontWeight: 600, textTransform: 'uppercase' }}>
              Reviews Received
            </div>
          </div>

          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#059669' }}>
              {totalReviews > 0 ? averageRating.toFixed(1) : '—'}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)', fontWeight: 600, textTransform: 'uppercase' }}>
              Average Rating
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Interests Tags */}
      {profile.interests && profile.interests.length > 0 && (
        <Card style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
          <h2 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-slate-400)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 10px 0' }}>
            Sharing Interests
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {profile.interests.map((tag) => (
              <span
                key={tag}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-primary-50)',
                  border: '1px solid var(--color-primary-200)',
                  color: 'var(--color-primary-800)',
                  fontSize: '0.825rem',
                  fontWeight: 600
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* 2b. Public Circular Reuse Impact */}
      {impactData && (
        <Card style={{ padding: '1.75rem', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Repeat size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-slate-900)', margin: 0 }}>
                  Circular Reuse & Sharing Impact
                </h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-slate-500)' }}>
                  Verified reuse contribution across local Bengaluru circles
                </span>
              </div>
            </div>

            <Badge variant="success" size="sm">Verified Activity</Badge>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', textAlign: 'center', marginBottom: '1rem' }}>
            <div style={{ padding: '12px', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-slate-900)' }}>
                {impactData.totalItemsReused ?? 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', fontWeight: 600, textTransform: 'uppercase' }}>
                Items Reused
              </div>
            </div>

            <div style={{ padding: '12px', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#2563eb' }}>
                {impactData.itemsShared ?? 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', fontWeight: 600, textTransform: 'uppercase' }}>
                Items Shared
              </div>
            </div>

            <div style={{ padding: '12px', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#059669' }}>
                {impactData.completedReuseTransactions ?? 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', fontWeight: 600, textTransform: 'uppercase' }}>
                Completed Handovers
              </div>
            </div>

            <div style={{ padding: '12px', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#d97706' }}>
                {impactData.milestones?.length || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', fontWeight: 600, textTransform: 'uppercase' }}>
                Milestones Earned
              </div>
            </div>
          </div>

          {impactData.environmentalMetrics?.co2eAvoided !== null && impactData.environmentalMetrics?.co2eAvoided !== undefined && (
            <div style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: '#f0fdfa', border: '1px solid #ccfbf1', fontSize: '0.8rem', color: '#0f766e', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>✓ Estimated <strong>{impactData.environmentalMetrics.co2eAvoided} kg CO₂e</strong> emissions averted through peer reuse.</span>
            </div>
          )}
        </Card>
      )}

      {/* 3. Real Rating Summary & Feedback Breakdown */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          alignItems: 'start'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-slate-900)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Star size={18} fill="#f59e0b" color="#f59e0b" />
            <span>Community Feedback & Rating</span>
          </h2>

          <RatingSummary
            averageRating={averageRating}
            totalReviews={totalReviews}
            distribution={reviewSummary?.distribution}
          />
        </div>

        {/* Explainable Trust Indicators */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-slate-900)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} color="#059669" />
            <span>Community Standing</span>
          </h2>

          <Card style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--color-slate-800)', display: 'block' }}>
                    Verified LOOOP Member
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)' }}>
                    Active member adhering to circular sharing principles
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Repeat size={18} />
                </div>
                <div>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--color-slate-800)', display: 'block' }}>
                    {completedTxCount} Verified {completedTxCount === 1 ? 'Handover' : 'Handovers'}
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)' }}>
                    Mutual confirmation between owner and recipient
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#fefce8', color: '#ca8a04', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Star size={18} />
                </div>
                <div>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--color-slate-800)', display: 'block' }}>
                    {totalReviews > 0 ? `${averageRating.toFixed(1)} Rating (${totalReviews} reviews)` : 'No reviews recorded yet'}
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)' }}>
                    100% verified feedback from real participants
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* 4. Active Items Shared by This User */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-slate-900)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={20} color="var(--color-primary-600)" />
            <span>Items Shared by {profile.name}</span>
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-slate-500)', fontWeight: 600 }}>
            {publicItems.length} {publicItems.length === 1 ? 'item' : 'items'} available
          </span>
        </div>

        {publicItems.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '1.25rem'
            }}
          >
            {publicItems.map((item) => (
              <ItemCard key={item.id || item._id} item={item} />
            ))}
          </div>
        ) : (
          <Card style={{ padding: '2.5rem 1.5rem', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
            <Package size={32} color="var(--color-slate-400)" style={{ margin: '0 auto 8px auto' }} />
            <strong style={{ fontSize: '0.95rem', color: 'var(--color-slate-700)', display: 'block' }}>
              No public items currently
            </strong>
            <p style={{ fontSize: '0.825rem', color: 'var(--color-slate-500)', margin: '4px 0 0 0' }}>
              This member has no active items available for sharing right now.
            </p>
          </Card>
        )}
      </section>

      {/* 5. Verified Community Reviews List */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-slate-900)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={20} color="var(--color-primary-600)" />
          <span>Member Reviews ({totalReviews})</span>
        </h2>

        <ReviewList
          reviews={reviews}
          loading={false}
          currentUserId={currentUserId}
          page={reviewsPage}
          totalPages={reviewsTotalPages}
          onLoadMore={handleLoadMoreReviews}
          loadingMore={loadingMoreReviews}
          emptyTitle="No reviews yet"
          emptyDescription={`${profile.name} hasn't received reviews from handovers yet.`}
        />
      </section>

      {/* Report User Modal */}
      <ReportUserModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        targetUserId={profile._id || profile.id}
        targetUserName={profile.name}
      />
    </div>
  );
};

export default PublicProfilePage;
