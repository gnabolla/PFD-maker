import React from 'react';
import { Step } from './StepIndicator';
import clsx from 'clsx';

interface MobileStepIndicatorProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export const MobileStepIndicator: React.FC<MobileStepIndicatorProps> = ({
  steps,
  currentStep,
  className,
}) => {
  return (
    <div className={clsx('w-full', className)}>
      {/* Progress bar */}
      <div className="relative">
        <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-200">
          <div
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-300 ease-out"
            role="progressbar"
            aria-valuenow={(currentStep + 1) / steps.length * 100}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Form progress"
          />
        </div>
      </div>

      {/* Current step info */}
      <div className="mt-3 text-center">
        <p className="text-sm font-medium text-gray-900">
          {steps[currentStep].name}
        </p>
        {steps[currentStep].description && (
          <p className="mt-1 text-xs text-gray-500">
            {steps[currentStep].description}
          </p>
        )}
      </div>

      {/* Step dots for visual reference */}
      <div className="mt-4 flex justify-center space-x-2" role="tablist">
        {steps.map((step, idx) => (
          <button
            key={step.id}
            type="button"
            role="tab"
            aria-selected={idx === currentStep}
            aria-label={`Step ${idx + 1}: ${step.name}`}
            className={clsx(
              'w-2 h-2 rounded-full transition-all duration-200',
              idx === currentStep
                ? 'w-8 bg-blue-600'
                : idx < currentStep
                ? 'bg-blue-600'
                : 'bg-gray-300'
            )}
            disabled
          />
        ))}
      </div>
    </div>
  );
};