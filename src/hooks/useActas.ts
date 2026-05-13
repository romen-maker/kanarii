import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Acta } from '../lib/appService';
import { handleFirestoreError, OperationType } from '../lib/error-handler';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook para gestionar actas en tiempo real.
 * Normalizado para cumplir con el estándar de arquitectura Kanarii.
 */
export function useActas() {
  const [actas, setActas] = useState<Acta[]>([]);
  const [loading, setLoading] = useState(true);
  const { appUser } = useAuth();
  const [key, setKey] = useState(0);

  const reload = useCallback(() => {
    setKey(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (!appUser) {
      setActas([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(collection(db, 'actas'), orderBy('fecha', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const actasData: Acta[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Acta));
      
      setActas(actasData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'actas');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [appUser, key]);

  return { 
    actas, 
    items: actas, 
    loading, 
    loadingActas: loading, // Backward compatibility
    reload 
  };
}
