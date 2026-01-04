import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'soft';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  disabled,
  type = 'button',
  ...props
}) => {
  // Updated base styles: rounded-lg (8px), transition-all duration-400 ease-in-out, min touch target
  const baseStyles =
    'inline-flex items-center gap-sm justify-center rounded-lg font-medium transition-all duration-400 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer sm:w-auto w-full sm:flex-none active:scale-95 min-h-[44px] min-w-[44px]';

  const variants = {
    // Primary: 1px solid #A67B5B, text matching, transparent bg, hover bg rgba(166, 123, 91, 0.05), scale 1.02
    primary: 'border border-[#A67B5B] text-[#A67B5B] bg-transparent hover:bg-[rgba(166,123,91,0.05)] hover:scale-[1.02] focus-visible:ring-[#A67B5B]',
    // Secondary: 1px solid #D4D2CF, text #6B6761, transparent bg, hover scale 1.02
    secondary: 'border border-[#D4D2CF] text-[#6B6761] bg-transparent hover:bg-surface-hover hover:scale-[1.02] focus-visible:ring-[#D4D2CF]',
    // Success: 1px solid #7A8B73, text matching, transparent bg, hover scale 1.02
    success: 'border border-[#7A8B73] text-[#7A8B73] bg-transparent hover:bg-[rgba(122,139,115,0.05)] hover:scale-[1.02] focus-visible:ring-[#7A8B73]',
    // Danger: 1px solid #B85C38, text matching, transparent bg, hover scale 1.02
    danger: 'border border-[#B85C38] text-[#B85C38] bg-transparent hover:bg-[rgba(184,92,56,0.05)] hover:scale-[1.02] focus-visible:ring-[#B85C38]',
    // Ghost: maintained for backward compatibility but updated with transitions
    ghost: 'hover:bg-surface-hover text-ink-700 hover:text-ink-900 focus-visible:ring-border-base hover:scale-[1.02]',
    // Soft: maintained for backward compatibility
    soft: 'bg-moss/10 text-moss hover:bg-moss/20 focus-visible:ring-moss hover:scale-[1.02]',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs', // adjusted for proportion
    md: 'px-8 py-3 text-sm', // 12px vertical, 32px horizontal
    lg: 'px-10 py-4 text-base',
  };

  const variantStyles = variants[variant];
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
      {isLoading ? (
        <svg
          className="h-4 w-4 animate-spin"
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
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      {children}
    </button>
  );
};
