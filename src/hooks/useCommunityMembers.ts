import { useState, useEffect, useCallback } from 'react';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/error-handler';

export interface CommunityMember {
  userId: string;
  nombre: string;
}

/**
 * Hook para gestionar la lista de miembros de la comunidad con cache eficiente.
 * Cumple con la regla [MANDATO DRY] al centralizar la resolución de nombres.
 */
export function useCommunityMembers(communityId?: string) {
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  const fetchMembers = useCallback(async () => {
    if (!communityId) {
      setMembers([]);
      setLoadingMembers(false);
      return;
    }

    try {
      setLoadingMembers(true);
      const q = query(
        collection(db, 'fichas'),
        where('communityId', '==', communityId)
      );
      const snapshot = await getDocs(q);
      const membersData: CommunityMember[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Intentamos sacar el nombre de varios sitios por si la ficha es parcial
        const nombre = data.datosOnboarding?.nombre || data.datosPersona?.nombre || data.nombre || 'Miembro';
        const uid = data.userId || doc.id;

        if (uid && !membersData.some(m => m.userId === uid)) {
          membersData.push({ userId: uid, nombre });
        }
      });
      setMembers(membersData);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'fichas');
    } finally {
      setLoadingMembers(false);
    }
  }, [communityId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  /**
   * Helper síncrono para obtener un nombre desde el estado cargado.
   */
  const getMemberName = useCallback((uid?: string) => {
    if (!uid) return 'Comunidad';
    const mem = members.find(m => m.userId === uid);
    return mem ? mem.nombre : 'Cargando...';
  }, [members]);

  return { members, loadingMembers, getMemberName, refreshMembers: fetchMembers };
}
