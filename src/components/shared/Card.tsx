import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  className = '',
  footer,
  noPadding = false,
}) => {
  return (
    <div className={`bg-surface rounded-md border border-border-base shadow-level-1 overflow-hidden ${className}`}>
      {title && (
        <div className="px-xl py-xl border-b border-border-subtle">
          {typeof title === 'string' ? (
            <h3 className="text-lg text-ink-900">{title}</h3>
          ) : (
            title
          )}
        </div>
      )}
      <div className={noPadding ? '' : 'px-xl py-xl'}>
        {children}
      </div>
      {footer && (
        <div className="px-xl py-xl bg-bg-main border-t border-border-subtle">
          {footer}
        </div>
      )}
    </div>
  );
};
