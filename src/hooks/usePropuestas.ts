import { Propuesta, getPropuestasQuery, subscribeToCollection } from '../lib/appService';
import { useFirestoreCollection } from './useFirestoreCollection';

/**
 * Hook para gestionar la lista general de propuestas de una comunidad.
 * Firma estándar: { items, loading, reload }
 */
export function usePropuestas(communityId: string) {
  const { items, loading, error, reload } = useFirestoreCollection<Propuesta>(
    (onData, onError) => {
      if (!communityId) {
        onData([]);
        return () => {};
      }
      const q = getPropuestasQuery(communityId);
      return subscribeToCollection(q, onData, 'Listar propuestas', onError);
    },
    [communityId]
  );

  return { 
    items, 
    propuestas: items, // Alias para conveniencia
    loading, 
    error,
    reload 
  };
}
