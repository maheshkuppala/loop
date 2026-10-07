import React from 'react';
import { Loader2 } from 'lucide-react';

export const Spinner = ({ size = 20, className = '', color = 'currentColor' }) => {
  return (
    <Loader2
      size={size}
      color={color}
      className={`spinner-icon ${className}`}
      aria-label="Loading..."
    />
  );
};

export default Spinner;
