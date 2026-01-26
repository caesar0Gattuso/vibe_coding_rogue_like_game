import React from 'react';
import { cn } from '../../utils/cn';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, className }) => {
  return (
    <div 
      className={cn(
        "relative w-full h-full overflow-hidden bg-black text-white font-sans",
        "pb-safe", // Safe area for iOS home indicator
        className
      )}
    >
      {children}
    </div>
  );
};
