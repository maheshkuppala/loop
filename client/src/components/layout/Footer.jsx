import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, RefreshCw, ShieldCheck, Mail, Globe, Sparkles } from 'lucide-react';
import LooopLogo from '../common/LooopLogo';

export const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: 'var(--color-bg-main, #f8fafc)',
        borderTop: '1px solid var(--color-slate-200)',
        paddingTop: '4.5rem',
        paddingBottom: '2.5rem',
        marginTop: '0'
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '3rem',
            marginBottom: '3.5rem'
          }}
        >
          {/* Brand & Purpose Column */}
          <div style={{ maxWidth: '340px' }}>
            <div style={{ marginBottom: '1rem' }}>
              <LooopLogo size="md" showTagline={true} linkTo="/" />
            </div>
            <p
              style={{
                fontSize: '0.9rem',
                color: 'var(--color-slate-600)',
                lineHeight: 1.65,
                marginBottom: '1.25rem'
              }}
            >
              A modern community-based unused item sharing platform.
              Turn clutter into utility, borrow what you need, and keep useful items in the loop.
            </p>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.8rem',
                color: 'var(--color-primary-800)',
                backgroundColor: 'var(--color-primary-50)',
                border: '1px solid var(--color-primary-200)',
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: 600
              }}
            >
              <RefreshCw size={14} />
              <span>100% Non-Commercial Sharing</span>
            </div>
          </div>

          {/* Platform Navigation */}
          <div>
            <h4
              style={{
                fontSize: '0.85rem',
                fontWeight: 800,
                color: 'var(--color-slate-900)',
                marginBottom: '1.1rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase'
              }}
            >
              Explore
            </h4>
            <ul
              style={{
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                fontSize: '0.9rem',
                padding: 0,
                margin: 0
              }}
            >
              <li>
                <Link to="/" style={{ color: 'var(--color-slate-600)', textDecoration: 'none', transition: 'color 0.2s' }} className="footer-link">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/browse" style={{ color: 'var(--color-slate-600)', textDecoration: 'none', transition: 'color 0.2s' }} className="footer-link">
                  Browse Available Items
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" style={{ color: 'var(--color-slate-600)', textDecoration: 'none', transition: 'color 0.2s' }} className="footer-link">
                  How LOOOP Works
                </Link>
              </li>
              <li>
                <Link to="/about" style={{ color: 'var(--color-slate-600)', textDecoration: 'none', transition: 'color 0.2s' }} className="footer-link">
                  About the Mission
                </Link>
              </li>
            </ul>
          </div>

          {/* Account & Community Portals */}
          <div>
            <h4
              style={{
                fontSize: '0.85rem',
                fontWeight: 800,
                color: 'var(--color-slate-900)',
                marginBottom: '1.1rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase'
              }}
            >
              Account & Portals
            </h4>
            <ul
              style={{
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                fontSize: '0.9rem',
                padding: 0,
                margin: 0
              }}
            >
              <li>
                <Link to="/login" style={{ color: 'var(--color-slate-600)', textDecoration: 'none' }} className="footer-link">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" style={{ color: 'var(--color-slate-600)', textDecoration: 'none' }} className="footer-link">
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/customer/dashboard" style={{ color: 'var(--color-slate-600)', textDecoration: 'none' }} className="footer-link">
                  Customer Dashboard
                </Link>
              </li>
              <li>
                <Link to="/admin/dashboard" style={{ color: 'var(--color-slate-600)', textDecoration: 'none' }} className="footer-link">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Community Trust & Legal */}
          <div>
            <h4
              style={{
                fontSize: '0.85rem',
                fontWeight: 800,
                color: 'var(--color-slate-900)',
                marginBottom: '1.1rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase'
              }}
            >
              Trust & Safety
            </h4>
            <ul
              style={{
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                fontSize: '0.9rem',
                padding: 0,
                margin: 0
              }}
            >
              <li>
                <span style={{ color: 'var(--color-slate-500)', fontSize: '0.85rem' }}>
                  Peer Trust Scores & Handover Codes
                </span>
              </li>
              <li>
                <span style={{ color: 'var(--color-slate-500)', fontSize: '0.85rem' }}>
                  Zero Sales · Zero Commercial Ads
                </span>
              </li>
              <li>
                <span style={{ color: 'var(--color-slate-500)', fontSize: '0.85rem' }}>
                  Privacy & Data Protection
                </span>
              </li>
              <li>
                <span style={{ color: 'var(--color-slate-500)', fontSize: '0.85rem' }}>
                  Community Safety Guidelines
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid var(--color-slate-100)',
            paddingTop: '2rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.85rem',
            color: 'var(--color-slate-500)',
            gap: '1rem'
          }}
        >
          <div>
            © {new Date().getFullYear()} <strong>LOOOP</strong>. Share. Reuse. Connect. All rights reserved.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--color-slate-400)' }}>
              MERN Stack Architecture · Vite · React · Tailwind CSS · Express · MongoDB
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>Built for sustainable communities with</span>
              <Heart size={14} color="var(--color-danger)" fill="var(--color-danger)" />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .footer-link:hover {
          color: var(--color-primary-600) !important;
          padding-left: 2px;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
