import React from 'react';
import { FiChevronLeft, FiChevronRight, FiCheck } from 'react-icons/fi';
import clsx from 'clsx';

interface MobileFormNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit?: () => void;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
  isSubmitting?: boolean;
  className?: string;
}

export const MobileFormNavigation: React.FC<MobileFormNavigationProps> = ({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSubmit,
  canGoNext = true,
  canGoPrevious = true,
  isSubmitting = false,
  className,
}) => {
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div
      className={clsx(
        'fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200',
        'px-4 py-3 sm:px-6',
        'flex items-center justify-between',
        'safe-area-inset-bottom', // For iOS devices with home indicator
        className
      )}
    >
      <button
        type="button"
        onClick={onPrevious}
        disabled={!canGoPrevious || currentStep === 0}
        className={clsx(
          'inline-flex items-center px-4 py-2 rounded-md',
          'text-sm font-medium transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
          canGoPrevious && currentStep > 0
            ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        )}
        aria-label="Previous step"
      >
        <FiChevronLeft className="mr-1 h-4 w-4" aria-hidden="true" />
        Previous
      </button>

      <div className="text-sm text-gray-600">
        Step {currentStep + 1} of {totalSteps}
      </div>

      {isLastStep && onSubmit ? (
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canGoNext || isSubmitting}
          className={clsx(
            'inline-flex items-center px-4 py-2 rounded-md',
            'text-sm font-medium transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500',
            canGoNext && !isSubmitting
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          )}
          aria-label="Submit form"
        >
          {isSubmitting ? (
            <>
              <span className="mr-2">Submitting...</span>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            </>
          ) : (
            <>
              Submit
              <FiCheck className="ml-1 h-4 w-4" aria-hidden="true" />
            </>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext || currentStep === totalSteps - 1}
          className={clsx(
            'inline-flex items-center px-4 py-2 rounded-md',
            'text-sm font-medium transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
            canGoNext && currentStep < totalSteps - 1
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          )}
          aria-label="Next step"
        >
          Next
          <FiChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};