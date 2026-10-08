import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthPromptModal from '../../components/common/AuthPromptModal';
import {
  Sparkles,
  ArrowRight,
  RefreshCw,
  Gift,
  Clock,
  Repeat,
  ShieldCheck,
  Heart,
  TrendingUp,
  Package,
  CheckCircle2,
  Users,
  Search,
  MapPin,
  MessageSquare,
  Bookmark,
  Bell,
  Award,
  Zap,
  BookOpen,
  Laptop,
  Shirt,
  Wrench,
  ChevronRight,
  Key,
  Armchair,
  Gamepad2,
  Trophy,
  Utensils,
  GraduationCap,
  Tv,
  Glasses
} from 'lucide-react';

// 3D Utility Components
import LooopHeroCanvas from '../../components/3d/LooopHeroCanvas';
import TiltCard from '../../components/3d/TiltCard';
import FloatingParticles from '../../components/3d/FloatingParticles';
import LoopOrbit from '../../components/3d/LoopOrbit';
import AnimatedCounter from '../../components/3d/AnimatedCounter';

import ItemCard from '../../components/common/ItemCard';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import { mockItems, mockCommunityImpact, mockCategories } from '../../data/mockData';

// 11 Category Showcase Items
const CATEGORY_SHOWCASE = [
  { id: 'clothes', name: 'Clothing', icon: Shirt, count: '180+ items', desc: 'Apparel, jackets & footwear' },
  { id: 'books', name: 'Books', icon: BookOpen, count: '240+ items', desc: 'Academic, novels & comics' },
  { id: 'furniture', name: 'Furniture', icon: Armchair, count: '95+ items', desc: 'Chairs, desks & decor' },
  { id: 'electronics', name: 'Electronics', icon: Laptop, count: '310+ items', desc: 'Gadgets, audio & peripherals' },
  { id: 'kitchen', name: 'Home & Kitchen', icon: Utensils, count: '150+ items', desc: 'Cookware & home essentials' },
  { id: 'toys', name: 'Toys & Games', icon: Gamepad2, count: '120+ items', desc: 'Board games & puzzles' },
  { id: 'sports', name: 'Sports', icon: Trophy, count: '110+ items', desc: 'Fitness gear & outdoor' },
  { id: 'education', name: 'Study Materials', icon: GraduationCap, count: '420+ items', desc: 'Calculators & stationery' },
  { id: 'appliances', name: 'Appliances', icon: Tv, count: '85+ items', desc: 'Lamps & small appliances' },
  { id: 'accessories', name: 'Accessories', icon: Glasses, count: '140+ items', desc: 'Bags, watches & fashion' },
  { id: 'tools', name: 'Tools', icon: Wrench, count: '90+ items', desc: 'DIY kits & hardware' }
];

