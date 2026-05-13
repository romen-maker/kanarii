import { useState, useEffect, useCallback } from 'react';
import { Acta, subscribeToCollection, getActasQuery } from '../lib/appService';
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
    const unsubscribe = subscribeToCollection(
      getActasQuery(),
      (data) => {
        setActas(data as Acta[]);
        setLoading(false);
      },
      'actas'
    );

    return () => unsubscribe();
  }, [appUser, key]);

  return { 
    actas, 
    items: actas, 
    loading, 
    loadingActas: loading,
    reload 
  };
}
