import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, HelpCircle, ArrowRight, Sparkles } from 'lucide-react';

export const QuickActionCards = () => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.25rem'
      }}
      className="quick-actions-grid"
    >
      {/* 1. Share an Item — Visually Emphasized Primary Action */}
      <Link
        to="/customer/share"
        style={{
          textDecoration: 'none',
          color: 'inherit'
        }}
        className="quick-action-link"
      >
        <div
          style={{
            position: 'relative',
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            color: '#ffffff',
            boxShadow: '0 8px 20px rgba(16, 185, 129, 0.25)',
            transition: 'all 0.25s ease',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflow: 'hidden'
          }}
          className="quick-action-card-primary"
        >
          {/* Subtle Background Glow Accent */}
          <div
            style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              pointerEvents: 'none'
            }}
          />

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}
              >
                <PlusCircle size={24} />
              </div>
              <span
                style={{
                  fontSize: '0.725rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  backgroundColor: 'rgba(255, 255, 255, 0.22)',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Sparkles size={11} />
                <span>Featured Action</span>
              </span>
            </div>

            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.35rem', color: '#ffffff' }}>
              Share an Item
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#ecfdf5', lineHeight: 1.5, margin: 0 }}>
              Give away, lend, or swap books, tools, electronics, or study gear with neighbors.
            </p>
          </div>

          <div
            style={{
              marginTop: '1.25rem',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontWeight: 700,
              fontSize: '0.875rem'
            }}
          >
            <span>Start Sharing</span>
            <ArrowRight size={16} />
          </div>
        </div>
      </Link>

      {/* 2. Browse Items */}
      <Link
        to="/browse"
        style={{
          textDecoration: 'none',
          color: 'inherit'
        }}
        className="quick-action-link"
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            border: '1px solid var(--color-slate-200)',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
            transition: 'all 0.25s ease',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
          className="quick-action-card-standard"
        >
          <div>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-primary-50)',
                color: 'var(--color-primary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}
            >
              <Search size={24} />
            </div>

            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.35rem', color: 'var(--color-slate-900)' }}>
              Browse Items
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-600)', lineHeight: 1.5, margin: 0 }}>
              Discover free items, lendable tools, books, and exchange listings nearby.
            </p>
          </div>

          <div
            style={{
              marginTop: '1.25rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--color-slate-100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: 'var(--color-primary-700)',
              fontWeight: 700,
              fontSize: '0.875rem'
            }}
          >
            <span>Explore Community Listings</span>
            <ArrowRight size={16} />
          </div>
        </div>
      </Link>

      {/* 3. Create Wanted Request */}
      <Link
        to="/customer/wanted"
        style={{
          textDecoration: 'none',
          color: 'inherit'
        }}
        className="quick-action-link"
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            border: '1px solid var(--color-slate-200)',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
            transition: 'all 0.25s ease',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
          className="quick-action-card-standard"
        >
          <div>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}
            >
              <HelpCircle size={24} />
            </div>

            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.35rem', color: 'var(--color-slate-900)' }}>
              Create Wanted Request
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-600)', lineHeight: 1.5, margin: 0 }}>
              Can't find what you need? Post a request and receive automatic smart matches.
            </p>
          </div>

          <div
            style={{
              marginTop: '1.25rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--color-slate-100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#2563eb',
              fontWeight: 700,
              fontSize: '0.875rem'
            }}
          >
            <span>Post What You Need</span>
            <ArrowRight size={16} />
          </div>
        </div>
      </Link>

      <style>{`
        .quick-action-card-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 28px rgba(16, 185, 129, 0.35) !important;
        }
        .quick-action-card-standard:hover {
          transform: translateY(-3px);
          border-color: var(--color-slate-300) !important;
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08) !important;
        }
      `}</style>
    </div>
  );
};

export default QuickActionCards;
