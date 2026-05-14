import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Tarea } from '../lib/appService';
import { handleFirestoreError, OperationType } from '../lib/error-handler';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook para gestionar tareas en tiempo real filtradas por comunidad.
 */
export function useTareas(communityId?: string) {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(true);
  const { appUser } = useAuth();
  const [key, setKey] = useState(0);

  const reload = useCallback(() => {
    setKey(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (!appUser) {
      setTareas([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Si no se pasa communityId, intentamos usar el del usuario o fallamos a un valor seguro
    const activeCommunityId = communityId || appUser.communityId;
    
    if (!activeCommunityId) {
      setTareas([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'tareas'), 
      where('communityId', '==', activeCommunityId),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Tarea[];
      setTareas(data);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'tareas');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [appUser, communityId, key]);

  return { items: tareas, loading, reload };
}
