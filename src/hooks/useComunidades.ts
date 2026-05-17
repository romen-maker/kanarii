import { useState, useEffect, useCallback } from 'react';
import { getComunidades } from '../lib/appService';
import { Comunidad } from '../lib/appService';

/**
 * Hook de lectura (read-only) para gestionar la lista de comunidades.
 * Sigue el patrón estándar de arquitectura Kanarii: { items, loading, error, reload }
 * Usa SOLO funciones de appService.ts, nunca importa de firebase/firestore directamente.
 */
export function useComunidades() {
  const [items, setItems] = useState<Comunidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [key, setKey] = useState(0);

  const reload = useCallback(() => {
    setKey(prev => prev + 1);
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    getComunidades()
      .then((data) => {
        if (mounted) {
          setItems(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          console.error('Error fetching comunidades:', err);
          setError(err as Error);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [key]);

  return { items, loading, error, reload };
}
