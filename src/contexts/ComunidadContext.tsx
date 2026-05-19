import React, { createContext, useContext, useEffect, useState } from 'react';
import { Comunidad, getComunidad, listenComunidades, seedArteara } from '../lib/appService';
import { useAuth } from './AuthContext';

interface ComunidadContextType {
  currentCommunityId: string;
  comunidad: Comunidad | null;
  comunidades: Comunidad[];
  setCommunityId: (id: string) => void;
  loading: boolean;
}

const ComunidadContext = createContext<ComunidadContextType>({} as ComunidadContextType);

// Fallback en memoria si sessionStorage está bloqueado (sandbox/iframe)
let memoryStorage: Record<string, string> = {};

function safeSessionStorageGet(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch (e) {
    return memoryStorage[key] || null;
  }
}

function safeSessionStorageSet(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
  } catch (e) {
    memoryStorage[key] = value;
  }
}

export const ComunidadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { appUser } = useAuth();
  
  const [currentCommunityId, setCurrentCommunityId] = useState<string>(() => {
    return safeSessionStorageGet('kanarii_current_community_id') || 'arteara';
  });
  
  const [comunidad, setComunidad] = useState<Comunidad | null>(null);
  const [comunidades, setComunidades] = useState<Comunidad[]>([]);
  const [loading, setLoading] = useState(true);

  // Guardar ID en storage y actualizar estado
  const setCommunityId = (id: string) => {
    setCurrentCommunityId(id);
    safeSessionStorageSet('kanarii_current_community_id', id);
  };

  // Cargar lista de comunidades en tiempo real e inicializar seed
  useEffect(() => {
    const init = async () => {
      await seedArteara(); // Asegurar que existe al menos Arteara
    };
    init();

    // Escuchar comunidades en tiempo real
    const unsubscribe = listenComunidades((list) => {
      setComunidades(list);
    });

    return () => unsubscribe();
  }, []);

  // Sincronizar con el perfil del usuario (multi-membership)
  useEffect(() => {
    if (appUser?.communityIds && appUser.communityIds.length > 0) {
      // Si el usuario tiene comunidades y la actual no está entre ellas,
      // la cambiamos a la primera que tenga, PERO solo si:
      // 1. Ya terminamos de cargar (no está cargando la comunidad actual).
      // 2. El usuario no es administrador directo del espacio actual (evita revertir tras la creación).
      if (!appUser.communityIds.includes(currentCommunityId)) {
        const isDirectAdmin = comunidad?.adminUids && Array.isArray(comunidad.adminUids) && comunidad.adminUids.includes(appUser.uid);
        if (!isDirectAdmin && !loading) {
          setCommunityId(appUser.communityIds[0]);
        }
      }
    }
  }, [appUser, currentCommunityId, comunidad, loading]);

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
      setCommunityId,
      loading 
    }}>
      {children}
    </ComunidadContext.Provider>
  );
};

export const useComunidad = () => useContext(ComunidadContext);
