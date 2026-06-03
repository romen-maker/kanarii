import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <div className={`min-h-screen bg-[#F9F7F1] pb-24 font-sans max-w-7xl mx-auto ${className}`}>
      {children}
    </div>
  );
}
