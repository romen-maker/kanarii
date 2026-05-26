import { useState, useEffect, useCallback } from 'react';
import { 
  Propuesta, 
  PropuestaRespuesta, 
  PropuestaHilo, 
  listenPropuesta,
  listenPropuestaResponses, 
  listenPropuestaHilos
} from '../lib/appService';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook para gestionar el detalle de una propuesta específica y sus subcolecciones.
 */
export function usePropuestaDetail(propuestaId: string, communityId?: string) {
  const [propuesta, setPropuesta] = useState<Propuesta | null>(null);
  const [respuestas, setRespuestas] = useState<PropuestaRespuesta[]>([]);
  const [hilos, setHilos] = useState<PropuestaHilo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [version, setVersion] = useState(0);
  const { appUser } = useAuth();

  const reload = useCallback(() => {
    setVersion(v => v + 1);
  }, []);

  useEffect(() => {
    if (!propuestaId) return;
    setLoading(true);

    const activeCommunityId = communityId || appUser?.communityId;

    // 1. Suscripción a la propuesta (doc principal)
    const unsubProp = listenPropuesta(
      propuestaId, 
      (propuestaData) => {
        if (propuestaData) {
          if (activeCommunityId && propuestaData.communityId !== activeCommunityId) {
            setError(new Error('La propuesta no pertenece a tu comunidad activa'));
            setPropuesta(null);
          } else {
            setPropuesta(propuestaData);
            setError(null);
          }
        } else {
          setError(new Error('La propuesta no existe'));
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
      },
      (err) => {
        setError(err);
      }
    );

    // 3. Suscripción a hilos
    const unsubHilos = listenPropuestaHilos(
      propuestaId, 
      (data) => {
        setHilos(data);
      },
      (err) => {
        setError(err);
      }
    );

    return () => {
      unsubProp();
      unsubRes();
      unsubHilos();
    };
  }, [propuestaId, communityId, appUser?.communityId, version]);

  return {
    propuesta,
    respuestas,
    hilos,
    loading,
    error,
    reload
  };
}
