import { useState, useEffect } from 'react';
import { Servicio, getServiciosQuery, subscribeToCollection } from '../lib/appService';

export function useServicios(communityId: string) {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!communityId) return;
    setLoading(true);
    
    const q = getServiciosQuery(communityId);
    
    const unsubscribe = subscribeToCollection(
      q,
      (data) => {
        setServicios(data as Servicio[]);
        setLoading(false);
      },
      'servicios'
    );

    return () => unsubscribe();
  }, [communityId]);

  return { servicios, loading, error };
}
