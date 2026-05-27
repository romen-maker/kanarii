import { useFirestoreCollection } from './useFirestoreCollection';
import { 
  subscribeToCollection, 
  getProfilesQuery,
  Ficha 
} from '../lib/appService';

/**
 * Hook para gestionar la lista pesada de perfiles de la comunidad en tiempo real.
 * [WARNING] Usar solo cuando sea estrictamente necesario el payload completo (Cruce, Edición).
 * Para listados normales, usar useCommunityMembers.
 */
export function useProfiles(communityId: string) {
  const { items: profiles, loading, error, reload } = useFirestoreCollection<Ficha>(
    (onData, onError) => {
      if (!communityId) {
        console.warn("useProfiles: communityId es obligatorio para evitar fugas de datos.");
        onData([]);
        return () => {};
      }
      const q = getProfilesQuery(communityId);
      return subscribeToCollection(
        q,
        (data) => onData(data as Ficha[]),
        `profiles/${communityId}`
      );
    },
    [communityId]
  );

  return { 
    profiles, 
    loading, 
    error: error ? error.message : null,
    reload 
  };
}

