import { useCallback } from 'react';
import { Tarea, listenTareas } from '../lib/appService';
import { useAuth } from '../contexts/AuthContext';
import { useFirestoreCollection } from './useFirestoreCollection';

/**
 * Hook para gestionar tareas en tiempo real filtradas por comunidad.
 */
export function useTareas(communityId?: string) {
  const { appUser } = useAuth();
  
  // Si no se pasa communityId, intentamos usar el del usuario
  const activeCommunityId = communityId || appUser?.communityId;

  const { items, loading, error, reload } = useFirestoreCollection<Tarea>(
    (onData, onError) => {
      if (!activeCommunityId) {
        onData([]);
        return () => {};
      }

      return listenTareas(
        activeCommunityId,
        onData,
        onError
      );
    },
    [activeCommunityId]
  );

  return { 
    items, 
    tareas: items, // Alias por compatibilidad
    loading, 
    error,
    reload 
  };
}

