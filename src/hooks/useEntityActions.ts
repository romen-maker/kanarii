import { useState, useCallback } from 'react';
import { useToast } from './useToast';

interface ActionOptions {
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: (result?: any) => void;
  onError?: (error?: any) => void;
}

/**
 * Hook genérico para encapsular el patrón de mutación:
 * try/catch → service call → toast → callback
 */
export function useEntityActions() {
  const { success, error: toastError } = useToast();
  const [isExecuting, setIsExecuting] = useState(false);

  const perform = useCallback(async (
    promise: Promise<any>,
    options: ActionOptions = {}
  ) => {
    setIsExecuting(true);
    try {
      const result = await promise;
      if (options.successMessage) {
        success(options.successMessage);
      }
      if (options.onSuccess) {
        options.onSuccess(result);
      }
      return result;
    } catch (err) {
      console.error("useEntityActions error:", err);
      const errorMsg = options.errorMessage || 'Error al procesar la solicitud';
      toastError(errorMsg);
      if (options.onError) {
        options.onError(err);
      }
      throw err;
    } finally {
      setIsExecuting(false);
    }
  }, [success, toastError]);

  return {
    perform,
    isExecuting
  };
}
