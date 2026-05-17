import { useState, useEffect } from 'react';
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
  const [profiles, setProfiles] = useState<Ficha[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!communityId) {
      console.warn("useProfiles: communityId es obligatorio para evitar fugas de datos.");
      setProfiles([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = getProfilesQuery(communityId);
    
    // Suscripción real-time centralizada a perfiles completos
    const unsubscribe = subscribeToCollection(
      q,
      (data) => {
        setProfiles(data as Ficha[]);
        setLoading(false);
        setError(null);
      },
      `profiles/${communityId}`
    );

    return () => unsubscribe();
  }, [communityId]);

  return { 
    profiles, 
    loading, 
    error,
    reload: () => setLoading(true)
  };
}
