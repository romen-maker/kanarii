import { useState, useEffect, useCallback } from 'react';
import { 
  subscribeToCollection, 
  getCommunityMembersQuery,
  CommunityMember 
} from '../lib/appService';

/**
 * Hook para gestionar la lista de miembros de la comunidad en tiempo real.
 * [MANDATO DRY] Centraliza la resolución de nombres y cumple el contrato estándar.
 */
export function useCommunityMembers(communityId?: string) {
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [version, setVersion] = useState(0);

  const reload = useCallback(() => {
    setVersion(v => v + 1);
  }, []);

  useEffect(() => {
    if (!communityId) {
      setMembers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = getCommunityMembersQuery(communityId);
    
    // Suscripción real-time centralizada
    const unsubscribe = subscribeToCollection(
      q,
      (data) => {
        setMembers(data as CommunityMember[]);
        setLoading(false);
        setError(null);
      },
      `community_members/${communityId}`
    );

    return () => unsubscribe();
  }, [communityId, version]);

  /**
   * Helper síncrono para obtener un nombre desde el estado cargado.
   */
  const getMemberName = useCallback((uid?: string) => {
    if (!uid) return 'Comunidad';
    const mem = members.find(m => m.userId === uid);
    return mem ? mem.nombre : 'Cargando...';
  }, [members]);

  return { 
    members, 
    loading,
    loadingMembers: loading, // Aliasing para compatibilidad con componentes actuales
    error,
    getMemberName, 
    reload 
  };
}
