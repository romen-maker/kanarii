import { useState, useRef, useCallback } from 'react';
import { useToast } from './useToast';

interface UndoableDeleteOptions<T> {
  onDelete: (id: string) => Promise<void>;
  onUndo?: (id: string) => void;
  successMessage?: string;
  undoMessage?: string;
  errorMessage?: string;
  delay?: number;
}

/**
 * Hook para manejar borrados con opción de deshacer (Undo).
 * Gestiona el estado de "pendiente", el temporizador y las notificaciones.
 */
export function useUndoableDelete<T>() {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { info, success, error: toastError } = useToast();

  const startDelete = useCallback((id: string, options: UndoableDeleteOptions<T>) => {
    const {
      onDelete,
      onUndo,
      successMessage = 'Eliminado definitivamente',
      undoMessage = 'Operación cancelada',
      errorMessage = 'Error al eliminar',
      delay = 4000
    } = options;

    // Cancelar cualquier borrado previo si existiera (limpieza)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setPendingId(id);

    // Mostrar notificación con botón Deshacer
    info('Eliminando...', {
      label: 'Deshacer',
      onClick: () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        setPendingId(null);
        if (onUndo) onUndo(id);
        success(undoMessage);
      }
    });

    // Programar el borrado real
    timeoutRef.current = setTimeout(async () => {
      try {
        await onDelete(id);
        setPendingId(null);
        timeoutRef.current = null;
        success(successMessage);
      } catch (err) {
        setPendingId(null);
        timeoutRef.current = null;
        toastError(errorMessage);
      }
    }, delay);
  }, [info, success, toastError]);

  const cancelCurrent = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      setPendingId(null);
    }
  }, []);

  return {
    startDelete,
    cancelCurrent,
    pendingId,
    isDeleting: !!pendingId
  };
}
