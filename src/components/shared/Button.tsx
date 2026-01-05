import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'soft' | 'dashed';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  dashed?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  dashed = false,
  disabled,
  type = 'button',
  ...props
}) => {
  // Updated base styles: rounded-xl (12px), transition-all duration-400 ease-in-out, min touch target
  const baseStyles =
    'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-400 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer sm:w-auto w-full sm:flex-none active:scale-95 min-h-[44px] min-w-[44px]';

  const variants = {
    // Primary: Solid Clay background, white text. Use for 'Calculate', 'Save'.
    primary:
      'bg-clay text-white shadow-level-1 hover:bg-clay/90 hover:shadow-level-2 hover:scale-[1.02] focus-visible:ring-clay',
    // Secondary: Surface background, subtle border. Use for 'Add Ingredient' or secondary actions.
    secondary:
      'border border-border-base bg-surface text-ink-700 hover:bg-surface-hover hover:border-border-base hover:scale-[1.02] focus-visible:ring-border-base',
    // Success: Solid Moss background, white text.
    success:
      'bg-moss text-white shadow-level-1 hover:bg-moss/90 hover:shadow-level-2 hover:scale-[1.02] focus-visible:ring-moss',
    // Danger: Solid Rust background, white text. Use for 'Delete' or critical actions.
    danger:
      'bg-rust text-white shadow-level-1 hover:bg-rust/90 hover:shadow-level-2 hover:scale-[1.02] focus-visible:ring-rust',
    // Ghost: maintained for backward compatibility but updated with transitions
    ghost:
      'hover:bg-surface-hover text-ink-700 hover:text-ink-900 focus-visible:ring-border-base hover:scale-[1.02]',
    // Soft: maintained for backward compatibility
    soft: 'bg-moss/10 text-moss hover:bg-moss/20 focus-visible:ring-moss hover:scale-[1.02]',
    // Dashed: Wabi-sabi style for Add actions
    dashed:
      'border-2 border-dashed border-border-base text-ink-700 bg-transparent hover:border-clay hover:text-clay hover:bg-clay/5 transition-all duration-300',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs', // adjusted for proportion
    md: 'px-8 py-3 text-sm', // 12px vertical, 32px horizontal
    lg: 'px-10 py-4 text-base',
  };

  const variantStyles = dashed ? variants.dashed : variants[variant];
  const sizeStyles = sizes[size];

  return (
    <button
      type={type}
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
      disabled={disabled || isLoading}
      aria-disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="mr-2 h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};