import React from 'react';
import { Loader2 } from 'lucide-react';

const SIZE_MAP = {
  xs: 14,
  sm: 18,
  md: 24,
  lg: 32,
  xl: 40
};

export const Spinner = ({ size = 20, className = '', color = 'currentColor', style = {} }) => {
  const numericSize = typeof size === 'number' ? size : (SIZE_MAP[size] || 24);

  return (
    <Loader2
      size={numericSize}
      color={color}
      className={`animate-spin ${className}`}
      style={{
        width: `${numericSize}px`,
        height: `${numericSize}px`,
        maxWidth: `${numericSize}px`,
        maxHeight: `${numericSize}px`,
        flexShrink: 0,
        display: 'inline-block',
        verticalAlign: 'middle',
        ...style
      }}
      aria-label="Loading..."
    />
  );
};

export default Spinner;
