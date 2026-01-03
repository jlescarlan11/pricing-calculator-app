import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  className = '',
  footer,
}) => {
  return (
    <div className={`bg-surface rounded-xl border border-border-base overflow-hidden ${className}`}>
      {title && (
        <div className="px-lg py-md border-b border-border-subtle">
          {typeof title === 'string' ? (
            <h3 className="text-lg text-ink-900">{title}</h3>
          ) : (
            title
          )}
        </div>
      )}
      <div className="px-lg py-md">
        {children}
      </div>
      {footer && (
        <div className="px-lg py-md bg-bg-main border-t border-border-subtle">
          {footer}
        </div>
      )}
    </div>
  );
};
