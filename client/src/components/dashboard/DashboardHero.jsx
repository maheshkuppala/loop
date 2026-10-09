import React from 'react';
import { Sparkles, ShieldCheck, Laptop, BookOpen, Wrench, Headphones, Camera, Bike } from 'lucide-react';
import Badge from '../common/Badge';

export const DashboardHero = ({ user }) => {
  const displayName = user?.name ? user.name.split(' ')[0] : 'Sharer';
  const trustScore = user?.trustScore || 98;
  const formatLocation = (loc) => {
    if (!loc) return 'Indiranagar, Bengaluru';
    if (typeof loc === 'string') return loc;
    if (typeof loc === 'object') {
      const parts = [loc.locality, loc.city, loc.state].filter(Boolean);
      return parts.length > 0 ? parts.join(', ') : 'Indiranagar, Bengaluru';
    }
    return 'Indiranagar, Bengaluru';
  };
  const location = formatLocation(user?.location);

  return (
    <div
      style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #064e3b 0%, #065f46 65%, #047857 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '2.5rem',
        color: '#ffffff',
        overflow: 'hidden',
        boxShadow: '0 12px 30px -10px rgba(6, 78, 59, 0.25)',
        border: '1px solid rgba(16, 185, 129, 0.2)'
      }}
      className="dashboard-hero-container"
    >
      {/* Background Decorative Circular Loops */}
      <div
        style={{
          position: 'absolute',
          top: '-80px',
          right: '-80px',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          border: '45px solid rgba(255, 255, 255, 0.04)',
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-100px',
          left: '25%',
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          border: '35px solid rgba(255, 255, 255, 0.03)',
          pointerEvents: 'none'
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '2rem',
          alignItems: 'center'
        }}
        className="hero-grid"
      >
        {/* Left Column: Personalized Greeting & Community Mission */}
        <div>
          {/* Badge & Trust Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(255, 255, 255, 0.14)',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#a7f3d0',
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}
            >
              <Sparkles size={13} />
              <span>LOOOP Community Portal</span>
            </span>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(16, 185, 129, 0.25)',
                color: '#6ee7b7',
                fontSize: '0.78rem',
                fontWeight: 600
              }}
            >
              <ShieldCheck size={14} />
              <span>{trustScore}% Trust Score</span>
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(1.75rem, 2.8vw, 2.35rem)',
              fontWeight: 900,
              lineHeight: 1.2,
              marginBottom: '0.75rem',
              letterSpacing: '-0.025em',
              color: '#ffffff'
            }}
          >
            Welcome to LOOOP, {displayName} 👋
          </h1>

          <p
            style={{
              fontSize: '1rem',
              color: '#d1fae5',
              lineHeight: 1.6,
              maxWidth: '520px',
              margin: '0 0 1.5rem 0'
            }}
          >
            Discover useful things, share what you no longer need, and keep your community moving.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              fontSize: '0.825rem',
              color: '#a7f3d0'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#34d399',
                  display: 'inline-block'
                }}
              />
              <span>{location}</span>
            </span>
            <span>•</span>
            <span>Zero Waste Initiative</span>
          </div>
        </div>

        {/* Right Column: 3D Floating Everyday Item Composition */}
        <div
          style={{
            position: 'relative',
            height: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            perspective: '1000px'
          }}
          className="floating-hero-composition"
        >
          {/* Central Orbit Ring */}
          <div
            style={{
              position: 'absolute',
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              border: '2px dashed rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(16,185,129,0.3) 100%)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '0.85rem',
                letterSpacing: '0.05em'
              }}
            >
              LOOOP
            </div>
          </div>

          {/* Floating Item 1: Book */}
          <div
            style={{
              position: 'absolute',
              top: '8px',
              left: '12%',
              backgroundColor: 'rgba(255, 255, 255, 0.16)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.18)',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#ffffff',
              transform: 'translateZ(20px) rotate(-3deg)',
              animation: 'floatSlow1 4s ease-in-out infinite alternate'
            }}
            className="hero-float-card"
          >
            <BookOpen size={14} color="#7dd3fc" />
            <span>Calculus Book</span>
          </div>

          {/* Floating Item 2: Headphones */}
          <div
            style={{
              position: 'absolute',
              bottom: '15px',
              left: '18%',
              backgroundColor: 'rgba(255, 255, 255, 0.16)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.18)',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#ffffff',
              transform: 'translateZ(30px) rotate(2deg)',
              animation: 'floatSlow2 4.5s ease-in-out infinite alternate'
            }}
            className="hero-float-card"
          >
            <Headphones size={14} color="#fcd34d" />
            <span>Studio Headphones</span>
          </div>

          {/* Floating Item 3: Cordless Tool */}
          <div
            style={{
              position: 'absolute',
              top: '18px',
              right: '10%',
              backgroundColor: 'rgba(255, 255, 255, 0.16)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.18)',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#ffffff',
              transform: 'translateZ(25px) rotate(3deg)',
              animation: 'floatSlow3 5s ease-in-out infinite alternate'
            }}
            className="hero-float-card"
          >
            <Wrench size={14} color="#6ee7b7" />
            <span>Drill Kit</span>
          </div>

          {/* Floating Item 4: Camera / Gadget */}
          <div
            style={{
              position: 'absolute',
              bottom: '22px',
              right: '12%',
              backgroundColor: 'rgba(255, 255, 255, 0.16)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.18)',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#ffffff',
              transform: 'translateZ(15px) rotate(-2deg)',
              animation: 'floatSlow1 4.2s ease-in-out infinite alternate'
            }}
            className="hero-float-card"
          >
            <Camera size={14} color="#f472b6" />
            <span>DSLR Lens</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes floatSlow1 {
          0% { transform: translateY(0px) rotate(-3deg); }
          100% { transform: translateY(-8px) rotate(-1deg); }
        }
        @keyframes floatSlow2 {
          0% { transform: translateY(0px) rotate(2deg); }
          100% { transform: translateY(-7px) rotate(4deg); }
        }
        @keyframes floatSlow3 {
          0% { transform: translateY(0px) rotate(3deg); }
          100% { transform: translateY(-10px) rotate(1deg); }
        }
        .hero-float-card:hover {
          transform: scale(1.08) translateY(-4px) !important;
          background-color: rgba(255, 255, 255, 0.25) !important;
        }
        @media (max-width: 900px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
          }
          .floating-hero-composition {
            display: none !important;
          }
          .dashboard-hero-container {
            padding: 1.75rem 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardHero;
