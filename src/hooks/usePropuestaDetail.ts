import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Propuesta, 
  PropuestaRespuesta, 
  PropuestaHilo, 
  listenPropuesta,
  listenPropuestaResponses, 
  listenPropuestaHilos
} from '../lib/appService';
import { useAuth } from '../contexts/AuthContext';
import { useComunidad } from '../contexts/ComunidadContext';

/**
 * Hook para gestionar el detalle de una propuesta específica y sus subcolecciones.
 */
export function usePropuestaDetail(propuestaId: string, communityId?: string) {
  const [propuesta, setPropuesta] = useState<Propuesta | null>(null);
  const [respuestas, setRespuestas] = useState<PropuestaRespuesta[]>([]);
  const [hilos, setHilos] = useState<PropuestaHilo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRespuestas, setLoadingRespuestas] = useState(true);
  const [loadingHilos, setLoadingHilos] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [version, setVersion] = useState(0);
  const { appUser } = useAuth();
  const { currentCommunityId } = useComunidad();

  const activeCommunityId = communityId || currentCommunityId;

  const reload = useCallback(() => {
    setVersion(v => v + 1);
  }, []);

  useEffect(() => {
    if (!propuestaId) return;
    setLoading(true);
    setLoadingRespuestas(true);
    setLoadingHilos(true);
    setError(null);

    // 1. Suscripción a la propuesta (doc principal)
    const unsubProp = listenPropuesta(
      propuestaId, 
      (propuestaData) => {
        if (propuestaData) {
          setPropuesta(propuestaData);
        } else {
          setPropuesta(null);
        }
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    // 2. Suscripción a respuestas
    const unsubRes = listenPropuestaResponses(
      propuestaId, 
      (data) => {
        setRespuestas(data);
        setLoadingRespuestas(false);
      },
      (err) => {
        setError(err);
        setLoadingRespuestas(false);
      }
    );

    // 3. Suscripción a hilos
    const unsubHilos = listenPropuestaHilos(
      propuestaId, 
      (data) => {
        setHilos(data);
        setLoadingHilos(false);
      },
      (err) => {
        setError(err);
        setLoadingHilos(false);
      }
    );

    return () => {
      unsubProp();
      unsubRes();
      unsubHilos();
    };
  }, [propuestaId, version]);

  // Validación dinámica de la comunidad mediante useMemo para evitar falsos positivos
  // Solo validamos cuando appUser está completamente cargado y posee comunidad
  const isWrongCommunity = useMemo(() => {
    if (!propuesta || !appUser || !activeCommunityId) return false;
    return propuesta.communityId !== activeCommunityId;
  }, [propuesta, appUser, activeCommunityId]);
  
  let hookError = error;
  if (!loading && !error) {
    if (!propuesta) {
      hookError = new Error('La propuesta no existe');
    } else if (isWrongCommunity) {
      hookError = new Error('La propuesta no pertenece a tu comunidad activa');
    }
  }

  const isAuthor = useMemo(() => {
    if (!propuesta || !appUser) return false;
    return propuesta.authorId === appUser.uid;
  }, [propuesta, appUser]);

  return {
    propuesta: isWrongCommunity ? null : propuesta,
    respuestas,
    hilos,
    loading,
    loadingRespuestas,
    loadingHilos,
    error: hookError,
    reload,
    isAuthor
  };
}

