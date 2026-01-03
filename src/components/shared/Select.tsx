import React, { useId } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  label: string;
  value: string | number;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  value,
  onChange,
  options,
  error,
  helperText,
  required = false,
  disabled = false,
  className = '',
  placeholder,
  ...props
}) => {
  const id = useId();
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;
  
  const describedBy = error ? errorId : helperText ? helperId : undefined;

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
        <select
          id={id}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={`
            block w-full rounded-md shadow-sm border appearance-none
            py-2 pl-3 pr-10 sm:text-sm transition-colors duration-200
            disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
            focus:ring-2 focus:ring-offset-0 focus:outline-hidden
            ${error 
              ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
            }
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDown className={`h-5 w-5 ${error ? 'text-red-500' : 'text-gray-400'}`} aria-hidden="true" />
        </div>
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
};
