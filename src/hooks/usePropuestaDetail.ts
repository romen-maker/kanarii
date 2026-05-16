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

  useEffect(() => {
    if (!propuestaId) return;
    setLoading(true);

    // 1. Suscripción a la propuesta (doc principal)
    const unsubProp = onSnapshot(doc(db, 'propuestas', propuestaId), (snap) => {
      if (snap.exists()) {
        setPropuesta({ id: snap.id, ...snap.data() } as Propuesta);
      }
      setLoading(false);
    });

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
  }, [propuestaId]);

  return {
    propuesta,
    respuestas,
    hilos,
    loading
  };
}
