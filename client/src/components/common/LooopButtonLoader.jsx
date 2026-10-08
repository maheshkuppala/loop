import React from 'react';

export const LooopButtonLoader = ({ text = 'Loading...', size = 'md' }) => {
  const dotSize = size === 'sm' ? 4 : size === 'lg' ? 7 : 5;
  
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      <span>{text}</span>
      <span style={{ display: 'inline-flex', gap: '3px', alignItems: 'center' }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="looop-loading-dot"
            style={{
              width: `${dotSize}px`,
              height: `${dotSize}px`,
              animationDelay: `${i * 0.15}s`
            }}
          />
        ))}
      </span>
    </span>
  );
};

export default LooopButtonLoader;
