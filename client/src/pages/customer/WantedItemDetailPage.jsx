import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Share2,
  Trash2,
  Tag,
  Layers,
  FileText,
  UserCheck
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import Spinner from '../../components/common/Spinner';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { wantedService } from '../../services/wantedService';
import { mockWantedItems } from '../../data/mockData';
import OfferItemModal from '../../components/wanted/OfferItemModal';

export const WantedItemDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [wantedItem, setWantedItem] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [offerModalOpen, setOfferModalOpen] = useState(false);

  useEffect(() => {
    const fetchWantedItem = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await wantedService.getWantedItemById(id);
        if (response && response.wantedItem) {
          setWantedItem(response.wantedItem);
        } else {
          throw new Error('Wanted request not found.');
        }
      } catch (err) {
        console.warn('API error fetching wanted item by ID, checking local items:', err);
        const match = mockWantedItems.find((w) => w.id === id || w._id === id);
        if (match) {
          setWantedItem(match);
        } else {
          setError(err.response?.data?.message || err.message || 'Wanted item request not found.');
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchMatches = async () => {
      setLoadingMatches(true);
      try {
        const res = await wantedService.getWantedMatches(id);
        if (res && res.success) {
          setMatches(res.matches || []);
        }
      } catch (err) {
        console.error('Error fetching matches:', err);
      } finally {
        setLoadingMatches(false);
      }
    };

    fetchWantedItem();
    fetchMatches();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to close this wanted item request?')) {
      return;
    }
    setDeleting(true);
    try {
      await wantedService.deleteWantedItem(id);
      addToast({
        title: 'Request Closed',
        message: 'Your wanted item request has been closed.',
        variant: 'info'
      });
      navigate('/wanted');
    } catch (err) {
      addToast({
        title: 'Error',
        message: err.message || 'Could not close request.',
        variant: 'error'
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !wantedItem) {
    return (
      <div style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center' }}>
        <Card style={{ padding: '3rem 2rem' }}>
          <AlertCircle size={48} color="var(--color-danger, #ef4444)" style={{ margin: '0 auto 1rem auto' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-slate-900)', marginBottom: '0.5rem' }}>
            Request Not Found
          </h2>
          <p style={{ color: 'var(--color-slate-600)', marginBottom: '1.5rem' }}>
            {error || 'This wanted item request may have been fulfilled or removed.'}
          </p>
          <Link to="/wanted" style={{ textDecoration: 'none' }}>
            <Button variant="primary" iconLeft={ArrowLeft}>
              Back to Wanted Items
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const isOwner =
    user && wantedItem.requester && (user.id === wantedItem.requester._id || user.id === wantedItem.requester.id || user.email === wantedItem.requester.email);

  const getUrgencyBadge = (val) => {
    switch ((val || '').toLowerCase()) {
      case 'high':
        return <Badge variant="danger">HIGH URGENCY</Badge>;
      case 'medium':
        return <Badge variant="warning">MEDIUM URGENCY</Badge>;
      case 'low':
      default:
        return <Badge variant="info">LOW URGENCY</Badge>;
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '4rem' }}>
      {/* Back Link */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/wanted"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--color-slate-600)',
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: 600,
            transition: 'color 0.15s ease'
          }}
          className="back-wanted-link"
        >
          <ArrowLeft size={16} />
          <span>Back to Wanted Items</span>
        </Link>
      </div>

      {/* Main Detail Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.5fr 1fr',
          gap: '2rem',
          alignItems: 'start'
        }}
        className="wanted-detail-grid"
      >
        {/* Left Column: Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card style={{ padding: '2rem' }}>
            {/* Header Badges */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Badge variant="success">
                  {wantedItem.status || 'ACTIVE'}
                </Badge>
                <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--color-primary-700)', textTransform: 'capitalize' }}>
                  {wantedItem.category}
                </span>
                {wantedItem.subcategory && (
                  <span style={{ fontSize: '0.825rem', color: 'var(--color-slate-500)' }}>
                    • {wantedItem.subcategory}
                  </span>
                )}
              </div>

              {getUrgencyBadge(wantedItem.urgency)}
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
                fontWeight: 900,
                color: 'var(--color-slate-900)',
                margin: '0 0 1rem 0',
                lineHeight: 1.25
              }}
            >
              {wantedItem.title}
            </h1>

            {/* Optional Image */}
            {wantedItem.images && wantedItem.images.length > 0 && (
              <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '1.5rem', maxHeight: '320px', border: '1px solid var(--color-slate-200)' }}>
                <img
                  src={typeof wantedItem.images[0] === 'string' ? wantedItem.images[0] : wantedItem.images[0]?.url}
                  alt={wantedItem.title}
                  style={{ width: '100%', height: '280px', objectFit: 'cover', display: 'block' }}
                />
              </div>
            )}

            {/* Description */}
            <div style={{ marginBottom: '1.75rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-slate-900)', marginBottom: '0.5rem' }}>
                Description
              </h3>
              <p style={{ color: 'var(--color-slate-700)', fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-line', margin: 0 }}>
                {wantedItem.description}
              </p>
            </div>

            {/* Details Pills Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1rem',
                backgroundColor: '#f8fafc',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-slate-200)',
                marginBottom: '1.5rem'
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Preferred Sharing
                </div>
                <div style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--color-slate-800)', marginTop: '2px', textTransform: 'capitalize' }}>
                  {(wantedItem.preferredSharingType || 'any').replace('_', ' ')}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Condition
                </div>
                <div style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--color-slate-800)', marginTop: '2px', textTransform: 'capitalize' }}>
                  {(wantedItem.conditionPreference || 'any').replace('_', ' ')}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Quantity
                </div>
                <div style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--color-slate-800)', marginTop: '2px' }}>
                  {wantedItem.quantity || 1}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Location
                </div>
                <div style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--color-slate-800)', marginTop: '2px' }}>
                  {wantedItem.location?.locality ? `${wantedItem.location.locality}, ` : ''}{wantedItem.location?.city || wantedItem.location || 'Bengaluru'}
                </div>
              </div>
            </div>

            {/* Dates Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.825rem', color: 'var(--color-slate-500)', borderTop: '1px solid var(--color-slate-100)', paddingTop: '1rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} />
                <span>Posted {new Date(wantedItem.createdAt).toLocaleDateString()}</span>
              </span>

              {wantedItem.requiredBy && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-primary-700)', fontWeight: 600 }}>
                  <Calendar size={14} />
                  <span>Needed by {new Date(wantedItem.requiredBy).toLocaleDateString()}</span>
                </span>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Requester & Action Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Requester Info */}
          <Card style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-slate-500)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 1rem 0' }}>
              Requested By
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
              <Avatar
                src={wantedItem.requester?.avatar || user?.avatar}
                name={wantedItem.requester?.name || user?.name || 'Requester'}
                size="lg"
              />
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-slate-900)' }}>
                  {wantedItem.requester?.name || user?.name || 'Community Member'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--color-primary-700)', fontWeight: 600, marginTop: '2px' }}>
                  <ShieldCheck size={13} />
                  <span>{wantedItem.requester?.trustScore || 98}% Verified Trust</span>
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-600)', margin: 0, lineHeight: 1.5 }}>
              Handover and communication will be coordinated through LOOOP with secure verification.
            </p>

            {isOwner ? (
              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--color-slate-100)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-slate-600)', marginBottom: '0.75rem' }}>
                  This is your wanted item request.
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  style={{ width: '100%', color: 'var(--color-danger)', borderColor: 'var(--color-danger-border, #fecaca)' }}
                  iconLeft={Trash2}
                  onClick={handleDelete}
                  loading={deleting}
                >
                  Close Request
                </Button>
              </div>
            ) : (
              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--color-slate-100)' }}>
                <Button
                  variant="primary"
                  size="lg"
                  style={{ width: '100%' }}
                  iconLeft={Sparkles}
                  onClick={() => {
                    if (!user) {
                      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
                    } else {
                      setOfferModalOpen(true);
                    }
                  }}
                >
                  I Can Help
                </Button>
              </div>
            )}
          </Card>

          {/* Community Info Card */}
          <Card style={{ padding: '1.5rem', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#065f46', fontWeight: 800, fontSize: '0.9rem', marginBottom: '6px' }}>
              <Sparkles size={16} />
              <span>Have this item?</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#047857', margin: 0, lineHeight: 1.5 }}>
              Click "I Can Help" to offer one of your available items. LOOOP ensures fair and secure community sharing.
            </p>
          </Card>
        </div>
      </div>

      {/* Real Potential Matches / Items That May Help Section */}
      {matches && matches.length > 0 && (
        <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--color-slate-900)', margin: 0 }}>
                Items That May Help ({matches.length})
              </h2>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: '#ecfdf5',
                  color: '#059669',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid #a7f3d0'
                }}
              >
                Community Matches
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-slate-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={14} color="#059669" />
              <span>Deterministic matching based on category, title, condition & location</span>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1.25rem'
            }}
          >
            {matches.map((match, idx) => {
              const item = match.item;
              if (!item) return null;
              const primaryImg =
                item.images && item.images.length > 0
                  ? typeof item.images[0] === 'string'
                    ? item.images[0]
                    : item.images[0].url
                  : 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=400&q=80';

              return (
                <div
                  key={match.matchId || item._id || idx}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: 'var(--radius-xl)',
                    border: '1.5px solid var(--color-slate-200)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                >
                  {/* Item Image */}
                  <div style={{ position: 'relative', height: '160px', backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
                    <img
                      src={primaryImg}
                      alt={item.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src =
                          'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                    {/* Relevance Badge */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        backgroundColor: match.score >= 70 ? '#059669' : '#2563eb',
                        color: '#ffffff',
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                      }}
                    >
                      {match.score}% Match Relevance
                    </div>
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '10px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-slate-900)', margin: '0 0 4px 0', lineHeight: 1.3 }}>
                        {item.title}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', textTransform: 'capitalize' }}>
                          {item.sharingType?.replace('_', ' ')}
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-slate-600)', backgroundColor: '#f8fafc', padding: '2px 8px', borderRadius: '4px' }}>
                          {item.condition?.replace('_', ' ')}
                        </span>
                        {match.distanceKm !== null && match.distanceKm !== undefined && (
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669' }}>
                            ~{match.distanceKm} km away
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Location */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', color: 'var(--color-slate-600)' }}>
                      <MapPin size={13} color="var(--color-primary-600)" />
                      <span>{item.location?.locality || item.location?.city || 'Local area'}</span>
                    </div>

                    {/* Match Reasons */}
                    {match.matchReasons && match.matchReasons.length > 0 && (
                      <div
                        style={{
                          backgroundColor: '#f8fafc',
                          borderRadius: 'var(--radius-md)',
                          padding: '8px 10px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}
                      >
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-slate-500)', letterSpacing: '0.04em' }}>
                          Why this matches:
                        </span>
                        {match.matchReasons.slice(0, 3).map((reason, rIdx) => (
                          <div key={rIdx} style={{ fontSize: '0.78rem', color: 'var(--color-slate-700)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ color: '#059669', fontWeight: 900 }}>✓</span>
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* View Item CTA */}
                    <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                      <Link
                        to={`/items/${item._id || item.id}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          width: '100%',
                          padding: '8px 14px',
                          backgroundColor: 'var(--color-primary-600, #059669)',
                          color: '#ffffff',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          textDecoration: 'none'
                        }}
                      >
                        <span>View Item & Request</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <OfferItemModal
        wantedItem={wantedItem}
        isOpen={offerModalOpen}
        onClose={() => setOfferModalOpen(false)}
      />

      <style>{`
        @media (max-width: 800px) {
          .wanted-detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default WantedItemDetailPage;
