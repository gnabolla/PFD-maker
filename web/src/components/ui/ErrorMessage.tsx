import React from 'react';
import { FiAlertCircle, FiX } from 'react-icons/fi';
import clsx from 'clsx';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onDismiss?: () => void;
  variant?: 'error' | 'warning' | 'info';
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title,
  message,
  onDismiss,
  variant = 'error',
  className,
}) => {
  const variantClasses = {
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const iconClasses = {
    error: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400',
  };

  return (
    <div
      className={clsx(
        'rounded-md border p-4',
        variantClasses[variant],
        className
      )}
      role="alert"
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <FiAlertCircle
            className={clsx('h-5 w-5', iconClasses[variant])}
            aria-hidden="true"
          />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium mb-1">{title}</h3>
          )}
          <p className="text-sm">{message}</p>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className={clsx(
              'ml-3 inline-flex rounded-md p-1.5',
              'hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2',
              variant === 'error' && 'hover:bg-red-600 focus:ring-red-600',
              variant === 'warning' && 'hover:bg-yellow-600 focus:ring-yellow-600',
              variant === 'info' && 'hover:bg-blue-600 focus:ring-blue-600'
            )}
            aria-label="Dismiss"
          >
            <FiX className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};