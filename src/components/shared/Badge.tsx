import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

/**
 * A reusable Badge component for displaying status or category tags.
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'info',
  className = '',
}) => {
  const baseStyles = 'inline-flex items-center rounded-sm px-sm py-xs text-xs font-semibold transition-colors';

  const variants = {
    success: 'bg-moss text-bg-main',
    warning: 'bg-sakura text-ink-900',
    error: 'bg-rust text-bg-main',
    info: 'bg-clay text-bg-main',
  };

  const variantStyles = variants[variant];

  return (
    <span className={`${baseStyles} ${variantStyles} ${className}`}>
      {children}
    </span>
  );
};
