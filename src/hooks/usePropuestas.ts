import { useState, useEffect, useCallback } from 'react';
import { Propuesta, getPropuestasQuery, subscribeToCollection } from '../lib/appService';

/**
 * Hook para gestionar la lista general de propuestas de una comunidad.
 * Firma estándar: { items, loading, reload }
 */
export function usePropuestas(communityId: string) {
  const [propuestas, setPropuestas] = useState<Propuesta[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPropuestas = useCallback(() => {
    if (!communityId) return;
    setLoading(true);
    
    const q = getPropuestasQuery(communityId);
    return subscribeToCollection(
      q, 
      (data) => {
        setPropuestas(data as Propuesta[]);
        setLoading(false);
      },
      'Listar propuestas'
    );
  }, [communityId]);

  useEffect(() => {
    const unsubscribe = loadPropuestas();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [loadPropuestas]);

  return { 
    items: propuestas, 
    propuestas, // Alias para conveniencia
    loading, 
    reload: loadPropuestas 
  };
}
