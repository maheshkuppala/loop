import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, MapPin, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Button from '../common/Button';

export const WantedPreviewSection = ({ wantedItems }) => {
  const safeWantedItems = Array.isArray(wantedItems)
    ? wantedItems
    : Array.isArray(wantedItems?.wantedItems)
    ? wantedItems.wantedItems
    : Array.isArray(wantedItems?.items)
    ? wantedItems.items
    : [];

  const formatLoc = (loc) => {
    if (!loc) return 'Nearby';
    if (typeof loc === 'string') return loc;
    if (typeof loc === 'object') {
      return [loc.locality, loc.city, loc.state].filter(Boolean).join(', ') || 'Nearby';
    }
    return 'Nearby';
  };

  if (!safeWantedItems.length) {
    return null;
  }

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-slate-200)',
        padding: '1.75rem',
        boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)'
      }}
      className="wanted-preview-container"
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <HelpCircle size={17} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-slate-900)', margin: 0 }}>
              Someone Nearby May Need What You Have
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-500)', margin: '4px 0 0 0' }}>
            Unused items lying around your room or garage could help a neighbor in need
          </p>
        </div>

        <Link
          to="/customer/wanted"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.85rem',
            color: '#2563eb',
            fontWeight: 700,
            textDecoration: 'none'
          }}
          className="see-all-wanted-link"
        >
          <span>View All Wanted Requests</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Wanted Items Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem'
        }}
        className="wanted-cards-grid"
      >
        {safeWantedItems.slice(0, 3).map((wanted) => (
          <div
            key={wanted._id || wanted.id}
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid var(--color-slate-200)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all var(--transition-fast)'
            }}
            className="wanted-preview-card"
          >
            <div>
              {/* Header: Tag & Match */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#2563eb',
                    backgroundColor: '#dbeafe',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-xs)'
                  }}
                >
                  Wanted
                </span>
                {wanted.matchScore && (
                  <span
                    style={{
                      fontSize: '0.725rem',
                      fontWeight: 700,
                      color: '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}
                  >
                    <Sparkles size={12} />
                    <span>{wanted.matchScore}% Match</span>
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-slate-900)', marginBottom: '6px', lineHeight: 1.3 }}>
                {wanted.title}
              </h3>

              {/* Needed For Description */}
              <p style={{ fontSize: '0.825rem', color: 'var(--color-slate-600)', lineHeight: 1.45, margin: '0 0 10px 0' }}>
                <span style={{ fontWeight: 600, color: 'var(--color-slate-700)' }}>Needed for: </span>
                {wanted.description}
              </p>

              {/* Location */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--color-slate-500)', marginBottom: '12px' }}>
                <MapPin size={13} color="var(--color-slate-400)" />
                <span>{formatLoc(wanted.location)}</span>
              </div>
            </div>

            {/* Requester & Action */}
            <div
              style={{
                paddingTop: '10px',
                borderTop: '1px solid var(--color-slate-200)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Avatar src={wanted.postedBy?.avatar} name={wanted.postedBy?.name} size="xs" />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-slate-700)' }}>
                  {wanted.postedBy?.name?.split(' ')?.[0] || 'Neighbor'}
                </span>
              </div>

              <Link to="/customer/wanted" style={{ textDecoration: 'none' }}>
                <Button variant="outline" size="xs">
                  Offer Item
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .wanted-preview-card:hover {
          transform: translateY(-2px);
          border-color: #93c5fd !important;
          box-shadow: 0 6px 14px rgba(37, 99, 235, 0.08);
          background-color: #ffffff !important;
        }
        .see-all-wanted-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default WantedPreviewSection;
