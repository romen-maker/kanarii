import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Tarea } from '../lib/appService';
import { handleFirestoreError, OperationType } from '../lib/error-handler';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook para gestionar tareas en tiempo real.
 * Normalizado para cumplir con el estándar de arquitectura Kanarii.
 */
export function useTareas() {
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
    const q = query(collection(db, 'tareas'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tareasData: Tarea[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Tarea));
      
      setTareas(tareasData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'tareas');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [appUser, key]);

  return { 
    tareas, 
    items: tareas, 
    loading, 
    loadingTareas: loading, // Backward compatibility
    reload 
  };
}
