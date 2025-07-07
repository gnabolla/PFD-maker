import React from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
import clsx from 'clsx';

interface RadioOption {
  value: string;
  label: string;
  hint?: string;
}

interface FormRadioGroupProps {
  name: string;
  label: string;
  options: RadioOption[];
  error?: string;
  hint?: string;
  registration?: UseFormRegisterReturn;
  required?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

export const FormRadioGroup: React.FC<FormRadioGroupProps> = ({
  name,
  label,
  options,
  error,
  hint,
  registration,
  required,
  orientation = 'vertical',
}) => {
  return (
    <fieldset className="w-full">
      <legend className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </legend>

      <div
        className={clsx(
          'space-y-2',
          orientation === 'horizontal' && 'sm:flex sm:space-y-0 sm:space-x-6'
        )}
        role="radiogroup"
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
      >
        {options.map((option) => (
          <label
            key={option.value}
            className={clsx(
              'relative flex items-start cursor-pointer',
              orientation === 'horizontal' && 'sm:items-center'
            )}
          >
            <div className="flex items-center h-5">
              <input
                {...registration}
                type="radio"
                value={option.value}
                aria-describedby={option.hint ? `${name}-${option.value}-hint` : undefined}
                className={clsx(
                  'h-4 w-4 transition-colors duration-200',
                  'focus:ring-2 focus:ring-offset-0',
                  error
                    ? 'text-red-600 border-red-300 focus:ring-red-500'
                    : 'text-blue-600 border-gray-300 focus:ring-blue-500'
                )}
              />
            </div>
            <div className="ml-3">
              <span className="block text-sm font-medium text-gray-700">
                {option.label}
              </span>
              {option.hint && (
                <span
                  id={`${name}-${option.value}-hint`}
                  className="block text-sm text-gray-500"
                >
                  {option.hint}
                </span>
              )}
            </div>
          </label>
        ))}
      </div>

      {(error || hint) && (
        <div className="mt-2">
          {error && (
            <p id={`${name}-error`} className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          {!error && hint && (
            <p id={`${name}-hint`} className="text-sm text-gray-500">
              {hint}
            </p>
          )}
        </div>
      )}
    </fieldset>
  );
};