import { Acta, subscribeToCollection, getActasQuery } from '../lib/appService';
import { useAuth } from '../contexts/AuthContext';
import { useFirestoreCollection } from './useFirestoreCollection';

/**
 * Hook para gestionar actas en tiempo real filtradas por comunidad.
 */
export function useActas(communityId?: string) {
  const { appUser } = useAuth();

  // Si no hay appUser o communityId activo, devolvemos vacío
  const activeCommunityId = communityId || appUser?.communityId;
  const hasAccess = Boolean(appUser && activeCommunityId);

  const { items, loading, error, reload } = useFirestoreCollection<Acta>(
    (onData, onError) => {
      if (!hasAccess) {
        onData([]);
        return () => {};
      }

      return subscribeToCollection(
        getActasQuery(activeCommunityId!),
        onData,
        'actas',
        onError
      );
    },
    [appUser, activeCommunityId, hasAccess]
  );

  if (!hasAccess) {
    return {
      items: [],
      loading: false,
      error: null,
      reload: () => {}
    };
  }

  return { 
    items,
    loading,
    error,
    reload 
  };
}

