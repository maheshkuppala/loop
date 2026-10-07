import React from 'react';

const sizeMap = {
  sm: { dim: 32, font: '0.75rem' },
  md: { dim: 40, font: '0.875rem' },
  lg: { dim: 52, font: '1.1rem' },
  xl: { dim: 72, font: '1.5rem' }
};

export const Avatar = ({
  src,
  name = 'User',
  size = 'md',
  online = null,
  trustScore = null,
  className = ''
}) => {
  const { dim, font } = sizeMap[size] || sizeMap.md;

  const getInitials = (str) => {
    if (!str) return 'U';
    const parts = str.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return str.slice(0, 2).toUpperCase();
  };

  return (
    <div
      className={`avatar-wrapper ${className}`}
      style={{
        position: 'relative',
        width: `${dim}px`,
        height: `${dim}px`,
        flexShrink: 0
      }}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid #ffffff',
            boxShadow: 'var(--shadow-sm)'
          }}
          onError={(e) => {
            // Fallback to initials if image link breaks
            e.target.style.display = 'none';
          }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary-100)',
            color: 'var(--color-primary-800)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: font,
            fontWeight: 700,
            border: '2px solid #ffffff',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          {getInitials(name)}
        </div>
      )}

      {/* Online indicator */}
      {online !== null && (
        <span
          title={online ? 'Online' : 'Offline'}
          style={{
            position: 'absolute',
            bottom: '0px',
            right: '0px',
            width: size === 'sm' ? '8px' : '11px',
            height: size === 'sm' ? '8px' : '11px',
            borderRadius: '50%',
            backgroundColor: online ? 'var(--color-success)' : 'var(--color-slate-400)',
            border: '2px solid #ffffff'
          }}
        />
      )}
    </div>
  );
};

export default Avatar;
