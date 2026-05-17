import { useState, useEffect, useCallback } from 'react';
import { Servicio, getServiciosQuery, subscribeToCollection } from '../lib/appService';

export function useServicios(communityId: string) {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [version, setVersion] = useState(0);

  const reload = useCallback(() => {
    setVersion(v => v + 1);
  }, []);

  useEffect(() => {
    if (!communityId) return;
    setLoading(true);
    
    const q = getServiciosQuery(communityId);
    
    const unsubscribe = subscribeToCollection(
      q,
      (data) => {
        setServicios(data as Servicio[]);
        setLoading(false);
        setError(null);
      },
      'servicios'
    );

    return () => unsubscribe();
  }, [communityId, version]);

  return { servicios, loading, error, reload };
}
