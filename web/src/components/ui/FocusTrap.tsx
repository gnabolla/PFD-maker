import React from 'react';
import FocusTrapReact from 'focus-trap-react';

interface FocusTrapProps {
  children: React.ReactNode;
  active?: boolean;
  paused?: boolean;
  className?: string;
}

export const FocusTrap: React.FC<FocusTrapProps> = ({
  children,
  active = true,
  paused = false,
  className,
}) => {
  return (
    <FocusTrapReact
      active={active}
      paused={paused}
      focusTrapOptions={{
        allowOutsideClick: true,
        escapeDeactivates: true,
        fallbackFocus: '#focus-trap-fallback',
      }}
    >
      <div className={className}>
        <div id="focus-trap-fallback" tabIndex={-1} className="sr-only">
          Focus trap fallback
        </div>
        {children}
      </div>
    </FocusTrapReact>
  );
};