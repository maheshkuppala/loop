import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Star, ArrowRight, UserCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import { userService } from '../../services/userService';
import { formatDate } from '../../utils/formatters';

export const TrustReputationCard = ({ user: initialUser }) => {
  const [profileData, setProfileData] = useState(initialUser || null);
  const [stats, setStats] = useState(null);
  const [completion, setCompletion] = useState(null);

  useEffect(() => {
    let isMounted = true;
    userService
      .getMyProfile()
      .then((res) => {
        if (isMounted && res && res.success) {
          setProfileData(res.user);
          setStats(res.stats);
          setCompletion(res.profileCompletion);
        }
      })
      .catch((err) => {
        console.warn('Could not load profile stats for reputation card:', err.message);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const user = profileData || initialUser || {};
  const displayName = user.name || 'Member';
  const memberSince = user.createdAt ? formatDate(user.createdAt) : 'Recently';
  const completedHandovers = stats?.completedTransactions || 0;
  const rating = Number(stats?.averageRating || user.rating || 0);
  const reviewsCount = Number(stats?.reviewsReceived || user.reviewsCount || 0);
  const completionPercentage = completion?.percentage || (user.name && user.email ? 60 : 40);

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-slate-200)',
        padding: '1.75rem',
        boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
      className="trust-card-container"
    >
      <div>
        {/* Profile Summary Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Avatar src={user.avatar} name={displayName} size="md" />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-slate-900)', margin: 0 }}>
                  {displayName}
                </h3>
                {user.verified !== false && <Badge variant="success">Verified</Badge>}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)' }}>
                Member since {memberSince}
              </span>
            </div>
          </div>

          <Link
            to="/profile"
            style={{
              fontSize: '0.8rem',
              color: 'var(--color-primary-700)',
              fontWeight: 700,
              textDecoration: 'none'
            }}
          >
            Manage Profile
          </Link>
        </div>

        {/* Profile Completion Meter */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem',
            border: '1px solid var(--color-slate-200)',
            marginBottom: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} color="var(--color-primary-600)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-slate-800)' }}>
                Profile Completion
              </span>
            </div>
            <span style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--color-primary-700)' }}>
              {completionPercentage}%
            </span>
          </div>

          {/* Progress bar */}
          <div style={{ height: '6px', width: '100%', backgroundColor: 'var(--color-slate-200)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${completionPercentage}%`,
                background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                borderRadius: 'var(--radius-full)'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.75rem', color: 'var(--color-slate-600)' }}>
            <span>{completedHandovers} {completedHandovers === 1 ? 'handover completed' : 'handovers completed'}</span>
            <span>
              {reviewsCount > 0 ? (
                <>⭐ {rating.toFixed(1)} ({reviewsCount} {reviewsCount === 1 ? 'review' : 'reviews'})</>
              ) : (
                <>No reviews yet</>
              )}
            </span>
          </div>
        </div>

        {/* LOOOP Trust Mechanics Notice */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--color-slate-700)' }}>
            <ShieldCheck size={14} color="#059669" style={{ flexShrink: 0 }} />
            <span>Cryptographically verified session & token authentication</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--color-slate-700)' }}>
            <UserCheck size={14} color="#059669" style={{ flexShrink: 0 }} />
            <span>Community ratings derived only from completed handovers</span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--color-slate-100)' }}>
        <Link
          to="/profile"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.825rem',
            fontWeight: 700,
            color: 'var(--color-slate-800)',
            textDecoration: 'none'
          }}
          className="reputation-reviews-link"
        >
          <span>View Verified Community Standing</span>
          <ArrowRight size={14} color="var(--color-primary-600)" />
        </Link>
      </div>

      <style>{`
        .reputation-reviews-link:hover {
          color: var(--color-primary-700);
        }
      `}</style>
    </div>
  );
};

export default TrustReputationCard;
