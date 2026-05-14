import { useState, useEffect } from 'react';
import { Evento, getEventosQuery, subscribeToCollection } from '../lib/appService';

export function useEventos(communityId: string) {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!communityId) return;
    setLoading(true);
    const q = getEventosQuery(communityId);
    
    const unsubscribe = subscribeToCollection(
      q,
      (data) => {
        // Transformamos los Timestamps de Firestore a Dates de JS para react-big-calendar
        const transformedData = data.map(item => ({
          ...item,
          inicio: item.inicio?.toDate ? item.inicio.toDate() : new Date(item.inicio),
          fin: item.fin?.toDate ? item.fin.toDate() : new Date(item.fin)
        }));
        setEventos(transformedData);
        setLoading(false);
      },
      'eventos'
    );

    return () => unsubscribe();
  }, [communityId]);

  return { eventos, loading, error };
}
