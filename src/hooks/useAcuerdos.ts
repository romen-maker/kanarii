import { useState, useEffect } from 'react';
import { Acuerdo, getAcuerdosQuery, subscribeToCollection } from '../lib/appService';

export function useAcuerdos(communityId: string) {
  const [acuerdos, setAcuerdos] = useState<Acuerdo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!communityId) return;
    setLoading(true);
    
    const q = getAcuerdosQuery(communityId);
    
    const unsubscribe = subscribeToCollection(
      q,
      (data) => {
        setAcuerdos(data as Acuerdo[]);
        setLoading(false);
      },
      'acuerdos'
    );

    return () => unsubscribe();
  }, [communityId]);

  return { acuerdos, loading, error };
}
