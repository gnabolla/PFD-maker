import React, { forwardRef } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
import { FiAlertCircle } from 'react-icons/fi';
import clsx from 'clsx';

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
  registration?: UseFormRegisterReturn;
  showCharCount?: boolean;
  maxLength?: number;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, error, hint, registration, className, showCharCount, maxLength, ...props }, ref) => {
    const [charCount, setCharCount] = React.useState(0);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (showCharCount) {
        setCharCount(e.target.value.length);
      }
      registration?.onChange(e);
    };

    return (
      <div className="w-full">
        <label htmlFor={props.id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        <div className="relative">
          <textarea
            ref={ref}
            {...registration}
            {...props}
            onChange={handleChange}
            aria-invalid={!!error}
            aria-describedby={error ? `${props.id}-error` : hint ? `${props.id}-hint` : undefined}
            className={clsx(
              'block w-full rounded-md shadow-sm transition-colors duration-200',
              'px-3 py-2 text-gray-900 placeholder-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              'resize-y min-h-[80px]',
              error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
              className
            )}
          />
        </div>

        {(error || hint || showCharCount) && (
          <div className="mt-1 flex justify-between items-start">
            <div className="flex-1">
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
            {showCharCount && maxLength && (
              <span className={clsx(
                'text-sm ml-2',
                charCount > maxLength ? 'text-red-600' : 'text-gray-500'
              )}>
                {charCount}/{maxLength}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);

FormTextarea.displayName = 'FormTextarea';