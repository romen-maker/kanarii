import { useState, useEffect } from 'react';
import { 
  Propuesta, 
  PropuestaRespuesta, 
  PropuestaHilo, 
  listenPropuestaResponses, 
  listenPropuestaHilos,
  colPropuestas
} from '../lib/appService';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * Hook para gestionar el detalle de una propuesta específica y sus subcolecciones.
 */
export function usePropuestaDetail(propuestaId: string) {
  const [propuesta, setPropuesta] = useState<Propuesta | null>(null);
  const [respuestas, setRespuestas] = useState<PropuestaRespuesta[]>([]);
  const [hilos, setHilos] = useState<PropuestaHilo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [version, setVersion] = useState(0);

  const reload = useCallback(() => {
    setVersion(v => v + 1);
  }, []);

  useEffect(() => {
    if (!propuestaId) return;
    setLoading(true);

    // 1. Suscripción a la propuesta (doc principal)
    const unsubProp = onSnapshot(
      doc(db, 'propuestas', propuestaId), 
      (snap) => {
        if (snap.exists()) {
          setPropuesta({ id: snap.id, ...snap.data() } as Propuesta);
          setError(null);
        } else {
          setError(new Error('La propuesta no existe'));
        }
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    // 2. Suscripción a respuestas
    const unsubRes = listenPropuestaResponses(propuestaId, (data) => {
      setRespuestas(data);
    });

    // 3. Suscripción a hilos
    const unsubHilos = listenPropuestaHilos(propuestaId, (data) => {
      setHilos(data);
    });

    return () => {
      unsubProp();
      unsubRes();
      unsubHilos();
    };
  }, [propuestaId, version]);

  return {
    propuesta,
    respuestas,
    hilos,
    loading,
    error,
    reload
  };
}
