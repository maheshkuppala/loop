import React, { useState, useRef, useEffect } from 'react';

export const TiltCard = ({
  children,
  className = '',
  style = {},
  maxTilt = 12,
  perspective = 1000,
  scale = 1.05,
  translateZ = 35,
  glare = true,
  onClick,
  isZooming = false,
  ...restProps
}) => {
  const cardRef = useRef(null);
  const [transformStyle, setTransformStyle] = useState('');
  const [glareStyle, setGlareStyle] = useState({ opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const handleMouseMove = (e) => {
    if (reducedMotion || isZooming || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Calculate mouse position relative to center of card (-1 to 1)
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const centerX = mouseX - width / 2;
    const centerY = mouseY - height / 2;

    const rotX = (-centerY / (height / 2)) * maxTilt;
    const rotY = (centerX / (width / 2)) * maxTilt;

    setTransformStyle(
      `perspective(${perspective}px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateZ(${translateZ}px) scale3d(${scale}, ${scale}, ${scale})`
    );

    if (glare) {
      const glareX = (mouseX / width) * 100;
      const glareY = (mouseY / height) * 100;
      setGlareStyle({
        opacity: 0.35,
        background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(16, 185, 129, 0.4), rgba(255, 255, 255, 0) 70%)`
      });
    }
  };

  const handleMouseEnter = () => {
    if (!reducedMotion) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTransformStyle(`perspective(${perspective}px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale3d(1, 1, 1)`);
    setGlareStyle({ opacity: 0 });
  };

  return (
    <div
      ref={cardRef}
      className={`tilt-card-container ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        position: 'relative',
        transformStyle: 'preserve-3d',
        transition: isHovered
          ? 'transform 0.12s cubic-bezier(0.03, 0.98, 0.52, 0.99), box-shadow 0.3s ease, border-color 0.3s ease'
          : 'transform 0.5s ease-out, box-shadow 0.5s ease, border-color 0.5s ease',
        transform: isZooming
          ? `perspective(${perspective}px) translateZ(140px) scale3d(1.18, 1.18, 1.18) rotateX(-2deg)`
          : transformStyle || `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale3d(1, 1, 1)`,
        cursor: onClick ? 'pointer' : 'default',
        willChange: 'transform',
        zIndex: isZooming ? 50 : isHovered ? 10 : 1,
        ...style
      }}
      {...restProps}
    >
      {children}

      {/* Glare layer */}
      {glare && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 'inherit',
            pointerEvents: 'none',
            transition: 'opacity 0.3s ease',
            mixBlendMode: 'overlay',
            zIndex: 10,
            ...glareStyle
          }}
        />
      )}
    </div>
  );
};

export default TiltCard;
