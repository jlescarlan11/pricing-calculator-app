import React from 'react';

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  children: React.ReactNode;
  title?: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
  noPadding?: boolean;
  interactive?: boolean;
  texture?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  className = '',
  footer,
  noPadding = false,
  interactive = false,
  texture = false,
  ...props
}) => {
  const baseClasses = 'bg-surface rounded-lg border border-border-subtle shadow-level-1 overflow-hidden relative transition-all duration-[400ms] ease-in-out';
  const interactiveClasses = interactive ? 'hover:shadow-level-2 hover:-translate-y-0.5 cursor-pointer' : '';
  
  return (
    <div className={`${baseClasses} ${interactiveClasses} ${className}`} {...props}>
      {texture && <div className="paper-texture absolute inset-0 opacity-30 pointer-events-none" />}
      
      {noPadding ? (
        <>
          {title && (
            <div className="p-lg md:p-xl pb-0">
               {typeof title === 'string' ? (
                <h3 className="font-serif text-xl font-semibold text-ink-900 mb-lg">{title}</h3>
              ) : (
                title
              )}
            </div>
          )}
          {children}
          {footer && (
             <div className="border-t border-border-subtle bg-bg-main/50 p-lg md:p-xl">
               {footer}
             </div>
          )}
        </>
      ) : (
        <div className="p-lg md:p-xl">
          {title && (
            <div className="mb-lg">
              {typeof title === 'string' ? (
                <h3 className="font-serif text-xl font-semibold text-ink-900">{title}</h3>
              ) : (
                title
              )}
            </div>
          )}
          
          {children}
          
          {footer && (
            <div className="mt-lg pt-lg border-t border-border-subtle">
              {footer}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
