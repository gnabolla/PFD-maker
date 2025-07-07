import React, { useRef } from 'react';
import { FiPrinter, FiEye } from 'react-icons/fi';
import { useReactToPrint } from 'react-to-print';
import clsx from 'clsx';

interface PrintButtonProps {
  contentRef: React.RefObject<HTMLElement>;
  documentTitle?: string;
  onBeforePrint?: () => void;
  onAfterPrint?: () => void;
  showPreview?: boolean;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PrintButton: React.FC<PrintButtonProps> = ({
  contentRef,
  documentTitle = 'Personal Data Sheet',
  onBeforePrint,
  onAfterPrint,
  showPreview = false,
  variant = 'primary',
  size = 'md',
  className,
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);

  const handlePrint = useReactToPrint({
    content: () => contentRef.current,
    documentTitle,
    onBeforePrint,
    onAfterPrint,
  });

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-blue-500',
  };

  return (
    <>
      <button
        type="button"
        onClick={showPreview ? () => setIsPreviewOpen(true) : handlePrint}
        className={clsx(
          'inline-flex items-center justify-center font-medium rounded-md',
          'transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
      >
        {showPreview ? (
          <>
            <FiEye className="mr-2 h-4 w-4" aria-hidden="true" />
            Preview & Print
          </>
        ) : (
          <>
            <FiPrinter className="mr-2 h-4 w-4" aria-hidden="true" />
            Print
          </>
        )}
      </button>

      {/* Print Preview Modal */}
      {showPreview && isPreviewOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setIsPreviewOpen(false)}
            />

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Print Preview
                  </h3>
                  <button
                    onClick={() => setIsPreviewOpen(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <FiX className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 max-h-[70vh] overflow-auto">
                  <div className="bg-white p-8">
                    {contentRef.current && (
                      <div dangerouslySetInnerHTML={{ __html: contentRef.current.innerHTML }} />
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => {
                    handlePrint();
                    setIsPreviewOpen(false);
                  }}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  <FiPrinter className="mr-2 h-4 w-4" />
                  Print
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};