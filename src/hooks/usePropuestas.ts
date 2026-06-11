import { Propuesta, getPropuestasQuery, subscribeToCollection } from '../lib/appService';
import { useFirestoreCollection } from './useFirestoreCollection';

/**
 * Hook para gestionar la lista general de propuestas de una comunidad.
 * Firma estándar: { items, loading, reload }
 */
export function usePropuestas(communityId: string) {
  const hasCommunity = Boolean(communityId);

  const { items, loading, error, reload } = useFirestoreCollection<Propuesta>(
    (onData, onError) => {
      if (!hasCommunity) {
        onData([]);
        return () => {};
      }
      const q = getPropuestasQuery(communityId);
      return subscribeToCollection(q, (data) => {
        const mapped = data.map(p => ({
          ...p,
          purpose: p.purpose ?? p.reason ?? ''
        }));
        onData(mapped);
      }, 'Listar propuestas', onError);
    },
    [communityId, hasCommunity]
  );

  if (!hasCommunity) {
    return {
      items: [],
      propuestas: [],
      loading: false,
      error: null,
      reload: () => {}
    };
  }

  return { 
    items, 
    propuestas: items, // Alias para conveniencia
    loading, 
    error,
    reload 
  };
}
