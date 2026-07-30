import { useEffect, ReactNode } from 'react';
import { useTopBar } from '../contexts/TopBarContext';

/**
 * Hook de React para registrar las acciones dinámicas primarias de una página en la TopBar unificada.
 * Garantiza la auto-limpieza del estado al desmontar la vista para evitar persistencia cruzada entre rutas.
 */
export function useTopBarActions(actions: ReactNode, deps: any[] = []) {
  const { setPageActions, clearTopBarState } = useTopBar();

  useEffect(() => {
    setPageActions(actions);
    return () => {
      clearTopBarState();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setPageActions, clearTopBarState, ...deps]);
}
