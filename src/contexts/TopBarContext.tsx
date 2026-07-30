import React, { createContext, useContext, useState, ReactNode } from 'react';

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

  const setPageActions = (actions: ReactNode) => {
    setTopBarState(prev => ({ ...prev, actions }));
  };

  const clearTopBarState = () => {
    setTopBarState({});
  };

  return (
    <TopBarContext.Provider value={{ topBarState, setTopBarState, setPageActions, clearTopBarState }}>
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
