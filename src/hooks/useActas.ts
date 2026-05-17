import { useState, useEffect, useCallback } from 'react';
import { Acta, subscribeToCollection, getActasQuery } from '../lib/appService';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook para gestionar actas en tiempo real filtradas por comunidad.
 */
export function useActas(communityId?: string) {
  const [actas, setActas] = useState<Acta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { appUser } = useAuth();
  const [version, setVersion] = useState(0);

  const reload = useCallback(() => {
    setVersion(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (!appUser) {
      setActas([]);
      setLoading(false);
      return;
    }

    const activeCommunityId = communityId || appUser.communityId;
    
    if (!activeCommunityId) {
      setActas([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToCollection(
      getActasQuery(activeCommunityId),
      (data) => {
        setActas(data as Acta[]);
        setLoading(false);
        setError(null);
      },
      'actas'
    );

    return () => unsubscribe();
  }, [appUser, communityId, version]);

  return { 
    items: actas,
    loading,
    error,
    reload 
  };
}
