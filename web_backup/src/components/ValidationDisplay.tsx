import React from 'react';

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
  suggestion?: string;
  code?: string;
}

interface ValidationDisplayProps {
  errors: ValidationError[];
  onFieldClick?: (field: string) => void;
}

const ValidationDisplay: React.FC<ValidationDisplayProps> = ({ errors, onFieldClick }) => {
  if (errors.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-green-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-green-800">No validation errors</p>
            <p className="text-sm text-green-700 mt-1">
              Your PDS data meets all requirements and is ready for submission.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const errorCount = errors.filter((e) => e.severity === 'error').length;
  const warningCount = errors.filter((e) => e.severity === 'warning').length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-white border border-gray-200 rounded-md p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Validation Summary</h3>
        <div className="flex gap-4 text-sm">
          {errorCount > 0 && (
            <span className="text-red-600">
              {errorCount} {errorCount === 1 ? 'Error' : 'Errors'}
            </span>
          )}
          {warningCount > 0 && (
            <span className="text-yellow-600">
              {warningCount} {warningCount === 1 ? 'Warning' : 'Warnings'}
            </span>
          )}
        </div>
      </div>

      {/* Error List */}
      <div className="space-y-2">
        {errors.map((error, index) => (
          <div
            key={`${error.field}-${index}`}
            className={`border rounded-md p-4 ${
              error.severity === 'error'
                ? 'bg-red-50 border-red-200'
                : 'bg-yellow-50 border-yellow-200'
            }`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {error.severity === 'error' ? (
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <h4
                    className={`text-sm font-medium ${
                      error.severity === 'error' ? 'text-red-800' : 'text-yellow-800'
                    } ${onFieldClick ? 'cursor-pointer hover:underline' : ''}`}
                    onClick={() => onFieldClick?.(error.field)}
                  >
                    {error.field}
                  </h4>
                  {error.code && (
                    <span
                      className={`text-xs ${
                        error.severity === 'error' ? 'text-red-600' : 'text-yellow-600'
                      }`}
                    >
                      {error.code}
                    </span>
                  )}
                </div>
                <p
                  className={`text-sm mt-1 ${
                    error.severity === 'error' ? 'text-red-700' : 'text-yellow-700'
                  }`}
                >
                  {error.message}
                </p>
                {error.suggestion && (
                  <p
                    className={`text-sm mt-2 ${
                      error.severity === 'error' ? 'text-red-600' : 'text-yellow-600'
                    }`}
                  >
                    <span className="font-medium">Suggestion:</span> {error.suggestion}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ValidationDisplay;