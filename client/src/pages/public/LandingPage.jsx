import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthPromptModal from '../../components/common/AuthPromptModal';
import impactService from '../../services/impactService';
import { getLiveImpactMetrics, saveLiveImpactMetrics } from '../../utils/communityImpactTracker';
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
  Key
} from 'lucide-react';
import LooopHeroCanvas from '../../components/3d/LooopHeroCanvas';
import ItemCard from '../../components/common/ItemCard';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import { mockItems, mockCommunityImpact, mockCategories } from '../../data/mockData';

export const LandingPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [liveImpact, setLiveImpact] = useState(getLiveImpactMetrics());
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Initial load from tracker (defaults to 0)
    setLiveImpact(getLiveImpactMetrics());

    // Sync from platform API if available
    impactService.getImpactSummary().then((res) => {
      if (res?.success && res?.summary) {
        const s = res.summary;
        const current = getLiveImpactMetrics();
        if (s.totalItemsReused || s.totalCompletedTransactions) {
          const updated = {
            itemsReused: Math.max(current.itemsReused, s.totalItemsReused || 0),
            peopleHelped: Math.max(current.peopleHelped, s.totalCompletedTransactions || 0),
            booksShared: Math.max(
              current.booksShared,
              s.categoryBreakdown?.find((c) => (c.category || '').toLowerCase().includes('book'))?.itemsReused || 0
            ),
            electronicsShared: Math.max(
              current.electronicsShared,
              s.categoryBreakdown?.find((c) => (c.category || '').toLowerCase().includes('electronic'))?.itemsReused || 0
            ),
            wasteAvoidedKg: Math.max(
              current.wasteAvoidedKg,
              Math.round(s.environmentalMetrics?.wasteAvoided || 0)
            )
          };
          saveLiveImpactMetrics(updated);
          setLiveImpact(updated);
        }
      }
    }).catch(() => {});

    // Listen to live community actions (shares, handovers, reuse)
    const handleImpactUpdate = (e) => {
      if (e?.detail) {
        setLiveImpact(e.detail);
      } else {
        setLiveImpact(getLiveImpactMetrics());
      }
    };

    window.addEventListener('looop:impact_updated', handleImpactUpdate);
    window.addEventListener('storage', handleImpactUpdate);

    return () => {
      window.removeEventListener('looop:impact_updated', handleImpactUpdate);
      window.removeEventListener('storage', handleImpactUpdate);
    };
  }, []);

  const isLoggedIn = !!(user && (isAuthenticated || user.id || user.email));

  const handleShareClick = () => {
    if (isLoggedIn) {
      navigate('/share');
    } else {
      setShowAuthModal(true);
    }
  };

  const filteredItems = selectedCategory === 'all'
    ? mockItems.slice(0, 6)
    : mockItems.filter(item => item.category === selectedCategory).slice(0, 6);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', overflowX: 'hidden' }}>
      {/* =========================================================================
          1. HERO SECTION
          ========================================================================= */}
      <section
        style={{
          position: 'relative',
          paddingTop: '3.5rem',
          paddingBottom: '5rem',
          overflow: 'hidden',
          background: 'radial-gradient(ellipse 80% 60% at 50% -15%, rgba(16, 185, 129, 0.18), rgba(240, 253, 250, 0.4) 60%, transparent)'
        }}
        aria-label="Hero Section"
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              alignItems: 'center',
              gap: '3rem'
            }}
          >
            {/* Left: Headline & Messaging */}
            <div>
              {/* Product Category Tag */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 14px',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: 'var(--radius-full)',
                  color: 'var(--color-primary-800)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  marginBottom: '1.25rem',
                  letterSpacing: '0.01em'
                }}
              >
                <Sparkles size={16} color="var(--color-primary-600)" />
                <span>LOOOP · Community Unused-Item Sharing Platform</span>
              </div>

              {/* Main Headline */}
              <h1
                style={{
                  fontSize: 'clamp(2.6rem, 5.5vw, 4.25rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.035em',
                  lineHeight: 1.1,
                  marginBottom: '1.25rem',
                  color: 'var(--color-slate-900)'
                }}
              >
                Share. Reuse.{' '}
                <span
                  style={{
                    background: 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #047857 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  Connect.
                </span>
              </h1>

              {/* Sub-Headline & Supporting Message */}
              <p
                style={{
                  fontSize: 'clamp(1.1rem, 2vw, 1.25rem)',
                  color: 'var(--color-slate-600)',
                  lineHeight: 1.65,
                  marginBottom: '2rem',
                  maxWidth: '560px'
                }}
              >
                An unused item in your cupboard can become useful to someone else.
                Give away, lend, borrow, and exchange study gear, electronics, and tools with trustworthy neighbors in your local community.
              </p>

              {/* Primary Dual Call-To-Action */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap',
                  marginBottom: '2.5rem'
                }}
              >
                <Link to="/browse" style={{ textDecoration: 'none' }}>
                  <Button
                    variant="outline"
                    size="lg"
                    iconRight={ArrowRight}
                    className="browse-hover-highlight-btn"
                  >
                    Browse Items
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  size="lg"
                  iconLeft={Gift}
                  onClick={handleShareClick}
                  style={{
                    backgroundColor: '#ecfdf5',
                    borderColor: 'var(--color-primary-500)',
                    borderWidth: '2px',
                    color: 'var(--color-primary-700)',
                    fontWeight: 700,
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.22)',
                    transition: 'all 0.25s ease'
                  }}
                  className="highlighted-share-btn"
                >
                  Share an Item
                </Button>
              </div>

              {/* Verified Trust & Social Proof Badges */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '1.5rem',
                  fontSize: '0.875rem',
                  color: 'var(--color-slate-600)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} color="var(--color-primary-600)" />
                  <span style={{ fontWeight: 600 }}>100% Non-Commercial</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={16} color="var(--color-primary-600)" />
                  <span style={{ fontWeight: 600 }}>Verified Peer Trust</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Key size={16} color="var(--color-primary-600)" />
                  <span style={{ fontWeight: 600 }}>Safe Handover Codes</span>
                </div>
              </div>
            </div>

            {/* Right: 3D Loop Composition + Floating Everyday Object Cards */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '440px'
              }}
            >
              {/* Interactive 3D Torus Loop Canvas */}
              <LooopHeroCanvas />

              {/* Floating Item Card 1: Study Calculator (Top-Left) */}
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '-10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.94)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(226, 232, 240, 0.9)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  boxShadow: '0 12px 28px -4px rgba(15, 23, 42, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  maxWidth: '230px',
                  zIndex: 2,
                  animation: 'floatSlow 4s ease-in-out infinite'
                }}
                className="hero-floating-card"
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(59, 130, 246, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#2563eb',
                    flexShrink: 0
                  }}
                >
                  <Laptop size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-slate-900)', display: 'block', lineHeight: 1.2 }}>
                    Casio Calculator
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: 600 }}>
                    Borrow · Indiranagar
                  </span>
                </div>
              </div>

              {/* Floating Item Card 2: Textbooks (Bottom-Left) */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '-5px',
                  backgroundColor: 'rgba(255, 255, 255, 0.94)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(226, 232, 240, 0.9)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  boxShadow: '0 12px 28px -4px rgba(15, 23, 42, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  maxWidth: '230px',
                  zIndex: 2,
                  animation: 'floatSlow 4.5s ease-in-out infinite 0.8s'
                }}
                className="hero-floating-card"
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#059669',
                    flexShrink: 0
                  }}
                >
                  <BookOpen size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-slate-900)', display: 'block', lineHeight: 1.2 }}>
                    Calculus & Physics Set
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600 }}>
                    Give Away · HSR Layout
                  </span>
                </div>
              </div>

              {/* Floating Concept Pill: The Loop Flow (Bottom-Right) */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  right: '0px',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid var(--color-primary-200)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  boxShadow: '0 12px 28px -4px rgba(15, 23, 42, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  maxWidth: '260px',
                  zIndex: 2
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary-50)',
                    color: 'var(--color-primary-600)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <RefreshCw size={16} />
                </div>
                <div style={{ color: 'var(--color-slate-800)', fontSize: '0.78rem', lineHeight: 1.35 }}>
                  <strong style={{ color: 'var(--color-primary-700)' }}>The LOOOP Principle:</strong>
                  <br />
                  Own → Don't Need → Share → Reuse
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. TRUST & VALUE SECTION ("WHY LOOOP EXISTS")
          ========================================================================= */}
      <section style={{ padding: '5.5rem 0', backgroundColor: '#ffffff', borderTop: '1px solid var(--color-slate-100)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3.5rem auto' }}>
            <Badge variant="success" style={{ marginBottom: '0.75rem' }}>Why LOOOP Exists</Badge>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.6rem)', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.025em' }}>
              Too Many Useful Items Remain Unused
            </h2>
            <p style={{ color: 'var(--color-slate-600)', fontSize: '1.05rem', lineHeight: 1.65 }}>
              In every household, campus dorm, and apartment, thousands of working products sit in storage.
              LOOOP connects you with people around you to keep those valuable items in circulation.
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
                desc: 'Extend the lifespan of manufactured products. Keep working devices and books out of waste bins.',
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
                <Card key={pillar.title} interactive style={{ padding: '1.75rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: pillar.bg,
                      color: pillar.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Icon size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-slate-900)' }}>
                    {pillar.title}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-slate-600)', lineHeight: 1.6, margin: 0 }}>
                    {pillar.desc}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. HOW LOOOP WORKS (4-STEP PROCESS)
          ========================================================================= */}
      <section style={{ padding: '5.5rem 0', backgroundColor: 'var(--color-slate-50)', borderTop: '1px solid var(--color-slate-200)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 3.5rem auto' }}>
            <Badge variant="info" style={{ marginBottom: '0.75rem' }}>Simple 4-Step Process</Badge>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.6rem)', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.025em' }}>
              How LOOOP Works
            </h2>
            <p style={{ color: 'var(--color-slate-600)', fontSize: '1.05rem', lineHeight: 1.65 }}>
              From discovering an unused product to completing a safe handover in your neighborhood.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.75rem',
              position: 'relative'
            }}
          >
            {[
              {
                step: '01',
                title: 'List',
                desc: 'Take photos of items you no longer use, pick your sharing model (Give Away, Borrow, or Exchange), and state availability.',
                icon: Package
              },
              {
                step: '02',
                title: 'Discover',
                desc: 'Browse or search nearby items by category, distance proximity, and condition. View owner trust scores and ratings.',
                icon: Search
              },
              {
                step: '03',
                title: 'Request',
                desc: 'Submit a request with your proposed pickup dates. Coordinate details directly in secure peer-to-peer chat.',
                icon: MessageSquare
              },
              {
                step: '04',
                title: 'Reuse',
                desc: 'Meet safely in person, exchange the secure 4-digit handover code, return on schedule if borrowed, and leave trust reviews.',
                icon: RefreshCw
              }
            ].map((st) => {
              const Icon = st.icon;
              return (
                <Card key={st.step} style={{ padding: '2rem 1.5rem', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                  <div
                    style={{
                      fontSize: '2.5rem',
                      fontWeight: 900,
                      fontFamily: 'var(--font-brand)',
                      color: 'var(--color-primary-200)',
                      lineHeight: 1,
                      marginBottom: '1rem'
                    }}
                  >
                    {st.step}
                  </div>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-primary-50)',
                      color: 'var(--color-primary-600)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1rem'
                    }}
                  >
                    <Icon size={22} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--color-slate-900)' }}>
                    {st.title}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-600)', lineHeight: 1.6, margin: 0 }}>
                    {st.desc}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. PLATFORM CAPABILITIES & FEATURE HIGHLIGHTS
          ========================================================================= */}
      <section style={{ padding: '5.5rem 0', backgroundColor: '#ffffff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3.5rem auto' }}>
            <Badge variant="neutral" style={{ marginBottom: '0.75rem' }}>Built for Real Communities</Badge>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.6rem)', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.025em' }}>
              Engineered for Simplicity & Trust
            </h2>
            <p style={{ color: 'var(--color-slate-600)', fontSize: '1.05rem', lineHeight: 1.65 }}>
              Explore the capabilities designed into LOOOP to make neighborhood item sharing effortless and safe.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
              gap: '1.75rem'
            }}
          >
            {[
              {
                title: 'Smart Search & Filters',
                desc: 'Filter by category, condition (New, Like New, Good, Fair), sharing type, and approximate neighborhood distance.',
                icon: Search
              },
              {
                title: 'Nearby Item Proximity',
                desc: 'Discover items within walking distance or brief transit to minimize travel friction and avoid courier costs.',
                icon: MapPin
              },
              {
                title: 'Wanted Items Community Board',
                desc: 'Need something specific? Post a wanted request. When a matching item is shared nearby, receive an instant match alert.',
                icon: Bookmark
              },
              {
                title: 'Secure Handover Codes',
                desc: 'Dual-confirmation pickup codes (LP-XXXX) ensure items are safely inspected and accounted for by both parties.',
                icon: Key
              },
              {
                title: 'Peer-to-Peer In-App Chat',
                desc: 'Coordinate handovers smoothly without sharing private personal contact numbers or external messenger links.',
                icon: MessageSquare
              },
              {
                title: 'Transparent Trust & Ratings',
                desc: 'Community trust scores based on verified on-time returns, accurate descriptions, and neighbor ratings.',
                icon: ShieldCheck
              },
              {
                title: 'Real-Time Notifications',
                desc: 'Never miss an exchange request, handover reminder, return deadline, or smart match notification.',
                icon: Bell
              },
              {
                title: 'Circulation & Reuse Metrics',
                desc: 'Track personal sharing achievements and watch the aggregate community waste reduction milestones grow.',
                icon: TrendingUp
              }
            ].map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  style={{
                    padding: '1.5rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-slate-200)',
                    backgroundColor: '#ffffff',
                    transition: 'all var(--transition-fast)'
                  }}
                  className="feature-highlight-card"
                >
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-primary-50)',
                      color: 'var(--color-primary-700)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1rem'
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-slate-900)', marginBottom: '0.4rem' }}>
                    {feat.title}
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-600)', lineHeight: 1.6, margin: 0 }}>
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. COMMUNITY SECTION ("STORIES FROM THE LOOP")
          ========================================================================= */}
      <section style={{ padding: '5.5rem 0', backgroundColor: 'var(--color-slate-50)', borderTop: '1px solid var(--color-slate-200)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3.5rem auto' }}>
            <Badge variant="success" style={{ marginBottom: '0.75rem' }}>Community First</Badge>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.6rem)', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.025em' }}>
              Real Stories from the Loop
            </h2>
            <p style={{ color: 'var(--color-slate-600)', fontSize: '1.05rem', lineHeight: 1.65 }}>
              “Your unused item could be exactly what someone else needs.”
              Here is how members across Bengaluru campuses and neighborhoods share every day.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem'
            }}
          >
            {[
              {
                person: 'Aarav Sharma',
                role: 'Engineering Student · Indiranagar',
                item: 'Casio Scientific Calculator',
                type: 'borrow',
                quote: '“I needed a Casio 991ES for semester math exams. A neighbor 1.2 km away lent it to me for 5 days. Saved money and avoided buying a calculator I only needed for a week.”',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
                badge: 'Borrowed for Finals'
              },
              {
                person: 'Ananya Deshmukh',
                role: 'Graduating Senior · HSR Layout',
                item: 'Calculus & Physics Book Set',
                type: 'give_away',
                quote: '“Instead of throwing out my heavy university textbooks, I gifted them to a junior mechanical student. They picked it up from my apartment gate that evening.”',
                avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
                badge: 'Given to Junior'
              },
              {
                person: 'Sunil Kumar',
                role: 'Resident · JP Nagar Phase 3',
                item: 'Cordless Impact Drill & Bit Set',
                type: 'borrow',
                quote: '“I only use my power drill once every few months. Lending it to neighbors for weekend bookshelf and picture frame assembly gives the tool real utility.”',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
                badge: '100% On-Time Returns'
              },
              {
                person: 'Tanvi Nair',
                role: 'UI Designer · Koramangala',
                item: 'Keyboard ↔ Speaker Exchange',
                type: 'exchange',
                quote: '“I had a mechanical keyboard I no longer used, and another member had an extra portable Bluetooth speaker. We did a direct exchange with zero money involved.”',
                avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
                badge: 'Direct Value Swap'
              }
            ].map((story, i) => (
              <Card key={i} style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Avatar src={story.avatar} name={story.person} size="md" />
                      <div>
                        <strong style={{ fontSize: '0.95rem', color: 'var(--color-slate-900)', display: 'block' }}>
                          {story.person}
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)' }}>
                          {story.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ backgroundColor: 'var(--color-slate-50)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', border: '1px solid var(--color-slate-200)' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-primary-800)' }}>
                      Item: {story.item}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.9rem', color: 'var(--color-slate-700)', lineHeight: 1.6, fontStyle: 'italic', margin: 0 }}>
                    {story.quote}
                  </p>
                </div>

                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--color-slate-100)' }}>
                  <Badge variant="neutral">{story.badge}</Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. FEATURED ITEMS SECTION
          ========================================================================= */}
      <section style={{ padding: '5.5rem 0', backgroundColor: '#ffffff' }}>
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
              <Badge variant="success" style={{ marginBottom: '0.5rem' }}>Community Catalog</Badge>
              <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.025em' }}>
                Featured Available Items
              </h2>
              <p style={{ color: 'var(--color-slate-600)', fontSize: '1rem' }}>
                Discover real items recently listed by members in Bengaluru.
              </p>
            </div>
            <Link to="/browse" style={{ textDecoration: 'none' }}>
              <Button variant="outline" iconRight={ArrowRight}>
                View All Available Items
              </Button>
            </Link>
          </div>

          {/* Category Filter Pills */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
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
                padding: '8px 18px',
                borderRadius: 'var(--radius-full)',
                border: selectedCategory === 'all' ? '1px solid var(--color-primary-500)' : '1px solid var(--color-slate-200)',
                backgroundColor: selectedCategory === 'all' ? 'var(--color-primary-50)' : '#ffffff',
                color: selectedCategory === 'all' ? 'var(--color-primary-800)' : 'var(--color-slate-700)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)'
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
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-full)',
                  border: selectedCategory === cat.id ? '1px solid var(--color-primary-500)' : '1px solid var(--color-slate-200)',
                  backgroundColor: selectedCategory === cat.id ? 'var(--color-primary-50)' : '#ffffff',
                  color: selectedCategory === cat.id ? 'var(--color-primary-800)' : 'var(--color-slate-700)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all var(--transition-fast)'
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
          8. CALL TO ACTION (CTA)
          ========================================================================= */}
      <section
        style={{
          padding: '6.5rem 0',
          backgroundColor: '#ffffff',
          position: 'relative',
          overflow: 'hidden'
        }}
        aria-label="Call to action"
      >
        <div
          className="container"
          style={{
            maxWidth: '920px',
            backgroundColor: 'var(--color-slate-900)',
            borderRadius: 'var(--radius-xl)',
            padding: '4rem 2rem',
            textAlign: 'center',
            color: '#ffffff',
            position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
            background: 'radial-gradient(ellipse at 50% 0%, rgba(16, 185, 129, 0.25) 0%, #0f172a 75%)'
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              borderRadius: 'var(--radius-full)',
              color: '#34d399',
              fontSize: '0.8rem',
              fontWeight: 700,
              marginBottom: '1.25rem',
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}
          >
            Join the Circular Sharing Circle
          </span>

          <h2
            style={{
              fontSize: 'clamp(2.2rem, 4.5vw, 3.25rem)',
              fontWeight: 900,
              marginBottom: '1.25rem',
              letterSpacing: '-0.03em',
              color: '#ffffff',
              lineHeight: 1.15
            }}
          >
            Give unused things another purpose.
          </h2>

          <p
            style={{
              color: '#cbd5e1',
              fontSize: '1.15rem',
              lineHeight: 1.65,
              marginBottom: '2.5rem',
              maxWidth: '620px',
              margin: '0 auto 2.5rem auto'
            }}
          >
            Join your local campus and neighborhood sharing circle. Start discovering items nearby or list something you no longer need in under a minute.
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
              flexWrap: 'wrap'
            }}
          >
            <Link to="/browse" style={{ textDecoration: 'none' }}>
              <Button variant="primary" size="lg" iconRight={ArrowRight}>
                Browse Items
              </Button>
            </Link>

            <Button
              variant="outline"
              size="lg"
              iconLeft={Gift}
              onClick={handleShareClick}
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.22)',
                borderColor: '#34d399',
                borderWidth: '2px',
                color: '#ffffff',
                fontWeight: 700,
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.35)',
                transition: 'all 0.25s ease'
              }}
              className="highlighted-share-btn"
            >
              Share an Item
            </Button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. LIVE ENVIRONMENTAL & COMMUNITY IMPACT SLIDE (ABOVE FOOTER BAR)
          ========================================================================= */}
      <section
        style={{
          padding: '5.5rem 0',
          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
          color: '#ffffff'
        }}
        aria-label="Environmental and Community Impact"
      >
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 3.5rem auto' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 14px',
                backgroundColor: 'rgba(16, 185, 129, 0.22)',
                borderRadius: 'var(--radius-full)',
                color: '#a7f3d0',
                fontSize: '0.8rem',
                fontWeight: 700,
                marginBottom: '1rem',
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}
            >
              <Sparkles size={14} />
              <span>Verified Community Impact</span>
            </span>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.6rem)', fontWeight: 800, color: '#ffffff', marginBottom: '1rem', letterSpacing: '-0.025em' }}>
              Reducing Waste Through Circular Reuse
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '1.05rem', lineHeight: 1.65 }}>
              Every item borrowed or gifted on LOOOP represents one less product manufactured, shipped in single-use plastic, or buried in a landfill.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.75rem',
              textAlign: 'center'
            }}
          >
            {[
              { label: 'Items Reused', value: liveImpact.itemsReused, icon: RefreshCw, desc: 'Active items in community use' },
              { label: 'People Helped', value: liveImpact.peopleHelped, icon: Users, desc: 'Neighbors connected' },
              { label: 'Books Shared', value: liveImpact.booksShared, icon: BookOpen, desc: 'Study sets & novels' },
              { label: 'Electronics Shared', value: liveImpact.electronicsShared, icon: Laptop, desc: 'Gadgets & peripherals' },
              { label: 'Waste Avoided', value: `${liveImpact.wasteAvoidedKg} kg`, icon: TrendingUp, desc: 'Solid waste kept out of landfills' }
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.07)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '2rem 1.25rem',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(16, 185, 129, 0.25)',
                      color: '#a7f3d0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1rem'
                    }}
                  >
                    <Icon size={22} />
                  </div>
                  <div
                    style={{
                      fontSize: '2.5rem',
                      fontWeight: 900,
                      fontFamily: 'var(--font-brand)',
                      color: '#ffffff',
                      marginBottom: '0.35rem',
                      lineHeight: 1.1
                    }}
                  >
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '0.95rem', color: '#f8fafc', fontWeight: 700, marginBottom: '0.25rem' }}>
                    {stat.label}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    {stat.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Floating Card CSS Keyframes */}
      <style>{`
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .feature-highlight-card:hover {
          border-color: var(--color-primary-300) !important;
          box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.1) !important;
          transform: translateY(-2px);
        }
        .highlighted-share-btn:hover {
          background-color: var(--color-primary-600) !important;
          color: #ffffff !important;
          border-color: var(--color-primary-600) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4) !important;
        }
        .browse-hover-highlight-btn {
          background-color: #ffffff !important;
          color: var(--color-slate-700) !important;
          border: 1.5px solid var(--color-slate-300) !important;
          font-weight: 600 !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .browse-hover-highlight-btn:hover {
          background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600)) !important;
          color: #ffffff !important;
          border-color: var(--color-primary-600) !important;
          box-shadow: 0 6px 16px rgba(16, 185, 129, 0.35) !important;
          transform: translateY(-2px);
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
