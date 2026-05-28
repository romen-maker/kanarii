import { Proyecto, listenProyectos } from '../lib/appService';
import { useAuth } from '../contexts/AuthContext';
import { useFirestoreCollection } from './useFirestoreCollection';

/**
 * Hook para gestionar la lista de proyectos en tiempo real filtrados por comunidad.
 * Cumple con el estándar de arquitectura Kanarii: { items, loading, reload }
 */
export function useProyectos(communityId?: string) {
  const { appUser } = useAuth();
  
  // Si no se pasa communityId, intentamos usar el del usuario
  const activeCommunityId = communityId || appUser?.communityId;
  const hasAccess = Boolean(activeCommunityId);

  const { items, loading, error, reload } = useFirestoreCollection<Proyecto>(
    (onData, onError) => {
      if (!hasAccess) {
        onData([]);
        return () => {};
      }

      return listenProyectos(
        activeCommunityId!,
        onData,
        onError
      );
    },
    [activeCommunityId, hasAccess]
  );

  if (!hasAccess) {
    return { items: [], loading: false, error: null, reload: () => {} };
  }

  return { items, loading, error, reload };
}

