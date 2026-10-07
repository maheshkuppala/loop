import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, HelpCircle, Menu, X, ArrowRight } from 'lucide-react';
import Button from '../common/Button';
import LooopLogo from '../common/LooopLogo';

export const Navbar = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.88)' : 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: isScrolled ? '1px solid rgba(226, 232, 240, 0.9)' : '1px solid transparent',
        boxShadow: isScrolled ? '0 4px 20px -2px rgba(15, 23, 42, 0.05)' : 'none',
        height: 'var(--header-height, 68px)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <div
        className="container"
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem'
        }}
      >
        {/* LOOOP Brand Mark */}
        <LooopLogo size="md" showTagline={true} linkTo="/" />

        {/* Desktop Primary Navigation */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '2rem',
            fontSize: '0.925rem',
            fontWeight: 500
          }}
          className="desktop-nav"
          aria-label="Main Navigation"
        >
          <Link
            to="/"
            style={{
              color: isActive('/') ? 'var(--color-primary-600)' : 'var(--color-slate-600)',
              fontWeight: isActive('/') ? 700 : 500,
              textDecoration: 'none',
              transition: 'color var(--transition-fast)',
              position: 'relative',
              padding: '6px 0'
            }}
            className="nav-link"
          >
            Home
            {isActive('/') && (
              <span
                style={{
                  position: 'absolute',
                  bottom: '0',
                  left: '0',
                  right: '0',
                  height: '2px',
                  backgroundColor: 'var(--color-primary-500)',
                  borderRadius: '2px'
                }}
              />
            )}
          </Link>

          <Link
            to="/browse"
            style={{
              color: isActive('/browse') ? 'var(--color-primary-600)' : 'var(--color-slate-600)',
              fontWeight: isActive('/browse') ? 700 : 500,
              textDecoration: 'none',
              transition: 'color var(--transition-fast)',
              position: 'relative',
              padding: '6px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
            className="nav-link"
          >
            <Search size={15} />
            <span>Browse</span>
            {isActive('/browse') && (
              <span
                style={{
                  position: 'absolute',
                  bottom: '0',
                  left: '0',
                  right: '0',
                  height: '2px',
                  backgroundColor: 'var(--color-primary-500)',
                  borderRadius: '2px'
                }}
              />
            )}
          </Link>

          <Link
            to="/how-it-works"
            style={{
              color: isActive('/how-it-works') ? 'var(--color-primary-600)' : 'var(--color-slate-600)',
              fontWeight: isActive('/how-it-works') ? 700 : 500,
              textDecoration: 'none',
              transition: 'color var(--transition-fast)',
              position: 'relative',
              padding: '6px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
            className="nav-link"
          >
            <HelpCircle size={15} />
            <span>How It Works</span>
            {isActive('/how-it-works') && (
              <span
                style={{
                  position: 'absolute',
                  bottom: '0',
                  left: '0',
                  right: '0',
                  height: '2px',
                  backgroundColor: 'var(--color-primary-500)',
                  borderRadius: '2px'
                }}
              />
            )}
          </Link>

          <Link
            to="/about"
            style={{
              color: isActive('/about') ? 'var(--color-primary-600)' : 'var(--color-slate-600)',
              fontWeight: isActive('/about') ? 700 : 500,
              textDecoration: 'none',
              transition: 'color var(--transition-fast)',
              position: 'relative',
              padding: '6px 0'
            }}
            className="nav-link"
          >
            About
            {isActive('/about') && (
              <span
                style={{
                  position: 'absolute',
                  bottom: '0',
                  left: '0',
                  right: '0',
                  height: '2px',
                  backgroundColor: 'var(--color-primary-500)',
                  borderRadius: '2px'
                }}
              />
            )}
          </Link>
        </nav>

        {/* Right Section: Auth Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <Button variant="ghost" size="sm">
              Login
            </Button>
          </Link>

          <Link to="/login" style={{ textDecoration: 'none' }}>
            <Button variant="primary" size="sm" iconRight={ArrowRight}>
              Get Started
            </Button>
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-toggle-btn"
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-slate-700)',
              padding: '6px',
              borderRadius: 'var(--radius-sm)'
            }}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderBottom: '1px solid var(--color-slate-200)',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.1rem',
            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.1)',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              color: isActive('/') ? 'var(--color-primary-600)' : 'var(--color-slate-800)',
              fontWeight: 600,
              textDecoration: 'none',
              fontSize: '1rem'
            }}
          >
            Home
          </Link>
          <Link
            to="/browse"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              color: isActive('/browse') ? 'var(--color-primary-600)' : 'var(--color-slate-800)',
              fontWeight: 600,
              textDecoration: 'none',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Search size={16} />
            <span>Browse Items</span>
          </Link>
          <Link
            to="/how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              color: isActive('/how-it-works') ? 'var(--color-primary-600)' : 'var(--color-slate-800)',
              fontWeight: 600,
              textDecoration: 'none',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <HelpCircle size={16} />
            <span>How It Works</span>
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              color: isActive('/about') ? 'var(--color-primary-600)' : 'var(--color-slate-800)',
              fontWeight: 600,
              textDecoration: 'none',
              fontSize: '1rem'
            }}
          >
            About LOOOP
          </Link>

          <hr style={{ borderColor: 'var(--color-slate-100)', margin: '4px 0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: 'none' }}>
              <Button variant="secondary" size="sm" style={{ width: '100%' }}>
                Login
              </Button>
            </Link>
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: 'none' }}>
              <Button variant="primary" size="sm" style={{ width: '100%' }} iconRight={ArrowRight}>
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Media Query Styles */}
      <style>{`
        @media (min-width: 960px) {
          .desktop-nav { display: flex !important; }
          .mobile-toggle-btn { display: none !important; }
        }
        @media (max-width: 959px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle-btn { display: block !important; }
        }
        .nav-link:hover {
          color: var(--color-primary-600) !important;
        }
      `}</style>
    </header>
  );
};

export default Navbar;
