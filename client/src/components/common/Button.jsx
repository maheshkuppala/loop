import React from 'react';
import Spinner from './Spinner';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  iconLeft: IconLeft = null,
  iconRight: IconRight = null,
  icon: IconOnly = null,
  type = 'button',
  onClick,
  className = '',
  id,
  'aria-label': ariaLabel,
  ...props
}) => {
  const isIconOnly = variant === 'icon' || variant === 'icon-only' || (IconOnly && !children);
  const variantClass = isIconOnly ? 'btn-icon' : `btn-${variant}`;
  const sizeClass = isIconOnly ? '' : `btn-${size}`;

  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (onClick) {
      onClick(e);
    }
  };

  const ResolvedIcon = IconOnly || IconLeft;

  return (
    <button
      id={id}
      type={type}
      className={`btn ${variantClass} ${sizeClass} ${className}`}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      aria-label={ariaLabel}
      onClick={handleClick}
      {...props}
    >
      {loading ? (
        <Spinner size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
      ) : (
        ResolvedIcon && <ResolvedIcon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
      )}
      {children && <span>{children}</span>}
      {!loading && !isIconOnly && IconRight && (
        <IconRight size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
      )}
    </button>
  );
};

export default Button;