export const LandingPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [zoomingCategoryId, setZoomingCategoryId] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const isLoggedIn = !!(user && (isAuthenticated || user.id || user.email));

  // Global subtle mouse parallax tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleShareClick = () => {
    if (isLoggedIn) {
      navigate('/share');
    } else {
      setShowAuthModal(true);
    }
  };

  const handleCategoryClick = (catId) => {
    setZoomingCategoryId(catId);
    // Smooth zoom transition delay before navigating
    setTimeout(() => {
      navigate(`/browse?category=${catId}`);
    }, 380);
  };

  const filteredItems = selectedCategory === 'all'
    ? mockItems.slice(0, 6)
    : mockItems.filter(item => item.category === selectedCategory).slice(0, 6);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        overflowX: 'hidden',
        backgroundColor: 'var(--color-bg-main, #f8fafc)',
        color: '#0f172a',
        position: 'relative'
      }}
    >
      {/* Background Dimming Overlay during Zoom Transition */}
      {zoomingCategoryId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
            zIndex: 90,
            transition: 'opacity 0.3s ease'
          }}
        />
      )}

      {/* =========================================================================
          1. HERO SECTION (3D Stage, Parallax, Floating Product System)
          ========================================================================= */}
      <section
        style={{
          position: 'relative',
          paddingTop: '4rem',
          paddingBottom: '6rem',
          overflow: 'hidden',
          background: 'radial-gradient(ellipse 100% 80% at 50% -20%, rgba(16, 185, 129, 0.14), rgba(248, 250, 252, 0.6) 50%, var(--color-bg-main, #f8fafc) 100%)'
        }}
        aria-label="Hero Section"
      >
        {/* Floating Green Mint Ambient Particles */}
        <FloatingParticles count={35} color="#10b981" />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              alignItems: 'center',
              gap: '3rem'
            }}
          >
            {/* Left: Headline, Messaging & Parallax movement */}
            <div
              style={{
                transform: `translate3d(${mousePos.x * -8}px, ${mousePos.y * -8}px, 0)`,
                transition: 'transform 0.2s ease-out'
              }}
            >
              {/* Product Category Badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 16px',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: 'var(--radius-full, 9999px)',
                  color: '#047857',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  marginBottom: '1.5rem',
                  letterSpacing: '0.02em',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.12)'
                }}
              >
                <Sparkles size={16} color="#10b981" />
                <span>LOOOP · 3D Community Item Sharing Platform</span>
              </div>

              {/* Main Headline */}
              <h1
                style={{
                  fontSize: 'clamp(2.75rem, 5.8vw, 4.5rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.035em',
                  lineHeight: 1.08,
                  marginBottom: '1.25rem',
                  color: '#0f172a'
                }}
              >
                GIVE UNUSED THINGS{' '}
                <span
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  A NEW LIFE.
                </span>
              </h1>

              {/* Sub-Headline */}
              <p
                style={{
                  fontSize: 'clamp(1.1rem, 2vw, 1.3rem)',
                  color: '#475569',
                  lineHeight: 1.6,
                  marginBottom: '2.25rem',
                  maxWidth: '560px',
                  fontWeight: 500
                }}
              >
                Share what you no longer need. Find what someone else can reuse. Give away, lend, borrow, and swap everyday items with verified neighbors.
              </p>

              {/* Primary Dual Call-To-Action */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  flexWrap: 'wrap',
                  marginBottom: '2.75rem'
                }}
              >
                <Button
                  variant="primary"
                  size="lg"
                  iconLeft={Gift}
                  onClick={handleShareClick}
                  style={{
                    boxShadow: '0 12px 24px -6px rgba(16, 185, 129, 0.4)',
                    padding: '14px 28px',
                    fontSize: '1rem',
                    fontWeight: 700
                  }}
                >
                  SHARE SOMETHING
                </Button>

                <Link to="/browse" style={{ textDecoration: 'none' }}>
                  <Button
                    variant="outline"
                    size="lg"
                    iconRight={ArrowRight}
                    style={{
                      border: '2px solid #10b981',
                      color: '#047857',
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(8px)',
                      padding: '14px 28px',
                      fontSize: '1rem',
                      fontWeight: 700
                    }}
                  >
                    FIND SOMETHING
                  </Button>
                </Link>
              </div>

              {/* Verified Trust Badges */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '1.75rem',
                  fontSize: '0.875rem',
                  color: '#475569'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={18} color="#10b981" />
                  <span style={{ fontWeight: 600 }}>100% Non-Commercial</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={18} color="#10b981" />
                  <span style={{ fontWeight: 600 }}>Verified Peer Trust</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Key size={18} color="#10b981" />
                  <span style={{ fontWeight: 600 }}>Safe Handover Codes</span>
                </div>
              </div>
            </div>

            {/* Right: 3D Stage + Floating 3D Product Cards */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '480px',
                transform: `translate3d(${mousePos.x * 12}px, ${mousePos.y * 12}px, 0)`,
                transition: 'transform 0.2s ease-out'
              }}
            >
              {/* Interactive 3D Torus Loop & 3D Floating Mesh Canvas */}
              <LooopHeroCanvas />

              {/* Floating Product Representation Card 1: Study Calculator (Top-Left) */}
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  left: '-15px',
                  backgroundColor: 'rgba(255, 255, 255, 0.92)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: 'var(--radius-lg, 16px)',
                  padding: '12px 16px',
                  boxShadow: '0 15px 35px -5px rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  maxWidth: '240px',
                  zIndex: 3,
                  animation: 'floatSlow 4s ease-in-out infinite',
                  transform: `translate3d(${mousePos.x * 8}px, ${mousePos.y * 8}px, 0)`
                }}
                className="hero-floating-card"
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(59, 130, 246, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#2563eb',
                    flexShrink: 0
                  }}
                >
                  <Laptop size={20} />
                </div>
                <div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', display: 'block', lineHeight: 1.2 }}>
                    Casio Calculator
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 700 }}>
                    Borrow · Indiranagar
                  </span>
                </div>
              </div>

              {/* Floating Product Representation Card 2: Physics Textbook (Bottom-Left) */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '-10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.92)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: 'var(--radius-lg, 16px)',
                  padding: '12px 16px',
                  boxShadow: '0 15px 35px -5px rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  maxWidth: '240px',
                  zIndex: 3,
                  animation: 'floatSlow 4.8s ease-in-out infinite 0.9s',
                  transform: `translate3d(${mousePos.x * -10}px, ${mousePos.y * -10}px, 0)`
                }}
                className="hero-floating-card"
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#059669',
                    flexShrink: 0
                  }}
                >
                  <BookOpen size={20} />
                </div>
                <div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', display: 'block', lineHeight: 1.2 }}>
                    Calculus & Physics Set
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>
                    Give Away · HSR Layout
                  </span>
                </div>
              </div>

              {/* Floating Product Representation Card 3: Cordless Drill (Top-Right) */}
              <div
                style={{
                  position: 'absolute',
                  top: '15px',
                  right: '-10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.92)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: 'var(--radius-lg, 16px)',
                  padding: '12px 16px',
                  boxShadow: '0 15px 35px -5px rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  maxWidth: '230px',
                  zIndex: 3,
                  animation: 'floatSlow 5.2s ease-in-out infinite 1.4s',
                  transform: `translate3d(${mousePos.x * 6}px, ${mousePos.y * 6}px, 0)`
                }}
                className="hero-floating-card"
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(139, 92, 246, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#7c3aed',
                    flexShrink: 0
                  }}
                >
                  <Wrench size={20} />
                </div>
                <div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', display: 'block', lineHeight: 1.2 }}>
                    Bosch Cordless Drill
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#7c3aed', fontWeight: 700 }}>
                    Borrow · JP Nagar
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. 3D CATEGORY SHOWCASE SECTION (11 Categories, Glass, 3D Tilt & Zoom)
          ========================================================================= */}
      <section
        style={{
          padding: '6rem 0',
          backgroundColor: 'var(--color-bg-main, #f8fafc)',
          borderTop: '1px solid rgba(226, 232, 240, 0.8)',
          position: 'relative'
        }}
        aria-label="3D Category Showcase"
      >
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3.5rem auto' }}>
            <Badge variant="success" style={{ marginBottom: '0.75rem', padding: '6px 14px', fontSize: '0.85rem' }}>
              3D Interactive Catalog
            </Badge>
            <h2 style={{ fontSize: 'clamp(2.2rem, 4.2vw, 2.8rem)', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.03em' }}>
              Explore 3D Item Categories
            </h2>
            <p style={{ color: '#475569', fontSize: '1.1rem', lineHeight: 1.6 }}>
              Click any category card to zoom in and discover thousands of available items waiting in your neighborhood.
            </p>
          </div>

          {/* Grid of 11 Category Showcase Cards with 3D Tilt */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.5rem'
            }}
          >
            {CATEGORY_SHOWCASE.map((cat) => {
              const Icon = cat.icon;
              const isZooming = zoomingCategoryId === cat.id;
              return (
                <TiltCard
                  key={cat.id}
                  maxTilt={14}
                  scale={1.04}
                  isZooming={isZooming}
                  onClick={() => handleCategoryClick(cat.id)}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    borderRadius: 'var(--radius-xl, 20px)',
                    padding: '1.75rem 1.5rem',
                    boxShadow: '0 10px 30px -5px rgba(16, 185, 129, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div>
                    {/* Top row: Icon & Item Count Pill */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                      <div
                        style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '16px',
                          backgroundColor: `${cat.color}18`,
                          color: cat.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: `0 8px 16px -4px ${cat.color}33`
                        }}
                      >
                        <Icon size={26} />
                      </div>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: '#047857',
                          backgroundColor: 'rgba(16, 185, 129, 0.12)',
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-full, 9999px)',
                          border: '1px solid rgba(16, 185, 129, 0.25)'
                        }}
                      >
                        {cat.count}
                      </span>
                    </div>

                    {/* Category Title & Description */}
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
                      {cat.name}
                    </h3>
                    <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                      {cat.desc}
                    </p>
                  </div>

                  {/* Bottom Action Hint */}
                  <div
                    style={{
                      marginTop: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: cat.color,
                      fontSize: '0.85rem',
                      fontWeight: 700
                    }}
                  >
                    <span>Explore Items</span>
                    <ChevronRight size={16} />
                  </div>
                </TiltCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. "HOW LOOOP WORKS" 3D JOURNEY & ORBIT (01 SHARE → 02 DISCOVER → 03 CONNECT → 04 REUSE)
          ========================================================================= */}
      <section
        style={{
          padding: '6.5rem 0',
          backgroundColor: 'var(--color-bg-main, #f8fafc)',
          borderTop: '1px solid rgba(226, 232, 240, 0.8)',
          position: 'relative'
        }}
        aria-label="How LOOOP Works"
      >
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3.5rem auto' }}>
            <Badge variant="info" style={{ marginBottom: '0.75rem', padding: '6px 14px', fontSize: '0.85rem' }}>
              Interactive 3D Journey
            </Badge>
            <h2 style={{ fontSize: 'clamp(2.2rem, 4.2vw, 2.8rem)', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.03em' }}>
              How LOOOP Works
            </h2>
            <p style={{ color: '#475569', fontSize: '1.1rem', lineHeight: 1.6 }}>
              From listing an item in your cupboard to completing a verified handover with a neighbor.
            </p>
          </div>

          {/* 3D Journey Grid Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.75rem',
              marginBottom: '4rem'
            }}
          >
            {[
              {
                step: '01',
                title: 'SHARE',
                desc: 'List items you no longer use. Choose Give Away, Borrow, or Exchange with custom availability.',
                icon: Gift,
                color: '#10b981'
              },
              {
                step: '02',
                title: 'DISCOVER',
                desc: 'Search nearby items by distance, condition, and category. Inspect owner trust scores and ratings.',
                icon: Search,
                color: '#0d9488'
              },
              {
                step: '03',
                title: 'CONNECT',
                desc: 'Submit a request and coordinate handover details in secure in-app peer-to-peer chat.',
                icon: MessageSquare,
                color: '#0284c7'
              },
              {
                step: '04',
                title: 'REUSE',
                desc: 'Meet safely, swap secure 4-digit handover codes (LP-XXXX), return on schedule, and leave trust reviews.',
                icon: RefreshCw,
                color: '#f59e0b'
              }
            ].map((st) => {
              const Icon = st.icon;
              return (
                <TiltCard
                  key={st.step}
                  maxTilt={10}
                  scale={1.03}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    borderRadius: 'var(--radius-xl, 20px)',
                    padding: '2rem 1.5rem',
                    boxShadow: '0 12px 30px -5px rgba(16, 185, 129, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%'
                  }}
                >
                  <div
                    style={{
                      fontSize: '2.5rem',
                      fontWeight: 900,
                      color: `${st.color}33`,
                      lineHeight: 1,
                      marginBottom: '1rem',
                      fontFamily: 'var(--font-brand, sans-serif)'
                    }}
                  >
                    {st.step}
                  </div>

                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '14px',
                      backgroundColor: `${st.color}18`,
                      color: st.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1.25rem'
                    }}
                  >
                    <Icon size={24} />
                  </div>

                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                    {st.title}
                  </h3>

                  <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                    {st.desc}
                  </p>
                </TiltCard>
              );
            })}
          </div>

          {/* CIRCULAR LOOP ORBIT ANIMATION COMPONENT */}
          <div style={{ marginTop: '2rem' }}>
            <LoopOrbit />
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. TRUST & VALUE SECTION ("WHY LOOOP EXISTS")
          ========================================================================= */}
      <section
        style={{
          padding: '6rem 0',
          backgroundColor: 'var(--color-bg-main, #f8fafc)',
          borderTop: '1px solid rgba(226, 232, 240, 0.8)'
        }}
      >
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3.5rem auto' }}>
            <Badge variant="success" style={{ marginBottom: '0.75rem', padding: '6px 14px', fontSize: '0.85rem' }}>
              Why LOOOP Exists
            </Badge>
            <h2 style={{ fontSize: 'clamp(2.2rem, 4.2vw, 2.8rem)', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.03em' }}>
              Too Many Useful Items Sit Idle
            </h2>
            <p style={{ color: '#475569', fontSize: '1.1rem', lineHeight: 1.65 }}>
              In every household, campus dorm, and apartment, thousands of working products sit in storage. LOOOP connects you with trustworthy people around you to keep those valuable items in active circulation.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.75rem'
            }}
          >
            {[
              {
                title: 'Share',
                desc: 'List functional items you no longer use so fellow students or neighbors can put them to good use.',
                icon: Gift,
                color: '#10b981',
                bg: 'rgba(16, 185, 129, 0.1)'
              },
              {
                title: 'Reuse',
                desc: 'Extend the lifespan of manufactured products. Keep working devices, tools, and books out of waste bins.',
                icon: RefreshCw,
                color: '#059669',
                bg: 'rgba(5, 150, 105, 0.1)'
              },
              {
                title: 'Borrow',
                desc: 'Need a camping rucksack for the weekend or a drill for 2 days? Borrow from someone nearby instead of buying new.',
                icon: Clock,
                color: '#0284c7',
                bg: 'rgba(2, 132, 199, 0.1)'
              },
              {
                title: 'Exchange',
                desc: 'Swap items value-for-value. Trade board games, tech peripherals, or novels directly with like-minded members.',
                icon: Repeat,
                color: '#f59e0b',
                bg: 'rgba(245, 158, 11, 0.1)'
              },
              {
                title: 'Give Away',
                desc: 'Completed an academic year or moving homes? Gift your items with zero hidden fees, ads, or middleman charges.',
                icon: Heart,
                color: '#ec4899',
                bg: 'rgba(236, 72, 153, 0.1)'
              },
              {
                title: 'Connect',
                desc: 'Foster genuine local community relationships built on mutual respect, verified ratings, and transparent trust scores.',
                icon: Users,
                color: '#8b5cf6',
                bg: 'rgba(139, 92, 246, 0.1)'
              }
            ].map((pillar) => {
              const Icon = pillar.icon;
              return (
                <TiltCard
                  key={pillar.title}
                  maxTilt={8}
                  scale={1.02}
                  style={{
                    padding: '1.75rem 1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem',
                    backgroundColor: '#ffffff',
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                    borderRadius: 'var(--radius-xl, 20px)',
                    boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.04)'
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '14px',
                      backgroundColor: pillar.bg,
                      color: pillar.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Icon size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                    {pillar.title}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                    {pillar.desc}
                  </p>
                </TiltCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. INTERACTIVE IMPACT SECTION (Viewport Animated Counting)
          ========================================================================= */}
      <section
        style={{
          padding: '6.5rem 0',
          background: 'linear-gradient(135deg, #064e3b 0%, #0f172a 100%)',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden'
        }}
        aria-label="Environmental and Community Impact"
      >
        <FloatingParticles count={30} color="#a7f3d0" />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 4rem auto' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 16px',
                backgroundColor: 'rgba(16, 185, 129, 0.25)',
                borderRadius: 'var(--radius-full, 9999px)',
                color: '#a7f3d0',
                fontSize: '0.82rem',
                fontWeight: 700,
                marginBottom: '1.25rem',
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}
            >
              <Sparkles size={16} />
              <span>Real-Time Environmental & Community Impact</span>
            </span>
            <h2 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3rem)', fontWeight: 900, color: '#ffffff', marginBottom: '1rem', letterSpacing: '-0.03em' }}>
              Reducing Waste Through Circular Reuse
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '1.1rem', lineHeight: 1.65 }}>
              Every item borrowed or gifted on LOOOP represents one less product manufactured, packaged in single-use plastic, or sent to a landfill.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '2rem',
              textAlign: 'center'
            }}
          >
            {[
              { label: 'Products Shared', value: '1,275+', icon: Gift, desc: 'Items uploaded by members' },
              { label: 'Products Reused', value: '850+', icon: RefreshCw, desc: 'Active items in circulating use' },
              { label: 'Active Members', value: '1,420+', icon: Users, desc: 'Verified campus & neighborhood users' },
              { label: 'Waste Avoided', value: '3,840 kg', icon: TrendingUp, desc: 'Solid waste kept out of landfills' }
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <TiltCard
                  key={i}
                  maxTilt={10}
                  scale={1.03}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: 'var(--radius-xl, 20px)',
                    padding: '2.25rem 1.5rem',
                    backdropFilter: 'blur(12px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(16, 185, 129, 0.25)',
                      color: '#a7f3d0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1.25rem'
                    }}
                  >
                    <Icon size={24} />
                  </div>

                  <div
                    style={{
                      fontSize: 'clamp(2.2rem, 3.5vw, 2.8rem)',
                      fontWeight: 900,
                      fontFamily: 'var(--font-brand, sans-serif)',
                      color: '#ffffff',
                      marginBottom: '0.35rem',
                      lineHeight: 1.1
                    }}
                  >
                    <AnimatedCounter value={stat.value} duration={2200} />
                  </div>

                  <div style={{ fontSize: '1rem', color: '#a7f3d0', fontWeight: 700, marginBottom: '0.35rem' }}>
                    {stat.label}
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    {stat.desc}
                  </div>
                </TiltCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. FEATURED CATALOG ITEMS SECTION
          ========================================================================= */}
      <section style={{ padding: '6rem 0', backgroundColor: 'var(--color-bg-main, #f8fafc)', borderTop: '1px solid rgba(226, 232, 240, 0.8)' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginBottom: '2.5rem',
              gap: '1.25rem'
            }}
          >
            <div>
              <Badge variant="success" style={{ marginBottom: '0.5rem', padding: '6px 14px' }}>Community Catalog</Badge>
              <h2 style={{ fontSize: 'clamp(2rem, 3.8vw, 2.6rem)', fontWeight: 900, letterSpacing: '-0.03em' }}>
                Featured Available Items
              </h2>
              <p style={{ color: '#64748b', fontSize: '1.05rem' }}>
                Discover real items recently listed by verified members.
              </p>
            </div>
            <Link to="/browse" style={{ textDecoration: 'none' }}>
              <Button variant="outline" iconRight={ArrowRight} style={{ border: '2px solid #10b981', color: '#047857', fontWeight: 700 }}>
                View All Available Items
              </Button>
            </Link>
          </div>

          {/* Category Filter Pills */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              overflowX: 'auto',
              paddingBottom: '16px',
              marginBottom: '2rem',
              scrollbarWidth: 'none'
            }}
          >
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              style={{
                padding: '9px 20px',
                borderRadius: 'var(--radius-full, 9999px)',
                border: selectedCategory === 'all' ? '2px solid #10b981' : '1px solid #cbd5e1',
                backgroundColor: selectedCategory === 'all' ? 'rgba(16, 185, 129, 0.12)' : '#ffffff',
                color: selectedCategory === 'all' ? '#047857' : '#475569',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              All Categories
            </button>
            {mockCategories.slice(0, 7).map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '9px 20px',
                  borderRadius: 'var(--radius-full, 9999px)',
                  border: selectedCategory === cat.id ? '2px solid #10b981' : '1px solid #cbd5e1',
                  backgroundColor: selectedCategory === cat.id ? 'rgba(16, 185, 129, 0.12)' : '#ffffff',
                  color: selectedCategory === cat.id ? '#047857' : '#475569',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease'
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Reusable Item Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '24px'
            }}
          >
            {filteredItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. FINAL CALL TO ACTION (CTA SECTION)
          ========================================================================= */}
      <section
        style={{
          padding: '6.5rem 0',
          backgroundColor: 'var(--color-bg-main, #f8fafc)',
          borderTop: '1px solid rgba(226, 232, 240, 0.8)',
          position: 'relative',
          overflow: 'hidden'
        }}
        aria-label="Call to action"
      >
        <div
          className="container"
          style={{
            maxWidth: '960px',
            backgroundColor: '#0f172a',
            borderRadius: 'var(--radius-xl, 24px)',
            padding: '4.5rem 2rem',
            textAlign: 'center',
            color: '#ffffff',
            position: 'relative',
            boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.35)',
            background: 'radial-gradient(ellipse at 50% -10%, rgba(16, 185, 129, 0.3) 0%, #0f172a 75%)',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}
        >
          {/* Background Ambient Particles inside CTA box */}
          <FloatingParticles count={20} color="#34d399" />

          <div style={{ position: 'relative', zIndex: 2 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 16px',
                backgroundColor: 'rgba(16, 185, 129, 0.25)',
                borderRadius: 'var(--radius-full, 9999px)',
                color: '#34d399',
                fontSize: '0.82rem',
                fontWeight: 800,
                marginBottom: '1.5rem',
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}
            >
              Join the Circular Sharing Movement
            </span>

            <h2
              style={{
                fontSize: 'clamp(2.4rem, 4.8vw, 3.5rem)',
                fontWeight: 900,
                marginBottom: '1.25rem',
                letterSpacing: '-0.03em',
                color: '#ffffff',
                lineHeight: 1.12
              }}
            >
              Your unused things could be exactly what someone else needs.
            </h2>

            <p
              style={{
                color: '#cbd5e1',
                fontSize: '1.18rem',
                lineHeight: 1.65,
                marginBottom: '2.5rem',
                maxWidth: '640px',
                margin: '0 auto 2.5rem auto'
              }}
            >
              Join your local campus and neighborhood sharing circle. Start discovering useful items nearby or share something sitting in your closet in under a minute.
            </p>

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '1.25rem',
                flexWrap: 'wrap'
              }}
            >
              <Button
                variant="primary"
                size="lg"
                iconLeft={Gift}
                onClick={handleShareClick}
                style={{
                  boxShadow: '0 12px 24px -6px rgba(16, 185, 129, 0.5)',
                  padding: '14px 30px',
                  fontSize: '1rem',
                  fontWeight: 800
                }}
              >
                SHARE SOMETHING
              </Button>

              <Link to="/browse" style={{ textDecoration: 'none' }}>
                <Button
                  variant="outline"
                  size="lg"
                  iconRight={ArrowRight}
                  style={{
                    border: '2px solid #10b981',
                    color: '#ffffff',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(8px)',
                    padding: '14px 30px',
                    fontSize: '1rem',
                    fontWeight: 800
                  }}
                >
                  FIND SOMETHING
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Keyframes */}
      <style>{`
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @media (max-width: 640px) {
          .hero-floating-card {
            display: none !important;
          }
        }
      `}</style>

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Sign In or Create Account"
        actionTitle="Account Required to Share"
        actionDescription="To share an unused item with your community on LOOOP, please sign in or create a free account."
        redirectPath="/share"
      />
    </div>
  );
};

export default LandingPage;
