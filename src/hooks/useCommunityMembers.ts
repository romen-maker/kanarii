import { useCallback } from 'react';
import { useFirestoreCollection } from './useFirestoreCollection';
import { 
  subscribeToCollection, 
  getCommunityMembersQuery,
  CommunityMember 
} from '../lib/appService';

export type { CommunityMember };

/**
 * Hook para gestionar la lista de miembros de la comunidad en tiempo real.
 * [MANDATO DRY] Centraliza la resolución de nombres y cumple el contrato estándar.
 */
export function useCommunityMembers(communityId?: string | null) {
  const hasCommunity = Boolean(communityId);

  const { items: members, loading, error, reload } = useFirestoreCollection<CommunityMember>(
    (onData, onError) => {
      if (!hasCommunity) {
        onData([]);
        return () => {};
      }
      const q = getCommunityMembersQuery(communityId!);
      return subscribeToCollection(
        q,
        (data) => onData(data as CommunityMember[]),
        `community_members/${communityId}`
      );
    },
    [communityId, hasCommunity]
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

  if (!hasCommunity) {
    return { 
      members: [], 
      loading: false,
      loadingMembers: false, // Aliasing para compatibilidad con componentes actuales
      error: null,
      getMemberName, 
      reload: () => {} 
    };
  }

  return { 
    members, 
    loading,
    loadingMembers: loading, // Aliasing para compatibilidad con componentes actuales
    error,
    getMemberName, 
    reload 
  };
}

