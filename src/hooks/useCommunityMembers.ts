import { useCallback, useState, useEffect, useRef } from 'react';
import { useFirestoreCollection } from './useFirestoreCollection';
import { 
  subscribeToCollection, 
  getCommunityMembersQuery,
  CommunityMember,
  db,
  doc,
  getDoc
} from '../lib/appService';

export type { CommunityMember };

/**
 * Hook para gestionar la lista de miembros de la comunidad en tiempo real.
 * [MANDATO DRY] Centraliza la resolución de nombres y cumple el contrato estándar.
 * [RESOLUCIÓN REACTIVA] Realiza fallback en segundo plano a /profiles si faltan datos en la membresía.
 */
export function useCommunityMembers(communityId?: string | null) {
  const hasCommunity = Boolean(communityId);
  const [cachedNames, setCachedNames] = useState<Record<string, string>>({});
  const pendingFetches = useRef<Set<string>>(new Set());

  // Limpieza de caché reactiva al cambiar de comunidad activa
  useEffect(() => {
    setCachedNames({});
    pendingFetches.current.clear();
  }, [communityId]);

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
   * Si el miembro no tiene nombre o no está en la comunidad, lo resuelve en segundo plano desde /profiles.
   */
  const getMemberName = useCallback((uid?: string) => {
    if (!uid) return 'Comunidad';

    // A. Retornar si ya está resuelto en la caché
    if (cachedNames[uid]) return cachedNames[uid];

    // B. Retornar si está en members con datos válidos
    const mem = members.find(m => m.userId === uid);
    if (mem) {
      const name = mem.nombre || mem.displayName || mem.email;
      if (name) return name;
    }

    // C. Si faltan datos o no existe, hacer fetch asíncrono preventivo en segundo plano
    if (!pendingFetches.current.has(uid) && !loading) {
      pendingFetches.current.add(uid);
      getDoc(doc(db, 'profiles', uid)).then((profileSnap) => {
        if (profileSnap.exists()) {
          const p = profileSnap.data();
          const resolvedName = p?.datosPersona?.nombre || p?.datosOnboarding?.nombre ||
                               p?.nombre || p?.displayName || 'Miembro';
          setCachedNames(prev => ({ ...prev, [uid]: resolvedName }));
        } else {
          setCachedNames(prev => ({ ...prev, [uid]: 'Miembro' }));
        }
      }).catch(() => {
        setCachedNames(prev => ({ ...prev, [uid]: 'Miembro' }));
      });
    }

    return loading ? 'Cargando...' : 'Miembro';
  }, [members, loading, cachedNames]);

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


