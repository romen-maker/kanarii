import { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Proyecto } from '../lib/appService';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook para gestionar la lista de proyectos en tiempo real filtrados por comunidad.
 * Cumple con el estándar de arquitectura Kanarii: { items, loading, reload }
 */
export function useProyectos(communityId?: string) {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { appUser } = useAuth();
  const [key, setKey] = useState(0);

  const reload = useCallback(() => {
    setKey(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (!appUser) {
      setProyectos([]);
      setLoading(false);
      return;
    }

    const activeCommunityId = communityId || appUser.communityId;
    
    if (!activeCommunityId) {
      setProyectos([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, 'proyectos'), 
      where('communityId', '==', activeCommunityId),
      orderBy('creadoEn', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Proyecto));
        setProyectos(items);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching projects:", err);
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [appUser, communityId, key]);

  return { items: proyectos, loading, error, reload };
}
