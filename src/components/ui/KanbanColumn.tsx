import React from 'react';
import { Plus } from 'lucide-react';

interface KanbanColumnProps {
  title: string;
  count: number;
  accentColor?: string;
  children: React.ReactNode;
  onActionClick?: () => void;
  className?: string;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  title,
  count,
  accentColor,
  children,
  onActionClick,
  className = ''
}) => {
  return (
    <div className={`flex flex-col min-w-[300px] w-full max-w-[350px] h-full ${className}`}>
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          {accentColor && (
            <div 
              className="w-1.5 h-1.5 rounded-full" 
              style={{ backgroundColor: accentColor }} 
            />
          )}
          <h3 className="text-sm font-semibold text-stone-700 tracking-tight">
            {title}
          </h3>
          <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-stone-100 text-stone-500 text-[10px] font-bold rounded-full border border-stone-200">
            {count}
          </span>
        </div>

        {onActionClick && (
          <button 
            onClick={onActionClick}
            className="p-1 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-md transition-all active:scale-90"
            title="Añadir nuevo"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Cards Container */}
      <div className="flex-1 flex flex-col gap-3 overflow-y-auto min-h-[150px] pb-6 px-1 custom-scrollbar">
        {children}
        
        {/* Empty state visual anchor */}
        {count === 0 && (
          <div className="h-24 border-2 border-dashed border-stone-100 rounded-xl flex items-center justify-center text-stone-300 text-xs italic">
            Sin elementos
          </div>
        )}
      </div>
    </div>
  );
};
