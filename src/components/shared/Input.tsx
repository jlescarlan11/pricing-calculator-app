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
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      <label 
        htmlFor={id} 
        className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center justify-between"
      >
        <span>
          {label}
          {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
        </span>
      </label>

      <div className="relative">
        {currency && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">₱</span>
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
            block w-full rounded-md shadow-sm border
            py-2 sm:text-sm transition-colors duration-200
            disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
            focus:ring-2 focus:ring-offset-0 focus:outline-hidden
            ${currency ? 'pl-7' : 'pl-3'}
            ${suffix ? 'pr-8' : 'pr-3'}
            ${error 
              ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
            }
          `}
          {...props}
        />

        {suffix && !error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">{suffix}</span>
          </div>
        )}

        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
          </div>
        )}
      </div>

      {error ? (
        <p className="mt-1 text-sm text-red-600 flex items-center gap-1" id={errorId} role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p className="mt-1 text-sm text-gray-500" id={helperId}>
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
