import React, { useState } from 'react';
import { FiHelpCircle } from 'react-icons/fi';
import clsx from 'clsx';

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 -mt-1',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 -mb-1 rotate-180',
    left: 'left-full top-1/2 transform -translate-y-1/2 -ml-1 -rotate-90',
    right: 'right-full top-1/2 transform -translate-y-1/2 -mr-1 rotate-90',
  };

  return (
    <div className={clsx('relative inline-block', className)}>
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className="cursor-help"
        aria-describedby={isVisible ? 'tooltip' : undefined}
      >
        {children || (
          <FiHelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600" />
        )}
      </div>
      
      {isVisible && (
        <div
          id="tooltip"
          role="tooltip"
          className={clsx(
            'absolute z-10 px-3 py-2 text-sm text-white bg-gray-900 rounded-md whitespace-nowrap',
            'shadow-lg pointer-events-none',
            'animate-in fade-in-0 zoom-in-95',
            positionClasses[position]
          )}
        >
          {content}
          <div
            className={clsx(
              'absolute w-2 h-2 bg-gray-900 transform rotate-45',
              arrowClasses[position]
            )}
          />
        </div>
      )}
    </div>
  );
};