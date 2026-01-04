import React, { useId } from 'react';
import { AlertCircle, HelpCircle } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  helperText?: string;
  currency?: boolean;
  suffix?: React.ReactNode;
  tooltip?: React.ReactNode;
  inputClassName?: string;
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
  tooltip,
  className = '',
  inputClassName = '',
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
    <div className={`flex flex-col w-full ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <label 
          htmlFor={id} 
          className="text-sm font-medium text-ink-700 flex items-center gap-xs tracking-[0.01em]"
        >
          <span>
            {label}
            {required && <span className="text-rust ml-xs" aria-hidden="true">*</span>}
          </span>
          {tooltip && (
            <Tooltip content={tooltip}>
              <button
                type="button"
                className="text-ink-500 hover:text-clay cursor-help transition-colors p-0.5"
                aria-label={`More info about ${label}`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
          )}
        </label>
      </div>

      <div className="relative">
        {currency && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
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
            block w-full rounded-sm border tabular-nums
            py-[14px] sm:text-sm transition-all duration-200
            disabled:bg-surface-hover disabled:text-ink-500 disabled:cursor-not-allowed
            focus:ring-2 focus:ring-offset-0 focus:outline-hidden
            placeholder:text-ink-500 placeholder:italic
            ${currency ? 'pl-10' : 'pl-4'}
            ${suffix || error ? 'pr-10' : 'pr-4'}
            ${error 
              ? 'border-rust text-rust placeholder-rust/30 focus:border-rust focus:ring-rust/20' 
              : 'border-border-subtle bg-bg-main focus:border-clay focus:ring-clay/20'
            }
            ${inputClassName}
          `}
          {...props}
        />

        {suffix && !error && (
          <div className="absolute inset-y-0 right-0 pr-xs flex items-center">
            <div className="text-ink-500 sm:text-sm">
              {suffix}
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-y-0 right-0 pr-sm flex items-center pointer-events-none">
            <AlertCircle className="h-5 w-5 text-rust" aria-hidden="true" />
          </div>
        )}
      </div>

      {error ? (
        <p className="mt-xs text-[12px] text-rust flex items-center gap-xs" id={errorId} role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p className="mt-xs text-[12px] text-ink-500" id={helperId}>
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
