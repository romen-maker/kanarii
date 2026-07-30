import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  helpNode?: React.ReactNode;
  hideRightActions?: boolean;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  actions,
  helpNode,
  hideRightActions = false,
  className = '',
}: PageHeaderProps) {
  return (
    <div className={`bg-[#4A4E4D] pt-6 md:pt-8 pb-6 px-6 text-[#F9F7F1] shadow-md relative md:sticky md:top-14 z-20 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 mb-2">
          {Icon && <Icon className="w-8 h-8 text-[#D4C3A3] shrink-0" />}
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-3xl text-[#F9F7F1]">{title}</h1>
            {helpNode}
          </div>
        </div>
        {!hideRightActions && actions && (
          <div className="flex items-center shrink-0">
            {actions}
          </div>
        )}
      </div>
      {subtitle && (
        <p className="text-[#D4C3A3] text-sm font-medium tracking-wide">
          {subtitle}
        </p>
      )}
    </div>
  );
}
