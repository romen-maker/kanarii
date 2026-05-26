import { useState, useEffect, useCallback } from 'react';
import { Tarea, listenTareas } from '../lib/appService';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook para gestionar tareas en tiempo real filtradas por comunidad.
 */
export function useTareas(communityId?: string) {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { appUser } = useAuth();
  const [version, setVersion] = useState(0);

  const reload = useCallback(() => {
    setVersion(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (!appUser && !communityId) {
      setTareas([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Si no se pasa communityId, intentamos usar el del usuario o fallamos a un valor seguro
    const activeCommunityId = communityId || appUser?.communityId;
    
    if (!activeCommunityId) {
      setTareas([]);
      setLoading(false);
      return;
    }

    const unsubscribe = listenTareas(
      activeCommunityId,
      (data) => {
        setTareas(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [appUser, communityId, version]);

  return { 
    items: tareas, 
    tareas,
    loading, 
    error,
    reload 
  };
}
