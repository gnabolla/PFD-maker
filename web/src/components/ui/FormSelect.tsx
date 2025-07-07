import React, { forwardRef } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
import { FiAlertCircle, FiChevronDown } from 'react-icons/fi';
import clsx from 'clsx';

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  hint?: string;
  registration?: UseFormRegisterReturn;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, error, hint, registration, options, placeholder = 'Select an option', className, ...props }, ref) => {
    return (
      <div className="w-full">
        <label htmlFor={props.id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        <div className="relative">
          <select
            ref={ref}
            {...registration}
            {...props}
            aria-invalid={!!error}
            aria-describedby={error ? `${props.id}-error` : hint ? `${props.id}-hint` : undefined}
            className={clsx(
              'block w-full rounded-md shadow-sm transition-colors duration-200',
              'px-3 py-2 pr-10 text-gray-900',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              'appearance-none bg-white',
              error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
              className
            )}
          >
            <option value="" disabled>
              {placeholder}
            </option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            {error ? (
              <FiAlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
            ) : (
              <FiChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
            )}
          </div>
        </div>

        {(error || hint) && (
          <div className="mt-1">
            {error && (
              <p id={`${props.id}-error`} className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            {!error && hint && (
              <p id={`${props.id}-hint`} className="text-sm text-gray-500">
                {hint}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

FormSelect.displayName = 'FormSelect';