import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Tarea } from '../lib/appService';
import { handleFirestoreError, OperationType } from '../lib/error-handler';
import { useAuth } from '../contexts/AuthContext';

export function useTareas() {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loadingTareas, setLoadingTareas] = useState(true);
  const { appUser } = useAuth();

  useEffect(() => {
    if (!appUser) {
      setTareas([]);
      setLoadingTareas(false);
      return;
    }

    const q = query(collection(db, 'tareas'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tareasData: Tarea[] = [];
      snapshot.forEach((doc) => {
        tareasData.push({ id: doc.id, ...doc.data() } as Tarea);
      });
      setTareas(tareasData);
      setLoadingTareas(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'tareas');
      setLoadingTareas(false);
    });

    return () => unsubscribe();
  }, [appUser]);

  return { tareas, loadingTareas };
}
