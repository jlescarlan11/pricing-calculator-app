import React, { useId } from 'react';
import { AlertCircle } from 'lucide-react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  helperText?: string;
  currency?: boolean;
  suffix?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  value,
  onChange,
  type = 'text',
  error,
  helperText,
  required = false,
  placeholder,
  disabled = false,
  currency = false,
  suffix,
  className = '',
  ...props
}, ref) => {
  const id = useId();
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;
  
  const describedBy = error ? errorId : helperText ? helperId : undefined;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent typing negative sign for number inputs
    if (type === 'number' && e.key === '-') {
      e.preventDefault();
    }
  };

  return (
    <div className={`flex flex-col gap-xs w-full ${className}`}>
      <label 
        htmlFor={id} 
        className="text-sm font-medium text-ink-700 flex items-center justify-between"
      >
        <span>
          {label}
          {required && <span className="text-rust ml-xs" aria-hidden="true">*</span>}
        </span>
      </label>

      <div className="relative">
        {currency && (
          <div className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none">
            <span className="text-ink-500 sm:text-sm">₱</span>
          </div>
        )}
        
        <input
          ref={ref}
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          onKeyDown={handleKeyDown}
          min={type === 'number' ? 0 : undefined}
          className={`
            block w-full rounded-md border
            py-sm sm:text-sm transition-all duration-200
            disabled:bg-surface-hover disabled:text-ink-500 disabled:cursor-not-allowed
            focus:ring-2 focus:ring-offset-0 focus:outline-hidden
            ${currency ? 'pl-lg' : 'pl-sm'}
            ${suffix ? 'pr-xl' : 'pr-sm'}
            ${error 
              ? 'border-rust/50 text-rust placeholder-rust/30 focus:border-rust focus:ring-rust/20' 
              : 'border-border-base bg-bg-main focus:border-clay focus:ring-clay/20'
            }
          `}
          {...props}
        />

        {suffix && !error && (
          <div className="absolute inset-y-0 right-0 pr-sm flex items-center pointer-events-none">
            <span className="text-ink-500 sm:text-sm">{suffix}</span>
          </div>
        )}

        {error && (
          <div className="absolute inset-y-0 right-0 pr-sm flex items-center pointer-events-none">
            <AlertCircle className="h-5 w-5 text-rust" aria-hidden="true" />
          </div>
        )}
      </div>

      {error ? (
        <p className="mt-xs text-sm text-rust flex items-center gap-xs" id={errorId} role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p className="mt-xs text-sm text-ink-500" id={helperId}>
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
