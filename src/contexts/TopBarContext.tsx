import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';

export interface TopBarState {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

export interface TopBarContextType {
  topBarState: TopBarState;
  setTopBarState: (state: TopBarState) => void;
  setPageActions: (actions: ReactNode) => void;
  clearTopBarState: () => void;
}

const TopBarContext = createContext<TopBarContextType | undefined>(undefined);

export function TopBarProvider({ children }: { children: ReactNode }) {
  const [topBarState, setTopBarState] = useState<TopBarState>({});

  const setPageActions = useCallback((actions: ReactNode) => {
    setTopBarState(prev => {
      if (prev.actions === actions) return prev;
      return { ...prev, actions };
    });
  }, []);

  const clearTopBarState = useCallback(() => {
    setTopBarState(prev => {
      if (!prev.title && !prev.subtitle && !prev.actions) return prev;
      return {};
    });
  }, []);

  const contextValue = useMemo(() => ({
    topBarState,
    setTopBarState,
    setPageActions,
    clearTopBarState
  }), [topBarState, setTopBarState, setPageActions, clearTopBarState]);

  return (
    <TopBarContext.Provider value={contextValue}>
      {children}
    </TopBarContext.Provider>
  );
}

export function useTopBar() {
  const context = useContext(TopBarContext);
  if (!context) {
    throw new Error('useTopBar debe ser usado dentro de un TopBarProvider');
  }
  return context;
}
