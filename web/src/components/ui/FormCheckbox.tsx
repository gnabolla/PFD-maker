import React, { forwardRef } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
import clsx from 'clsx';

interface FormCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
  registration?: UseFormRegisterReturn;
}

export const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ label, hint, error, registration, className, ...props }, ref) => {
    return (
      <div className="relative flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="checkbox"
            {...registration}
            {...props}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${props.id}-error` : hint ? `${props.id}-hint` : undefined
            }
            className={clsx(
              'h-4 w-4 rounded transition-colors duration-200',
              'focus:ring-2 focus:ring-offset-0',
              error
                ? 'text-red-600 border-red-300 focus:ring-red-500'
                : 'text-blue-600 border-gray-300 focus:ring-blue-500',
              className
            )}
          />
        </div>
        <div className="ml-3">
          <label
            htmlFor={props.id}
            className={clsx(
              'text-sm font-medium cursor-pointer',
              error ? 'text-red-600' : 'text-gray-700'
            )}
          >
            {label}
          </label>
          {(hint || error) && (
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
      </div>
    );
  }
);

FormCheckbox.displayName = 'FormCheckbox';