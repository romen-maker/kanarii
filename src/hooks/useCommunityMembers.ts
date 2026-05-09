import { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/error-handler';

export interface CommunityMember {
  userId: string;
  nombre: string;
}

export function useCommunityMembers() {
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  useEffect(() => {
    async function fetchMembers() {
      try {
        const q = query(collection(db, 'fichas'));
        const snapshot = await getDocs(q);
        const membersData: CommunityMember[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.userId && data.datosOnboarding?.nombre) {
            if (!membersData.some(m => m.userId === data.userId)) {
              membersData.push({
                userId: data.userId,
                nombre: data.datosOnboarding.nombre
              });
            }
          }
        });
        setMembers(membersData);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'fichas');
      } finally {
        setLoadingMembers(false);
      }
    }

    fetchMembers();
  }, []);

  return { members, loadingMembers };
}
