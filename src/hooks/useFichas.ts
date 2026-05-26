import { useState, useEffect } from 'react';
import { Ficha, listenFichas } from '../lib/appService';

export function useFichas(communityId?: string) {
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = listenFichas(
      communityId,
      (data) => {
        setFichas(data);
        setLoading(false);
      },
      (err) => {
        console.error("Error loading fichas:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [communityId]);

  return { fichas, loading, error };
}
