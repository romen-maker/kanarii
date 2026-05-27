import { useFirestoreCollection } from './useFirestoreCollection';
import { Ficha, listenFichas } from '../lib/appService';

export function useFichas(communityId?: string) {
  const { items: fichas, loading, error, reload } = useFirestoreCollection<Ficha>(
    (onData, onError) => {
      return listenFichas(
        communityId,
        onData,
        (err) => {
          console.error("Error loading fichas:", err);
          onError(err);
        }
      );
    },
    [communityId]
  );

  return { fichas, loading, error, reload };
}

