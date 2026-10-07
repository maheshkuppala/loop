import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Pause, Play, ArrowRight, Sparkles, MapPin, Tag } from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';

export const AmazonItemCarousel = ({ items = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const carouselRef = useRef(null);
  const navigate = useNavigate();

  // Screen-size responsive items per view
  const getItemsPerPage = () => {
    if (typeof window === 'undefined') return 4;
    const width = window.innerWidth;
    if (width < 640) return 1;
    if (width < 960) return 2;
    if (width < 1280) return 3;
    return 4;
  };

  const [itemsPerPage, setItemsPerPage] = useState(getItemsPerPage());

  useEffect(() => {
    const handleResize = () => setItemsPerPage(getItemsPerPage());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalItems = items.length;
  const maxIndex = Math.max(0, totalItems - itemsPerPage);

  // Auto-scroll logic every 3.5 seconds
  useEffect(() => {
    if (isPaused || totalItems <= itemsPerPage) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 3500);

    return () => clearInterval(timer);
  }, [isPaused, maxIndex, totalItems, itemsPerPage]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const getSharingBadgeVariant = (type) => {
    switch (type) {
      case 'give_away': return 'success';
      case 'borrow': return 'info';
      case 'exchange': return 'warning';
      default: return 'neutral';
    }
  };

  const formatSharingType = (type) => {
    switch (type) {
      case 'give_away': return 'Give Away';
      case 'borrow': return 'Borrow';
      case 'exchange': return 'Exchange';
      default: return type || 'Available';
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <section
      style={{
        padding: '5rem 0',
        backgroundColor: '#ffffff',
        borderTop: '1px solid var(--color-slate-100)',
        borderBottom: '1px solid var(--color-slate-100)'
      }}
      aria-label="Available Items Carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container">
        {/* Section Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: '2.5rem',
            flexWrap: 'wrap',
            gap: '1.25rem'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
              <Badge variant="success">
                <Sparkles size={13} style={{ marginRight: '4px' }} />
                Amazon-Style Live Catalog
              </Badge>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)', fontWeight: 600 }}>
                {isPaused ? '⏸️ Auto-scroll paused' : '▶️ Auto-moving every 3.5s'}
              </span>
            </div>
            <h2
              style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
                fontWeight: 800,
                letterSpacing: '-0.025em',
                color: 'var(--color-slate-900)'
              }}
            >
              Explore Listed Items Nearby
            </h2>
            <p style={{ color: 'var(--color-slate-600)', fontSize: '1rem', marginTop: '0.35rem' }}>
              Discover functional electronics, books, study gear, and tools shared by neighbors.
            </p>
          </div>

          {/* Navigation Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              style={{
                background: 'var(--color-slate-100)',
                border: '1px solid var(--color-slate-200)',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--color-slate-700)',
                transition: 'all 0.2s'
              }}
              title={isPaused ? 'Resume auto-scroll' : 'Pause auto-scroll'}
              aria-label={isPaused ? 'Resume auto-scroll' : 'Pause auto-scroll'}
            >
              {isPaused ? <Play size={18} /> : <Pause size={18} />}
            </button>

            <button
              type="button"
              onClick={handlePrev}
              style={{
                background: 'var(--color-slate-100)',
                border: '1px solid var(--color-slate-200)',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--color-slate-700)',
                transition: 'all 0.2s'
              }}
              aria-label="Previous items"
            >
              <ChevronLeft size={22} />
            </button>

            <button
              type="button"
              onClick={handleNext}
              style={{
                background: 'var(--color-primary-500)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.2s'
              }}
              aria-label="Next items"
            >
              <ChevronRight size={22} />
            </button>

            <Link to="/browse" style={{ textDecoration: 'none', marginLeft: '0.5rem' }}>
              <Button variant="outline" size="sm" iconRight={ArrowRight}>
                View All Catalog
              </Button>
            </Link>
          </div>
        </div>

        {/* Carousel Window */}
        <div style={{ overflow: 'hidden', position: 'relative', borderRadius: 'var(--radius-lg)' }}>
          <div
            ref={carouselRef}
            style={{
              display: 'flex',
              transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`,
              transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
              gap: '1.25rem'
            }}
          >
            {items.map((item) => {
              const itemImg = Array.isArray(item.images) && item.images.length > 0
                ? (typeof item.images[0] === 'string' ? item.images[0] : item.images[0].url)
                : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80';

              return (
                <div
                  key={item.id || item._id}
                  style={{
                    flex: `0 0 calc(${100 / itemsPerPage}% - ${(1.25 * (itemsPerPage - 1)) / itemsPerPage}rem)`,
                    minWidth: 0,
                    boxSizing: 'border-box'
                  }}
                >
                  <div
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--color-slate-200)',
                      overflow: 'hidden',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
                      transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                      cursor: 'pointer'
                    }}
                    className="amazon-item-card"
                    onClick={() => navigate(`/items/${item.id || item._id}`)}
                  >
                    {/* Item Image Box */}
                    <div style={{ position: 'relative', width: '100%', height: '210px', backgroundColor: 'var(--color-slate-100)', overflow: 'hidden' }}>
                      <img
                        src={itemImg}
                        alt={item.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.35s ease'
                        }}
                        className="amazon-card-img"
                      />
                      <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                        <Badge variant={getSharingBadgeVariant(item.sharingType)}>
                          {formatSharingType(item.sharingType)}
                        </Badge>
                      </div>
                      {item.condition && (
                        <div style={{ position: 'absolute', bottom: '12px', right: '12px', backgroundColor: 'rgba(15, 23, 42, 0.75)', color: '#ffffff', fontSize: '0.72rem', padding: '3px 8px', borderRadius: 'var(--radius-sm)', textTransform: 'capitalize' }}>
                          {item.condition.replace('_', ' ')}
                        </div>
                      )}
                    </div>

                    {/* Content Box */}
                    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary-700)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
                        {item.category || 'General'}
                      </div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-slate-900)', marginBottom: '0.5rem', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item.title}
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-600)', marginBottom: '1.25rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flexGrow: 1 }}>
                        {item.description}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.85rem', borderTop: '1px solid var(--color-slate-100)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--color-slate-500)', fontWeight: 500 }}>
                          <MapPin size={14} color="var(--color-primary-600)" />
                          <span>{item.location || 'Local Neighborhood'}</span>
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary-600)' }}>
                          View →
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dots Pagination */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '1.75rem' }}>
          {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              style={{
                width: currentIndex === idx ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                backgroundColor: currentIndex === idx ? 'var(--color-primary-500)' : 'var(--color-slate-300)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      <style>{`
        .amazon-item-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 28px -4px rgba(15, 23, 42, 0.12) !important;
          border-color: var(--color-primary-300) !important;
        }
        .amazon-item-card:hover .amazon-card-img {
          transform: scale(1.05);
        }
      `}</style>
    </section>
  );
};

export default AmazonItemCarousel;
