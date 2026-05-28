import React, { useState, KeyboardEvent } from 'react';
import { Plus, X } from 'lucide-react';

interface TagArrayEditorProps {
  value?: string[];
  onChange: (value: string[]) => void;
  label?: string;
  placeholder?: string;
  colorScheme?: 'green' | 'blue' | 'orange' | 'purple';
  disabled?: boolean;
  helperText?: string;
}

export function TagArrayEditor({
  value = [],
  onChange,
  label,
  placeholder = 'Añadir elemento...',
  colorScheme = 'blue',
  disabled = false,
  helperText
}: TagArrayEditorProps) {
  const [inputValue, setInputValue] = useState('');

  // Estilos basados en el esquema de color
  const schemes = {
    green: {
      tag: 'bg-emerald-50 text-stone-900 border-emerald-200 dark:bg-emerald-950/30 dark:text-stone-100 dark:border-emerald-800/60',
      removeBtn: 'text-emerald-500 hover:bg-emerald-100 hover:text-emerald-900 dark:hover:bg-emerald-900/50 dark:hover:text-emerald-200',
      inputFocus: 'focus-within:border-emerald-500 focus-within:ring-emerald-500/20',
      addBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500/20',
    },
    blue: {
      tag: 'bg-sky-50 text-stone-900 border-sky-200 dark:bg-sky-950/30 dark:text-stone-100 dark:border-sky-800/60',
      removeBtn: 'text-sky-500 hover:bg-sky-100 hover:text-sky-900 dark:hover:bg-sky-900/50 dark:hover:text-sky-200',
      inputFocus: 'focus-within:border-sky-500 focus-within:ring-sky-500/20',
      addBtn: 'bg-sky-600 hover:bg-sky-700 text-white focus:ring-sky-500/20',
    },
    orange: {
      tag: 'bg-amber-50 text-stone-900 border-amber-200 dark:bg-amber-950/30 dark:text-stone-100 dark:border-amber-800/60',
      removeBtn: 'text-amber-500 hover:bg-amber-100 hover:text-amber-900 dark:hover:bg-amber-900/50 dark:hover:text-amber-200',
      inputFocus: 'focus-within:border-amber-500 focus-within:ring-amber-500/20',
      addBtn: 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500/20',
    },
    purple: {
      tag: 'bg-purple-50 text-stone-900 border-purple-200 dark:bg-purple-950/30 dark:text-stone-100 dark:border-purple-800/60',
      removeBtn: 'text-purple-500 hover:bg-purple-100 hover:text-purple-900 dark:hover:bg-purple-900/50 dark:hover:text-purple-200',
      inputFocus: 'focus-within:border-purple-500 focus-within:ring-purple-500/20',
      addBtn: 'bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500/20',
    }
  };

  const scheme = schemes[colorScheme] || schemes.blue;

  const handleAdd = () => {
    const cleaned = inputValue.trim();
    if (!cleaned) return;

    // Evitar duplicados
    if (!value.includes(cleaned)) {
      onChange([...value, cleaned]);
    }
    setInputValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    } else if (e.key === ',') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleRemove = (indexToRemove: number) => {
    onChange(value.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      
      {/* Contenedor del Input */}
      <div className={`flex rounded-md shadow-sm border border-slate-300 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900 transition-all ${scheme.inputFocus}`}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          className="flex-1 min-w-0 border-0 bg-transparent py-2 px-3 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-0 focus:outline-none sm:text-sm"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={disabled || !inputValue.trim()}
          className={`flex items-center justify-center px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${scheme.addBtn}`}
        >
          <Plus className="h-4 w-4 mr-1" />
          Añadir
        </button>
      </div>

      {/* Lista de Tags */}
      <div className="flex flex-wrap gap-2 pt-1">
        {value.length === 0 ? (
          <span className="text-xs italic text-slate-400 dark:text-slate-500 py-1">
            Ningún elemento añadido todavía.
          </span>
        ) : (
          value.map((tag, idx) => (
            <span
              key={`${tag}-${idx}`}
              className={`inline-flex items-center py-1 pl-2.5 pr-1.5 rounded-full text-xs font-medium border transition-all hover:scale-102 ${scheme.tag}`}
            >
              <span className="truncate max-w-[180px]">{tag}</span>
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                disabled={disabled}
                className={`ml-1 inline-flex items-center justify-center h-4.5 w-4.5 rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-offset-1 ${scheme.removeBtn}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))
        )}
      </div>

      {helperText && (
        <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      )}
    </div>
  );
}
