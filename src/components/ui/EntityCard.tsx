import React from 'react';
import { MoreVertical } from 'lucide-react';

export type EntityVariant = 'success' | 'warning' | 'info' | 'danger' | 'neutral' | 'primary';

export interface EntityMetadata {
  icon: React.ElementType;
  text: string;
  tooltip?: string;
}

export interface EntityTag {
  label: string;
  variant: EntityVariant;
}

export interface EntityAction {
  label: string;
  icon: React.ElementType;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

export interface EntityQuickAction {
  label: string;
  icon: React.ElementType;
  onClick: () => void;
  variant?: 'default' | 'danger' | 'success' | 'warning' | 'info' | 'primary';
  showLabel?: boolean;
}

interface EntityCardProps {
  id: string;
  title: string;
  subtitle?: string;
  status: {
    label: string;
    variant: EntityVariant;
    icon?: React.ElementType;
  };
  metadata?: EntityMetadata[];
  tags?: EntityTag[];
  actions?: EntityAction[];
  quickActions?: EntityQuickAction[];
  onClick?: () => void;
  className?: string;
}

export const EntityCard: React.FC<EntityCardProps> = ({
  title,
  subtitle,
  status,
  metadata = [],
  tags = [],
  actions = [],
  quickActions = [],
  onClick,
  className = ''
}) => {
  const [showActions, setShowActions] = React.useState(false);
  const actionsRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) {
        setShowActions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getVariantClasses = (variant: EntityVariant) => {
    const classes = {
      success: 'bg-[var(--color-success-highlight)] text-[var(--color-success)]',
      warning: 'bg-[var(--color-warning-highlight)] text-[var(--color-warning)]',
      info: 'bg-[var(--color-primary-highlight)] text-[var(--color-primary)]',
      primary: 'bg-[var(--color-primary-highlight)] text-[var(--color-primary)]',
      danger: 'bg-[var(--color-error-highlight)] text-[var(--color-error)]',
      neutral: 'bg-[var(--color-surface-offset)] text-[var(--color-text-muted)]',
    };
    return classes[variant] || classes.neutral;
  };

  return (
    <div 
      onClick={onClick}
      className={`
        group relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-5 shadow-sm
        hover:border-stone-300 hover:shadow-md transition-all duration-200 cursor-pointer
        ${className}
      `}
    >
      {/* Header: Status & Actions */}
      <div className="flex justify-between items-start mb-4">
        <div className={`
          flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider
          ${getVariantClasses(status.variant)}
        `}>
          {status.icon && <status.icon className="w-3.5 h-3.5" />}
          <span>{status.label}</span>
        </div>

        {actions.length > 0 && (
          <div className="relative" ref={actionsRef}>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowActions(!showActions); }}
              className="p-1.5 text-[var(--color-text-faint)] hover:text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] rounded-md transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {showActions && (
              <div className="absolute right-0 mt-1 w-44 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl z-10 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                {actions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); action.onClick(); setShowActions(false); }}
                    className={`
                      w-full flex items-center gap-2 px-4 py-2.5 text-xs text-left transition-colors
                      ${action.variant === 'danger' ? 'text-[var(--color-error)] hover:bg-[var(--color-error)]/5' : 'text-[var(--color-text)] hover:bg-[var(--color-surface-2)]'}
                    `}
                  >
                    <action.icon className="w-3.5 h-3.5" />
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Body: Title & Subtitle */}
      <div className="mb-4">
        <h3 className="text-lg font-medium text-[var(--color-text)] leading-tight group-hover:text-[var(--color-primary)] transition-colors">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-[var(--color-text-muted)] mt-2 line-clamp-2 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {/* Metadata Chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {metadata.map((item, idx) => (
          <div 
            key={idx} 
            className="flex items-center gap-1 bg-[var(--color-surface-2)] px-2 py-1 rounded text-xs font-medium text-[var(--color-text-muted)]" 
            title={item.tooltip}
          >
            <item.icon className="w-3.5 h-3.5 text-[var(--color-text-faint)]" />
            <span>{item.text}</span>
          </div>
        ))}
      </div>

      {/* Quick Actions Bar */}
      {quickActions.length > 0 && (
        <div className="mt-5 pt-4 border-t border-[var(--color-surface-2)] flex justify-between items-center">
          <div className="flex items-center gap-1 w-full">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.stopPropagation(); action.onClick(); }}
                className={`
                  flex items-center gap-1.5 transition-all active:scale-95
                  ${action.showLabel ? 'text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)]' : 'p-3 text-[var(--color-text-faint)] hover:text-[var(--color-text-muted)]'}
                  ${action.variant === 'danger' && !action.showLabel ? 'text-[var(--color-error)]/70 hover:text-[var(--color-error)]' : ''}
                `}
                title={action.label}
              >
                <action.icon className="w-3.5 h-3.5" />
                {action.showLabel && <span>{action.label}</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tags Section */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {tags.map((tag, idx) => (
            <span 
              key={idx}
              className={`
                px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                ${getVariantClasses(tag.variant)}
              `}
            >
              {tag.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
