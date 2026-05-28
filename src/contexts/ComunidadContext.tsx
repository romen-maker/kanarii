import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Comunidad, getComunidad, listenComunidades, seedArteara } from '../lib/appService';
import { useAuth } from './AuthContext';

interface ComunidadContextType {
  currentCommunityId: string | undefined;
  comunidad: Comunidad | null;
  comunidades: Comunidad[];
  setCommunityId: (id: string) => void;
  loading: boolean;
  loadingCommunity: boolean;
}

const ComunidadContext = createContext<ComunidadContextType>({} as ComunidadContextType);

// Fallback en memoria si el almacenamiento está bloqueado (sandbox/iframe/Safari incognito)
let memoryStorage: Record<string, string> = {};

function safeStorageGet(type: 'session' | 'local', key: string): string | null {
  try {
    const storage = type === 'session' ? sessionStorage : localStorage;
    return storage.getItem(key);
  } catch (e) {
    return memoryStorage[`${type}_${key}`] || null;
  }
}

function safeStorageSet(type: 'session' | 'local', key: string, value: string): void {
  try {
    const storage = type === 'session' ? sessionStorage : localStorage;
    storage.setItem(key, value);
  } catch (e) {
    memoryStorage[`${type}_${key}`] = value;
  }
}

function safeStorageRemove(type: 'session' | 'local', key: string): void {
  try {
    const storage = type === 'session' ? sessionStorage : localStorage;
    storage.removeItem(key);
  } catch (e) {
    delete memoryStorage[`${type}_${key}`];
  }
}

export const ComunidadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { appUser, status } = useAuth();
  
  const [currentCommunityId, setCurrentCommunityId] = useState<string | undefined>(undefined);
  const [comunidad, setComunidad] = useState<Comunidad | null>(null);
  const [comunidades, setComunidades] = useState<Comunidad[]>([]);
  const [loading, setLoading] = useState(true);

  // loadingCommunity es true si la sesión está cargando o si el perfil está cargando estando autenticado
  const loadingCommunity = status === 'checking' || (status === 'authenticated' && !appUser);

  // Referencias para evitar race conditions al unirse a nuevas comunidades
  const prevCommunityIdsRef = useRef<string[]>([]);

  // Guardar ID en storage y actualizar estado
  const setCommunityId = (id: string) => {
    setCurrentCommunityId(id);
    safeStorageSet('session', 'kanarii_current_community_id', id);
  };

  // Cargar lista de comunidades en tiempo real e inicializar seed
  useEffect(() => {
    const init = async () => {
      try {
        await seedArteara(); // Asegurar que existe al menos Arteara
      } catch (e) {
        console.error("Error seeding default community:", e);
      }
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
    if (loadingCommunity) return;

    if (!appUser) {
      setCurrentCommunityId(undefined);
      setComunidad(null);
      safeStorageRemove('session', 'kanarii_current_community_id');
      safeStorageRemove('local', 'kanarii_current_community_id');
      prevCommunityIdsRef.current = [];
      return;
    }

    const ids = appUser.communityIds || [];

    // Si el usuario no tiene ninguna comunidad → limpiar estado
    if (ids.length === 0) {
      setCurrentCommunityId(undefined);
      safeStorageRemove('session', 'kanarii_current_community_id');
      safeStorageRemove('local', 'kanarii_current_community_id');
      prevCommunityIdsRef.current = [];
      return;
    }

    const prevIds = prevCommunityIdsRef.current;

    // Reactividad: Si el usuario se une a una nueva comunidad (su lista crece),
    // cambiar automáticamente el selector a esa nueva comunidad.
    if (prevIds.length > 0) {
      const newlyAddedId = ids.find(id => !prevIds.includes(id));
      if (newlyAddedId) {
        setCommunityId(newlyAddedId);
        prevCommunityIdsRef.current = ids;
        return;
      }
    }

    // Determinar la comunidad a establecer
    let targetId = currentCommunityId;

    if (!targetId) {
      // Intentar leer de storage
      const storedId = safeStorageGet('session', 'kanarii_current_community_id') || safeStorageGet('local', 'kanarii_current_community_id');
      if (storedId && ids.includes(storedId)) {
        targetId = storedId;
      } else {
        targetId = ids[0];
      }
    } else if (!ids.includes(targetId)) {
      // Validar si el actual es admin de la comunidad activa aunque no esté en sus ids
      const isDirectAdmin = comunidad?.adminUids && Array.isArray(comunidad.adminUids) && comunidad.adminUids.includes(appUser.uid);
      if (!isDirectAdmin) {
        targetId = ids[0];
      }
    }

    if (targetId !== currentCommunityId) {
      setCommunityId(targetId!);
    }

    prevCommunityIdsRef.current = ids;
  }, [appUser, status, loadingCommunity, currentCommunityId, comunidad]);

  // Cargar datos de la comunidad actual
  useEffect(() => {
    // Guardia: no intentar cargar si no hay un ID válido
    if (!currentCommunityId) {
      setComunidad(null);
      setLoading(false);
      return;
    }

    const loadComunidad = async () => {
      setLoading(true);
      try {
        const data = await getComunidad(currentCommunityId);
        setComunidad(data);
      } catch (e) {
        console.error("Error loading community details:", e);
        setComunidad(null);
      } finally {
        setLoading(false);
      }
    };
    loadComunidad();
  }, [currentCommunityId]);

  return (
    <ComunidadContext.Provider value={{ 
      currentCommunityId, 
      comunidad, 
      comunidades, 
      setCommunityId,
      loading,
      loadingCommunity
    }}>
      {children}
    </ComunidadContext.Provider>
  );
};

export const useComunidad = () => useContext(ComunidadContext);
