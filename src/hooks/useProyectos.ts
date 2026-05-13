import { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Proyecto } from '../lib/appService';

/**
 * Hook para gestionar la lista de proyectos en tiempo real.
 * Cumple con el estándar de arquitectura Kanarii: { items, loading, reload }
 */
export function useProyectos() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [key, setKey] = useState(0);

  const reload = useCallback(() => {
    setKey(prev => prev + 1);
  }, []);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'proyectos'), orderBy('creadoEn', 'desc'));

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
        console.error("Error en useProyectos snapshot:", err);
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [key]);

  return {
    proyectos,
    items: proyectos, // Alias para cumplir firma genérica
    loading,
    error,
    reload
  };
}
