import { useFirestoreCollection } from './useFirestoreCollection';
import { Acuerdo, getAcuerdosQuery, subscribeToCollection } from '../lib/appService';

export function useAcuerdos(communityId: string) {
  const { items, loading, error, reload } = useFirestoreCollection<Acuerdo>(
    (onData, onError) => {
      if (!communityId) {
        onData([]);
        return () => {};
      }
      const q = getAcuerdosQuery(communityId);
      return subscribeToCollection(
        q,
        (data) => onData(data as Acuerdo[]),
        'acuerdos'
      );
    },
    [communityId]
  );

  return { items, acuerdos: items, loading, error, reload };
}

