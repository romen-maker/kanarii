import { Servicio, getAllServiciosQuery, subscribeToCollection } from '../lib/appService';
import { useFirestoreCollection } from './useFirestoreCollection';

export function useAllServicios(communityId: string) {
  const { items, loading, error, reload } = useFirestoreCollection<Servicio>(
    (onData, onError) => {
      if (!communityId) {
        onData([]);
        return () => {};
      }
      const q = getAllServiciosQuery(communityId);
      return subscribeToCollection(q, onData, 'servicios', onError);
    },
    [communityId]
  );

  return { items, servicios: items, loading, error, reload };
}
