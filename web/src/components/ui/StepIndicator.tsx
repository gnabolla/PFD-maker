import React from 'react';
import { FiCheck } from 'react-icons/fi';
import clsx from 'clsx';

export interface Step {
  id: string;
  name: string;
  description?: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  onStepClick,
  orientation = 'horizontal',
  className,
}) => {
  const isClickable = (stepIndex: number) => {
    return onStepClick && stepIndex < currentStep;
  };

  return (
    <nav
      aria-label="Progress"
      className={clsx(
        orientation === 'horizontal' ? 'flex items-center' : 'flex flex-col',
        className
      )}
    >
      {steps.map((step, stepIdx) => {
        const isComplete = stepIdx < currentStep;
        const isCurrent = stepIdx === currentStep;
        const isLast = stepIdx === steps.length - 1;

        return (
          <div
            key={step.id}
            className={clsx(
              orientation === 'horizontal'
                ? 'flex items-center'
                : 'flex flex-col flex-1'
            )}
          >
            <div className="relative flex items-center group">
              <span
                className={clsx(
                  'flex items-center',
                  isClickable(stepIdx) && 'cursor-pointer'
                )}
                onClick={() => isClickable(stepIdx) && onStepClick!(stepIdx)}
              >
                <span
                  className={clsx(
                    'relative z-10 w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-200',
                    isComplete
                      ? 'bg-blue-600 group-hover:bg-blue-700'
                      : isCurrent
                      ? 'bg-blue-600'
                      : 'bg-gray-300',
                    isClickable(stepIdx) && 'group-hover:bg-blue-700'
                  )}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isComplete ? (
                    <FiCheck className="w-5 h-5 text-white" aria-hidden="true" />
                  ) : (
                    <span
                      className={clsx(
                        'text-sm font-medium',
                        isCurrent || isComplete ? 'text-white' : 'text-gray-500'
                      )}
                    >
                      {stepIdx + 1}
                    </span>
                  )}
                </span>
                
                <div className={clsx(
                  'ml-3',
                  orientation === 'vertical' && 'min-w-0'
                )}>
                  <p
                    className={clsx(
                      'text-sm font-medium',
                      isCurrent ? 'text-blue-600' : isComplete ? 'text-gray-900' : 'text-gray-500',
                      isClickable(stepIdx) && 'group-hover:text-blue-700'
                    )}
                  >
                    {step.name}
                  </p>
                  {step.description && orientation === 'vertical' && (
                    <p className="text-sm text-gray-500 mt-1">{step.description}</p>
                  )}
                </div>
              </span>
            </div>

            {!isLast && (
              <div
                className={clsx(
                  orientation === 'horizontal'
                    ? 'ml-4 flex-1 h-0.5'
                    : 'mt-4 ml-4 w-0.5 flex-1 min-h-[2rem]',
                  isComplete ? 'bg-blue-600' : 'bg-gray-300'
                )}
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </nav>
  );
};