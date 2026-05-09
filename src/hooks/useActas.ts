import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Acta } from '../lib/appService';
import { handleFirestoreError, OperationType } from '../lib/error-handler';
import { useAuth } from '../contexts/AuthContext';

export function useActas() {
  const [actas, setActas] = useState<Acta[]>([]);
  const [loadingActas, setLoadingActas] = useState(true);
  const { appUser } = useAuth();

  useEffect(() => {
    if (!appUser) {
      setActas([]);
      setLoadingActas(false);
      return;
    }

    const q = query(collection(db, 'actas'), orderBy('fecha', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const actasData: Acta[] = [];
      snapshot.forEach((doc) => {
        actasData.push({ id: doc.id, ...doc.data() } as Acta);
      });
      setActas(actasData);
      setLoadingActas(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'actas');
      setLoadingActas(false);
    });

    return () => unsubscribe();
  }, [appUser]);

  return { actas, loadingActas };
}
