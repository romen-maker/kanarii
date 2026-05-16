import { useState, useEffect, useCallback } from 'react';
import { Acuerdo, getAcuerdosQuery, subscribeToCollection } from '../lib/appService';

export function useAcuerdos(communityId: string) {
  const [acuerdos, setAcuerdos] = useState<Acuerdo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [version, setVersion] = useState(0);

  const reload = useCallback(() => {
    setVersion(v => v + 1);
  }, []);

  useEffect(() => {
    if (!communityId) return;
    setLoading(true);
    
    const q = getAcuerdosQuery(communityId);
    
    const unsubscribe = subscribeToCollection(
      q,
      (data) => {
        setAcuerdos(data as Acuerdo[]);
        setLoading(false);
        setError(null);
      },
      'acuerdos'
    );

    return () => unsubscribe();
  }, [communityId, version]);

  return { acuerdos, loading, error, reload };
}
