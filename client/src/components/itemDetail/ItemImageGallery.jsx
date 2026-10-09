import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X, Image as ImageIcon } from 'lucide-react';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80';

export const ItemImageGallery = ({ images = [], itemTitle = 'Item Image' }) => {
  const safeImages = Array.isArray(images) && images.length > 0 ? images : [FALLBACK_IMAGE];
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Prev / Next Handlers
  const handlePrev = useCallback((e) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1));
  }, [safeImages.length]);

  const handleNext = useCallback((e) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1));
  }, [safeImages.length]);

  // Keyboard navigation for Lightbox (Escape, ArrowLeft, ArrowRight)
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [lightboxOpen, handlePrev, handleNext]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} className="item-image-gallery">
      {/* 1. Main Display Image Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '4/3',
          maxHeight: '440px',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          backgroundColor: '#f1f5f9',
          border: '1px solid var(--color-slate-200)',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
          cursor: 'pointer'
        }}
        onClick={() => setLightboxOpen(true)}
        className="main-image-container"
        title="Click to view full size"
      >
        <img
          src={imageError ? FALLBACK_IMAGE : safeImages[activeIndex]}
          alt={`${itemTitle} - Photo ${activeIndex + 1}`}
          onError={() => setImageError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease'
          }}
          className="gallery-main-img"
        />

        {/* Image Counter Badge */}
        {safeImages.length > 1 && (
          <div
            style={{
              position: 'absolute',
              bottom: '14px',
              right: '14px',
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(4px)',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '3px 9px',
              borderRadius: 'var(--radius-full)',
              letterSpacing: '0.04em'
            }}
          >
            {activeIndex + 1} / {safeImages.length}
          </div>
        )}

        {/* Fullscreen Expansion Icon */}
        <div
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-slate-700)',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)'
          }}
          className="gallery-expand-pill"
        >
          <Maximize2 size={16} />
        </div>

        {/* Gallery Navigation Arrows (if multiple images) */}
        {safeImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous photo"
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.92)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-slate-800)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                transition: 'transform 0.15s ease'
              }}
              className="gallery-arrow-btn"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Next photo"
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.92)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-slate-800)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                transition: 'transform 0.15s ease'
              }}
              className="gallery-arrow-btn"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* 2. Thumbnail Strip */}
      {safeImages.length > 1 && (
        <div
          style={{
            display: 'flex',
            gap: '10px',
            overflowX: 'auto',
            paddingBottom: '4px'
          }}
          className="thumbnail-strip"
        >
          {safeImages.map((img, idx) => {
            const isActive = activeIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`View photo ${idx + 1}`}
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  padding: 0,
                  border: isActive ? '2.5px solid var(--color-primary-600)' : '2px solid transparent',
                  cursor: 'pointer',
                  backgroundColor: '#f1f5f9',
                  flexShrink: 0,
                  boxShadow: isActive ? '0 2px 8px rgba(16, 185, 129, 0.25)' : 'none',
                  transition: 'all 0.15s ease'
                }}
                className="gallery-thumb"
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </button>
            );
          })}
        </div>
      )}

      {/* 3. Lightbox Modal */}
      {lightboxOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 150,
            backgroundColor: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}
          onClick={() => setLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Image Lightbox Preview"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close image preview"
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 160
            }}
            className="lightbox-close-btn"
          >
            <X size={24} />
          </button>

          {/* Lightbox Navigation */}
          {safeImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous photo"
                style={{
                  position: 'absolute',
                  left: '20px',
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.18)',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 160
                }}
              >
                <ChevronLeft size={26} />
              </button>

              <button
                type="button"
                onClick={handleNext}
                aria-label="Next photo"
                style={{
                  position: 'absolute',
                  right: '20px',
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.18)',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 160
                }}
              >
                <ChevronRight size={26} />
              </button>
            </>
          )}

          {/* Image Canvas */}
          <div
            style={{
              maxWidth: '90vw',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={safeImages[activeIndex]}
              alt={`${itemTitle} - Full Preview`}
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
              }}
            />
            {safeImages.length > 1 && (
              <span style={{ color: '#d1fae5', fontSize: '0.85rem', fontWeight: 600, marginTop: '12px' }}>
                Photo {activeIndex + 1} of {safeImages.length}
              </span>
            )}
          </div>
        </div>
      )}

      <style>{`
        .main-image-container {
          transform-style: preserve-3d;
          perspective: 1000px;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, border-color 0.3s ease;
          will-change: transform;
        }
        .main-image-container:hover {
          transform: perspective(1000px) translateZ(24px) scale(1.025);
          box-shadow: 0 16px 36px -6px rgba(16, 185, 129, 0.25), 0 8px 16px rgba(15, 23, 42, 0.08) !important;
          border-color: #10b981 !important;
        }
        .main-image-container:hover .gallery-main-img {
          transform: scale(1.06) translateZ(10px);
        }
        .gallery-arrow-btn:hover {
          transform: translateY(-50%) scale(1.12) !important;
          background-color: #ffffff !important;
        }
        .gallery-thumb {
          transition: transform 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;
        }
        .gallery-thumb:hover {
          transform: translateY(-3px) scale(1.05);
          opacity: 1;
        }
        .lightbox-close-btn:hover {
          background-color: rgba(255, 255, 255, 0.3) !important;
        }
        @keyframes zoom3dIn {
          0% { opacity: 0; transform: scale(0.88) translateZ(-50px); }
          100% { opacity: 1; transform: scale(1) translateZ(0); }
        }
        .lightbox-3d-content {
          animation: zoom3dIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default ItemImageGallery;
