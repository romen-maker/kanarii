import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Ficha, getUserFicha, saveResumenManual, getFichaHash } from '../lib/appService';
import { generarResumenManual, generarSeccion } from '../lib/gemini';

export function useFicha() {
  const { appUser } = useAuth();
  const [ficha, setFicha] = useState<Ficha | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [version, setVersion] = useState(0);

  // Estados locales para el Manual en Capa 2
  const [manualSecciones, setManualSecciones] = useState<Record<string, string>>({});
  const [seccionesLoading, setSeccionesLoading] = useState<Record<string, boolean>>({});
  const [isGeneratingResumen, setIsGeneratingResumen] = useState(false);
  const isGeneratingRef = useRef(false);

  const reload = useCallback(() => {
    setVersion(v => v + 1);
  }, []);

  // Cargar ficha
  useEffect(() => {
    async function load() {
      if (!appUser) {
        setFicha(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getUserFicha(appUser.uid);
        setFicha(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error al cargar la ficha'));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [appUser, version]);

  // Validar o auto-generar resumen del manual (Capa 1)
  useEffect(() => {
    if (loading || !ficha || !appUser) return;

    const tienePerfil = !!ficha.perfilVisual?.arquetipo;
    if (!tienePerfil) return;

    const hashActual = getFichaHash(ficha);
    const hashGuardado = ficha.resumenManualHash;
    const tieneResumen = !!ficha.resumenManual;

    if (!tieneResumen || hashGuardado !== hashActual) {
      async function autoGenerarResumen() {
        if (isGeneratingRef.current || !ficha?.perfilVisual || !appUser) return;
        
        isGeneratingRef.current = true;
        setIsGeneratingResumen(true);
        try {
          console.log("🔄 Hash inválido o ausente. Regenerando resumen de manual (Capa 1)...");
          const resumen = await generarResumenManual(ficha.perfilVisual);
          const hash = getFichaHash(ficha);
          await saveResumenManual(appUser.uid, resumen, hash);
          // Limpiar secciones locales (Capa 2) para forzar regeneración lazy
          setManualSecciones({});
          reload();
        } catch (err) {
          console.error("Error al generar resumen del manual:", err);
        } finally {
          isGeneratingRef.current = false;
          setIsGeneratingResumen(false);
        }
      }
      autoGenerarResumen();
    }
  }, [ficha, loading, appUser, reload]);

  // Generar sección narrativa bajo demanda (Capa 2)
  const generarSeccionLazy = useCallback(async (
    seccionId: 'adn_astral' | 'anatomia_poder' | 'espejo_tribu' | 'sintonia_cnv' | 'mantenimiento_crisis'
  ) => {
    if (seccionesLoading[seccionId]) return;
    if (manualSecciones[seccionId]) return;

    const uid = appUser?.uid || ficha?.userId || '';
    if (!uid) return;

    const cacheKey = `manual_${uid}_${seccionId}`;

    // 1. Verificar sessionStorage
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      setManualSecciones(prev => ({ ...prev, [seccionId]: cached }));
      return;
    }

    // 2. Verificar si ya existe en Firestore
    const resumen = ficha?.resumenManual as any;
    const narrativaFirestore = resumen?.secciones?.[seccionId]?.narrativa;
    if (narrativaFirestore) {
      setManualSecciones(prev => ({ ...prev, [seccionId]: narrativaFirestore }));
      sessionStorage.setItem(cacheKey, narrativaFirestore);
      return;
    }

    if (!ficha?.resumenManual || !ficha?.perfilVisual) return;

    setSeccionesLoading(prev => ({ ...prev, [seccionId]: true }));
    try {
      const narrativa = await generarSeccion(seccionId, ficha.perfilVisual, ficha.resumenManual);
      sessionStorage.setItem(cacheKey, narrativa);
      setManualSecciones(prev => ({ ...prev, [seccionId]: narrativa }));
    } catch (err) {
      console.error(`Error al generar la sección ${seccionId}:`, err);
    } finally {
      setSeccionesLoading(prev => ({ ...prev, [seccionId]: false }));
    }
  }, [ficha, manualSecciones, seccionesLoading, appUser]);

  return { 
    ficha, 
    loading,
    loadingFicha: loading,
    error,
    reload,
    // Nuevas propiedades expuestas para el manual lazy
    manualSecciones,
    seccionesLoading,
    isGeneratingResumen,
    generarSeccionLazy
  };
}
