import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export type StatusVariant = 'success' | 'warning' | 'info' | 'danger' | 'neutral';

export interface StatusOption {
  value: string;
  label: string;
  variant: StatusVariant;
  icon?: React.ElementType;
}

interface StatusMenuProps {
  currentStatus: string;
  options: StatusOption[];
  onChange: (newValue: string) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusMenu: React.FC<StatusMenuProps> = ({
  currentStatus,
  options,
  onChange,
  disabled = false,
  size = 'md',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const currentOption = options.find(opt => opt.value === currentStatus) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getVariantStyles = (variant: StatusVariant) => {
    const styles = {
      success: 'text-success bg-success/10 border-success/20',
      warning: 'text-warning bg-warning/10 border-warning/20',
      info: 'text-info bg-info/10 border-info/20',
      danger: 'text-danger bg-danger/10 border-danger/20',
      neutral: 'text-neutral bg-neutral/10 border-neutral/20',
    };
    return styles[variant] || styles.neutral;
  };

  const handleSelect = (value: string) => {
    if (disabled) return;
    onChange(value);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={menuRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 rounded-lg border transition-all duration-200
          ${size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'}
          ${getVariantStyles(currentOption.variant)}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-95 active:scale-95 cursor-pointer'}
          font-bold uppercase tracking-wider
        `}
      >
        {currentOption.icon && <currentOption.icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
        <span>{currentOption.label}</span>
        <ChevronDown className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl bg-white shadow-xl ring-1 ring-black/5 focus:outline-none z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`
                  flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors
                  ${currentStatus === option.value ? 'bg-stone-50 text-stone-900' : 'text-stone-600 hover:bg-stone-50'}
                `}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getVariantStyles(option.variant).split(' ')[1]}`} />
                  <span className={currentStatus === option.value ? 'font-semibold' : 'font-normal'}>
                    {option.label}
                  </span>
                </div>
                {currentStatus === option.value && <Check className="w-4 h-4 text-stone-400" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
