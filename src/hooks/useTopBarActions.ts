import { useEffect, ReactNode, useRef } from 'react';
import { useTopBar } from '../contexts/TopBarContext';

/**
 * Hook de React para registrar las acciones dinámicas primarias de una página en la TopBar unificada.
 * Utiliza una referencia inmutable y auto-limpieza al desmontar para evitar re-renders infinitos.
 */
export function useTopBarActions(actions: ReactNode, deps: any[] = []) {
  const { setPageActions, clearTopBarState } = useTopBar();
  const actionsRef = useRef<ReactNode>(actions);
  actionsRef.current = actions;

  useEffect(() => {
    setPageActions(actionsRef.current);
    return () => {
      clearTopBarState();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setPageActions, clearTopBarState, ...deps]);
}
