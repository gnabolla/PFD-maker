import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import { ValidationError } from '../../types';
import clsx from 'clsx';

interface ValidationSummaryProps {
  errors: ValidationError[];
  title?: string;
  className?: string;
}

export const ValidationSummary: React.FC<ValidationSummaryProps> = ({
  errors,
  title = 'Please fix the following errors:',
  className,
}) => {
  if (errors.length === 0) return null;

  return (
    <div
      className={clsx(
        'rounded-md bg-red-50 border border-red-200 p-4',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <FiAlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">{title}</h3>
          <div className="mt-2 text-sm text-red-700">
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={`${error.field}-${index}`}>
                  <strong>{error.field}:</strong> {error.message}
                  {error.suggestion && (
                    <span className="block pl-5 text-red-600 italic">
                      Suggestion: {error.suggestion}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};