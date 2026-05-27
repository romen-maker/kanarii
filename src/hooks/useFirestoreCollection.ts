import { useState, useEffect, useCallback } from 'react';

/**
 * Hook genérico para centralizar suscripciones en tiempo real de Firestore.
 * Elimina la duplicación de lógica de estados de carga (loading), errores (error) y refresco (reload).
 *
 * @template T Tipo de los elementos que vienen de la colección en la base de datos.
 * @template R Tipo de los elementos devueltos después de pasar por la función transformadora (mapFn).
 *
 * @param subscribeFn Función que inicia la suscripción en tiempo real y recibe los callbacks de datos y error. Debe retornar la función de limpieza (unsubscribe).
 * @param dependencies Array de dependencias que relanza la suscripción cuando cambian (ej. communityId).
 * @param mapFn Función opcional para mapear o transformar los datos crudos antes de actualizar el estado.
 */
export function useFirestoreCollection<T, R = T>(
  subscribeFn: (onData: (data: T[]) => void, onError: (err: Error) => void) => () => void,
  dependencies: any[],
  mapFn?: (data: T[]) => R[]
) {
  const [items, setItems] = useState<R[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [version, setVersion] = useState(0);

  // Permite forzar de forma manual la reconstrucción de la suscripción
  const reload = useCallback(() => {
    setVersion(prev => prev + 1);
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);

    // Iniciamos la suscripción delegando la lógica específica al llamador
    const unsubscribe = subscribeFn(
      (data) => {
        if (!active) return;
        try {
          // Si hay una función transformadora la aplicamos, si no, asumimos conversión directa
          const mapped = mapFn ? mapFn(data) : (data as unknown as R[]);
          setItems(mapped);
          setLoading(false);
          setError(null);
        } catch (err) {
          setError(err as Error);
          setLoading(false);
        }
      },
      (err) => {
        if (!active) return;
        setError(err);
        setLoading(false);
      }
    );

    return () => {
      active = false;
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, version]);

  return { items, loading, error, reload };
}
