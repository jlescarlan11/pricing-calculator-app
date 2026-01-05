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
export const Badge: React.FC<BadgeProps> = ({ children, variant = 'info', className = '' }) => {
  const baseStyles =
    'inline-flex items-center rounded-sm px-sm py-xs text-xs font-semibold transition-colors';

  const variants = {
    success: 'bg-moss/10 text-moss border border-moss/20',
    warning: 'bg-sakura/20 text-ink-700 border border-sakura/30',
    error: 'bg-rust/10 text-rust border border-rust/20',
    info: 'bg-clay/10 text-clay border border-clay/20',
  };

  const variantStyles = variants[variant];

  return <span className={`${baseStyles} ${variantStyles} ${className}`}>{children}</span>;
};
