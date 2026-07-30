import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  variant?: 'scroll' | 'full';
  className?: string;
}

export function PageContainer({ 
  children, 
  variant = 'scroll', 
  className = '' 
}: PageContainerProps) {
  if (variant === 'full') {
    return (
      <div className={`flex-1 min-h-0 flex flex-col overflow-hidden bg-[#F9F7F1] font-sans ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div className={`flex-1 min-w-0 bg-[#F9F7F1] pb-20 md:pb-8 font-sans max-w-7xl w-full mx-auto ${className}`}>
      {children}
    </div>
  );
}

