import React from 'react';
import clsx from 'clsx';

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export const SkipLink: React.FC<SkipLinkProps> = ({
  href,
  children,
  className,
}) => {
  return (
    <a
      href={href}
      className={clsx(
        'sr-only focus:not-sr-only',
        'absolute top-0 left-0 z-50',
        'bg-blue-600 text-white',
        'px-4 py-2 rounded-md',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
        className
      )}
    >
      {children}
    </a>
  );
};