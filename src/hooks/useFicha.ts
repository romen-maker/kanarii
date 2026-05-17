import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Ficha, getUserFicha } from '../lib/appService';

export function useFicha() {
  const { appUser } = useAuth();
  const [ficha, setFicha] = useState<Ficha | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [version, setVersion] = useState(0);

  const reload = useCallback(() => {
    setVersion(v => v + 1);
  }, []);

  useEffect(() => {
    async function load() {
      if (!appUser) {
        setFicha(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getUserFicha(appUser.uid);
        setFicha(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error al cargar la ficha'));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [appUser, version]);

  return { 
    ficha, 
    loading,
    loadingFicha: loading,
    error,
    reload 
  };
}
