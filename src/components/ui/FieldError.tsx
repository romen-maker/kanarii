import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { FieldError as RHFFieldError } from 'react-hook-form';

interface FieldErrorProps {
  error?: RHFFieldError | { message?: string } | null;
  message?: string;
  className?: string;
  showIcon?: boolean;
}

/**
 * Componente reutilizable para mostrar errores de validación en formularios.
 * Ofrece transiciones animadas suaves e icono de alerta integrado.
 */
export const FieldError: React.FC<FieldErrorProps> = ({
  error,
  message,
  className = '',
  showIcon = true,
}) => {
  const errorMessage = error?.message || message;

  return (
    <AnimatePresence>
      {errorMessage ? (
        <motion.div
          initial={{ opacity: 0, height: 0, y: -4 }}
          animate={{ opacity: 1, height: 'auto', y: 0 }}
          exit={{ opacity: 0, height: 0, y: -4 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className={`flex items-center gap-1.5 mt-1.5 text-xs text-red-500 font-medium overflow-hidden ${className}`}
          role="alert"
        >
          {showIcon && <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
          <span>{errorMessage}</span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
