import React, { createContext, useContext, useEffect, useState } from 'react';
import { Comunidad, getComunidad, getComunidades, seedArteara } from '../lib/appService';
import { useAuth } from './AuthContext';

interface ComunidadContextType {
  currentCommunityId: string;
  comunidad: Comunidad | null;
  comunidades: Comunidad[];
  setCommunityId: (id: string) => void;
  loading: boolean;
}

const ComunidadContext = createContext<ComunidadContextType>({} as ComunidadContextType);

export const ComunidadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { appUser } = useAuth();
  const [currentCommunityId, setCurrentCommunityId] = useState<string>('arteara');
  const [comunidad, setComunidad] = useState<Comunidad | null>(null);
  const [comunidades, setComunidades] = useState<Comunidad[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar lista de comunidades e inicializar seed
  useEffect(() => {
    const init = async () => {
      await seedArteara(); // Asegurar que existe al menos Arteara
      const list = await getComunidades();
      setComunidades(list);
    };
    init();
  }, []);

  // Sincronizar con el perfil del usuario
  useEffect(() => {
    if (appUser?.communityId) {
      setCurrentCommunityId(appUser.communityId);
    }
  }, [appUser]);

  // Cargar datos de la comunidad actual
  useEffect(() => {
    const loadComunidad = async () => {
      setLoading(true);
      const data = await getComunidad(currentCommunityId);
      setComunidad(data);
      setLoading(false);
    };
    loadComunidad();
  }, [currentCommunityId]);

  return (
    <ComunidadContext.Provider value={{ 
      currentCommunityId, 
      comunidad, 
      comunidades, 
      setCommunityId: setCurrentCommunityId,
      loading 
    }}>
      {children}
    </ComunidadContext.Provider>
  );
};

export const useComunidad = () => useContext(ComunidadContext);
