import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Ficha, getUserFicha } from '../lib/appService';

export function useFicha() {
  const { appUser } = useAuth();
  const [ficha, setFicha] = useState<Ficha | null>(null);
  const [loadingFicha, setLoadingFicha] = useState(true);

  useEffect(() => {
    async function load() {
      if (appUser) {
        const data = await getUserFicha(appUser.uid);
        setFicha(data);
      }
      setLoadingFicha(false);
    }
    load();
  }, [appUser]);

  return { ficha, loadingFicha };
}
