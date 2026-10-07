import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, MapPin, Recycle, PlusCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthPromptModal from '../common/AuthPromptModal';

export const BrowseHeader = ({ userLocation = 'Indiranagar, Bengaluru', totalItems = 0 }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const isLoggedIn = !!(user && (isAuthenticated || user.id || user.email));

  const handleShareClick = (e) => {
    e.preventDefault();
    if (isLoggedIn) {
      navigate('/share');
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.75rem' }}>
      {/* 1. Page Title & Location Badge */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: 'clamp(1.75rem, 2.5vw, 2.25rem)', fontWeight: 900, color: 'var(--color-slate-900)', margin: 0, letterSpacing: '-0.02em' }}>
              Browse Items
            </h1>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#047857',
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)'
              }}
            >
              <Recycle size={13} />
              <span>Community Sharing</span>
            </span>
          </div>
          <p style={{ fontSize: '0.95rem', color: 'var(--color-slate-600)', margin: 0 }}>
            Discover useful things shared by people in your community.
          </p>
        </div>

        {/* Location Indicator & Quick Share CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#ffffff',
              border: '1px solid var(--color-slate-200)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
              fontSize: '0.825rem',
              color: 'var(--color-slate-700)',
              fontWeight: 600
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.2)'
              }}
            />
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={14} color="#059669" />
              <span>Showing items near {userLocation}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={handleShareClick}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#059669',
              color: '#ffffff',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.825rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)',
              transition: 'all var(--transition-fast)'
            }}
            className="browse-share-btn"
          >
            <PlusCircle size={15} />
            <span>Share an Item</span>
          </button>
        </div>
      </div>

      {/* Auth Prompt Modal when unauthenticated user attempts to Share an Item */}
      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Sign In or Create Account"
        actionTitle="Account Required to Share"
        actionDescription="To list and share an unused item with neighbors on LOOOP, please sign in or create a free account."
        redirectPath="/share"
      />

      {/* 2. Compact Discovery Banner ("Give unused things a second life") */}
      <div
        style={{
          position: 'relative',
          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.75rem',
          color: '#ffffff',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          boxShadow: '0 4px 14px rgba(6, 78, 59, 0.15)'
        }}
        className="discovery-banner"
      >
        <div
          style={{
            position: 'absolute',
            top: '-30px',
            right: '25%',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            border: '20px solid rgba(255, 255, 255, 0.04)',
            pointerEvents: 'none'
          }}
        />

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#a7f3d0', marginBottom: '4px' }}>
            <Sparkles size={13} />
            <span>Circular Neighborhood Economy</span>
          </div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 4px 0', color: '#ffffff' }}>
            Give unused things a second life.
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#d1fae5', margin: 0, maxWidth: '600px' }}>
            Find useful items nearby or discover something worth sharing. Every borrowed tool, book, or gadget keeps landfill waste down.
          </p>
        </div>

        {/* Floating pill indicators */}
        <div style={{ display: 'none', gap: '8px', zIndex: 2 }} className="banner-pills">
          <span style={{ fontSize: '0.72rem', backgroundColor: 'rgba(255,255,255,0.18)', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
            Zero Cost
          </span>
          <span style={{ fontSize: '0.72rem', backgroundColor: 'rgba(255,255,255,0.18)', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
            Verified Handover
          </span>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .banner-pills {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
};

export default BrowseHeader;
