import { useCallback } from 'react';
import { useFirestoreCollection } from './useFirestoreCollection';
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
  const { items: members, loading, error, reload } = useFirestoreCollection<CommunityMember>(
    (onData, onError) => {
      if (!communityId) {
        onData([]);
        return () => {};
      }
      const q = getCommunityMembersQuery(communityId);
      return subscribeToCollection(
        q,
        (data) => onData(data as CommunityMember[]),
        `community_members/${communityId}`
      );
    },
    [communityId]
  );

  /**
   * Helper síncrono para obtener un nombre desde el estado cargado.
   */
  const getMemberName = useCallback((uid?: string) => {
    if (!uid) return 'Comunidad';
    const mem = members.find(m => m.userId === uid);
    if (mem) return mem.nombre || mem.displayName || mem.email || 'Miembro';
    return loading ? 'Cargando...' : 'Miembro';
  }, [members, loading]);

  return { 
    members, 
    loading,
    loadingMembers: loading, // Aliasing para compatibilidad con componentes actuales
    error,
    getMemberName, 
    reload 
  };
}

