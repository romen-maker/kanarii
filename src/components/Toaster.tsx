import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface Toast {
  id: number;
  message: string;
  type: ToastType;
  action?: ToastAction;
}

interface ToastContextType {
  success: (message: string, action?: ToastAction) => void;
  error: (message: string, action?: ToastAction) => void;
  info: (message: string, action?: ToastAction) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType, action?: ToastAction) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, action }]);
    
    // Si hay una acción de deshacer, quizás queremos que dure un poco más
    const duration = action ? 5000 : 4000;
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const success = (msg: string, action?: ToastAction) => addToast(msg, 'success', action);
  const error = (msg: string, action?: ToastAction) => addToast(msg, 'error', action);
  const info = (msg: string, action?: ToastAction) => addToast(msg, 'info', action);

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ success, error, info }}>
      {children}
      <div className="fixed bottom-24 md:bottom-8 right-4 z-[100] flex flex-col gap-3 pointer-events-none max-w-sm w-full">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
              className="pointer-events-auto"
            >
              <div className={`
                flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg border backdrop-blur-md
                ${toast.type === 'success' ? 'bg-white/90 border-teal-100 text-teal-900' : ''}
                ${toast.type === 'error' ? 'bg-white/90 border-rose-100 text-rose-900' : ''}
                ${toast.type === 'info' ? 'bg-white/90 border-stone-100 text-stone-900' : ''}
              `}>
                {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-teal-600" />}
                {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600" />}
                {toast.type === 'info' && <Info className="w-5 h-5 text-stone-600" />}
                
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <p className="text-sm font-medium">{toast.message}</p>
                  
                  {toast.action && (
                    <button
                      onClick={() => {
                        toast.action?.onClick();
                        removeToast(toast.id);
                      }}
                      className="text-xs font-bold uppercase tracking-wider text-[#CB997E] hover:text-[#A5A58D] transition-colors pr-2"
                    >
                      {toast.action.label}
                    </button>
                  )}
                </div>
                
                <button 
                  onClick={() => removeToast(toast.id)}
                  className="p-1 hover:bg-stone-100 rounded-full transition-colors shrink-0"
                >
                  <X className="w-4 h-4 text-stone-400" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
