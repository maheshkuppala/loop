import React from 'react';

export const Card = ({
  children,
  interactive = false,
  glass = false,
  className = '',
  onClick,
  ...props
}) => {
  const interactiveClass = interactive ? 'card-interactive' : '';
  const glassClass = glass ? 'card-glass' : '';

  return (
    <div
      className={`card ${interactiveClass} ${glassClass} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
