import React from 'react';
import { ChevronLeft, ArrowRight, Archive, CheckCircle2 } from 'lucide-react';

export type EntityVariant = 'success' | 'warning' | 'info' | 'danger' | 'neutral' | 'primary';

export interface EntityMetadata {
  icon: React.ElementType;
  text: string;
  tooltip?: string;
  className?: string;
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
  quickActions?: EntityQuickAction[];
  onStateChange?: {
    prev?: () => void;
    next?: () => void;
    nextLabel?: string;
    isCompleted?: boolean;
  };
  onArchive?: () => void;
  onUnarchive?: () => void;
  onClick?: () => void;
  onActionClick?: () => void;
  actionLabel?: string;
  className?: string;
}

export const EntityCard: React.FC<EntityCardProps> = ({
  title,
  subtitle,
  status,
  metadata = [],
  tags = [],
  quickActions = [],
  onStateChange,
  onArchive,
  onUnarchive,
  onClick,
  className = ''
}) => {

  const getVariantClasses = (variant: EntityVariant) => {
    const classes = {
      success: 'bg-status-success-bg text-status-success-text',
      warning: 'bg-status-warning-bg text-status-warning-text',
      info: 'bg-status-info-bg text-status-info-text',
      primary: 'bg-status-info-bg text-status-info-text',
      danger: 'bg-status-danger-bg text-status-danger-text',
      neutral: 'bg-status-neutral-bg text-stone-700',
    };
    return classes[variant] || classes.neutral;
  };

  return (
    <div 
      onClick={onClick}
      className={`
        group relative bg-white border border-border rounded-3xl p-5 shadow-sm
        hover:border-border-hover hover:shadow-md transition-all duration-200 cursor-pointer
        ${className}
      `}
    >
      {/* Absolute Completion Icon */}
      {onStateChange?.isCompleted && (
        <div className="absolute top-0 right-0 p-4">
          <CheckCircle2 className="w-8 h-8 text-status-success-bg" />
        </div>
      )}

      {/* Header: Status & Actions */}
      <div className="flex justify-between items-start mb-4">
        <div className={`
          flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider
          ${getVariantClasses(status.variant)}
        `}>
          {status.icon && <status.icon className="w-3.5 h-3.5" />}
          <span>{status.label}</span>
        </div>
      </div>

      {/* Body: Title & Subtitle */}
      <div className="mb-4">
        <h3 className="text-lg font-medium text-stone-800 leading-tight transition-colors">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-stone-500 mt-2 line-clamp-2 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {/* Metadata Chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {metadata.map((item, idx) => (
          <div 
            key={idx} 
            className={`flex items-center gap-1 bg-bg-page px-2 py-1 rounded text-xs font-medium text-stone-500 ${item.className || ''}`} 
            title={item.tooltip}
          >
            <item.icon className={`w-3.5 h-3.5 ${item.className ? '' : 'text-forest-mid'}`} />
            <span>{item.text}</span>
          </div>
        ))}
      </div>

      {/* Quick Actions Bar - Unified TareaCard Layout */}
      {(quickActions.length > 0 || onStateChange || onArchive || onUnarchive) && (
        <div className="mt-5 pt-4 border-t border-border flex justify-between items-center">
          
          {/* Izquierda: Flujo de Trabajo (Estado + showLabel actions) */}
          <div className="flex items-center gap-1">
            {onUnarchive ? (
              <button
                onClick={(e) => { e.stopPropagation(); onUnarchive(); }}
                className="text-xs font-medium text-stone-400 hover:text-stone-600 transition-colors p-3 -ml-3"
              >
                Desarchivar
              </button>
            ) : onStateChange?.isCompleted ? (
              <span className="text-xs text-stone-400 px-3">✓ Completado</span>
            ) : (
              <>
                {onStateChange?.prev && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onStateChange.prev!(); }}
                    className="flex items-center justify-center text-stone-400 hover:text-stone-600 transition-colors p-3 -ml-3"
                    title="Retroceder"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}
                {onStateChange?.next && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onStateChange.next!(); }}
                    className={`flex items-center gap-1.5 text-xs font-medium text-forest-deep hover:text-text-ink transition-colors p-3 ${!onStateChange.prev ? '-ml-3' : ''}`}
                  >
                    {onStateChange.nextLabel || 'Avanzar'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </>
            )}

            {quickActions
              .filter(a => a.showLabel)
              .map((action, idx, filtered) => {
                const isFirst = !onUnarchive && !onStateChange?.prev && !onStateChange?.next && idx === 0;
                return (
                  <button
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); action.onClick(); }}
                    className={`flex items-center gap-1.5 text-xs font-medium text-forest-deep hover:text-text-ink transition-colors p-3 ${isFirst ? '-ml-3' : ''}`}
                    title={action.label}
                  >
                    <action.icon className="w-3.5 h-3.5" />
                    <span>{action.label}</span>
                  </button>
                );
            })}
          </div>

          {/* Derecha: Herramientas (Archivo + icon-only actions) */}
          <div className="flex items-center gap-1">
            {onArchive && (
              <button
                onClick={(e) => { e.stopPropagation(); onArchive(); }}
                className={`flex items-center justify-center text-forest-deep hover:text-text-ink transition-colors p-3 ${quickActions.filter(a => !a.showLabel).length === 0 ? '-mr-3' : ''}`}
                title="Archivar"
              >
                <Archive className="w-4 h-4" />
              </button>
            )}

            {quickActions
              .filter(a => !a.showLabel)
              .map((action, idx, filtered) => {
                const isLast = idx === filtered.length - 1;
                return (
                  <button
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); action.onClick(); }}
                    className={`flex items-center justify-center transition-colors p-3
                      ${action.variant === 'danger' 
                        ? 'text-forest-deep hover:text-red-600' 
                        : 'text-forest-deep hover:text-text-ink'}
                      ${isLast ? '-mr-3' : ''}
                    `}
                    title={action.label}
                  >
                    <action.icon className="w-4 h-4" />
                  </button>
                );
            })}
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
