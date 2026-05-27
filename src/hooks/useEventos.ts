import { Evento, getEventosQuery, subscribeToCollection } from '../lib/appService';
import { useFirestoreCollection } from './useFirestoreCollection';

/**
 * Hook para gestionar los eventos de una comunidad en tiempo real.
 * Mapea automáticamente los timestamps de Firestore a objetos Date.
 */
export function useEventos(communityId: string) {
  const { items, loading, error, reload } = useFirestoreCollection<Evento>(
    (onData, onError) => {
      if (!communityId) {
        onData([]);
        return () => {};
      }
      const q = getEventosQuery(communityId);
      return subscribeToCollection(q, onData, 'eventos', onError);
    },
    [communityId],
    // Transformamos los Timestamps de Firestore a Dates de JS para react-big-calendar
    (data) => data.map(item => ({
      ...item,
      inicio: item.inicio?.toDate ? item.inicio.toDate() : new Date(item.inicio),
      fin: item.fin?.toDate ? item.fin.toDate() : new Date(item.fin)
    }))
  );

  return { items, eventos: items, loading, error, reload };
}
