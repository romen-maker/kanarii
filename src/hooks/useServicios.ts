import { Servicio, getServiciosQuery, subscribeToCollection } from '../lib/appService';
import { useFirestoreCollection } from './useFirestoreCollection';

export function useServicios(communityId: string) {
  const { items, loading, error, reload } = useFirestoreCollection<Servicio>(
    (onData, onError) => {
      if (!communityId) {
        onData([]);
        return () => {};
      }
      const q = getServiciosQuery(communityId);
      return subscribeToCollection(q, onData, 'servicios', onError);
    },
    [communityId]
  );

  return { items, servicios: items, loading, error, reload };
}
