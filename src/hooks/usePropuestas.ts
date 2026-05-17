import { useState, useEffect, useCallback } from 'react';
import { Propuesta, getPropuestasQuery, subscribeToCollection } from '../lib/appService';

/**
 * Hook para gestionar la lista general de propuestas de una comunidad.
 * Firma estándar: { items, loading, reload }
 */
export function usePropuestas(communityId: string) {
  const [propuestas, setPropuestas] = useState<Propuesta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [version, setVersion] = useState(0);

  const reload = useCallback(() => {
    setVersion(v => v + 1);
  }, []);

  useEffect(() => {
    if (!communityId) {
      setPropuestas([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = getPropuestasQuery(communityId);
    
    const unsubscribe = subscribeToCollection(
      q, 
      (data) => {
        setPropuestas(data as Propuesta[]);
        setLoading(false);
        setError(null);
      },
      'Listar propuestas'
    );

    return () => unsubscribe();
  }, [communityId, version]);

  return { 
    items: propuestas, 
    propuestas, // Alias para conveniencia
    loading, 
    error,
    reload 
  };
}
