import React, { useEffect, useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import clsx from 'clsx';

interface HighContrastToggleProps {
  className?: string;
}

export const HighContrastToggle: React.FC<HighContrastToggleProps> = ({
  className,
}) => {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    // Check localStorage for saved preference
    const savedPreference = localStorage.getItem('highContrast');
    if (savedPreference === 'true') {
      setIsHighContrast(true);
      document.documentElement.classList.add('high-contrast');
    }
  }, []);

  const toggleHighContrast = () => {
    const newValue = !isHighContrast;
    setIsHighContrast(newValue);
    
    if (newValue) {
      document.documentElement.classList.add('high-contrast');
      localStorage.setItem('highContrast', 'true');
    } else {
      document.documentElement.classList.remove('high-contrast');
      localStorage.setItem('highContrast', 'false');
    }
  };

  return (
    <button
      type="button"
      onClick={toggleHighContrast}
      aria-label={isHighContrast ? 'Disable high contrast mode' : 'Enable high contrast mode'}
      aria-pressed={isHighContrast}
      className={clsx(
        'inline-flex items-center px-3 py-2 rounded-md',
        'text-sm font-medium transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
        isHighContrast
          ? 'bg-black text-white border-2 border-white'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
        className
      )}
    >
      {isHighContrast ? (
        <>
          <FiEyeOff className="mr-2 h-4 w-4" aria-hidden="true" />
          Normal Contrast
        </>
      ) : (
        <>
          <FiEye className="mr-2 h-4 w-4" aria-hidden="true" />
          High Contrast
        </>
      )}
    </button>
  );
};