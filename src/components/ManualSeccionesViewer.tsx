import React, { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import { normalizarSecciones, SeccionId, SECCIONES_META } from '../lib/manualNormalizer';
import { Loader2 } from 'lucide-react';

interface ManualSeccionesViewerProps {
  ficha: any;
  manualSecciones?: Record<string, string>;
  seccionesLoading?: Record<string, boolean>;
  generarSeccionLazy?: (seccionId: any) => Promise<void>;
  modoAdmin?: boolean;
}

export function ManualSeccionesViewer({
  ficha,
  manualSecciones = {},
  seccionesLoading = {},
  generarSeccionLazy,
  modoAdmin = false
}: ManualSeccionesViewerProps) {
  const [activeTab, setActiveTab] = useState<SeccionId>('adn_astral');

  const seccionesNormalizadas = normalizarSecciones(ficha);
  const uid = ficha?.uid || ficha?.id || '';

  // Obtener el contenido de la sección activa
  const getContenidoSeccion = (secId: SeccionId): string | null => {
    // 1. Ver si ya existe en la ficha normalizada (modular o legacy regex)
    const normalizada = seccionesNormalizadas.find(s => s.id === secId);
    if (normalizada && normalizada.contenido !== null) {
      return normalizada.contenido;
    }

    // 2. Ver si está en el estado manualSecciones (pasado por useFicha o local)
    if (manualSecciones[secId]) {
      return manualSecciones[secId];
    }

    // 3. Ver si está en sessionStorage
    if (uid) {
      const cached = sessionStorage.getItem(`manual_${uid}_${secId}`);
      if (cached) {
        return cached;
      }
    }

    return null;
  };

  // Disparar generación lazy si corresponde
  useEffect(() => {
    if (modoAdmin || !generarSeccionLazy) return;

    const contenido = getContenidoSeccion(activeTab);
    if (contenido === null && !seccionesLoading[activeTab]) {
      generarSeccionLazy(activeTab);
    }
  }, [activeTab, ficha, modoAdmin, generarSeccionLazy, seccionesLoading]);

  const activeContent = getContenidoSeccion(activeTab);
  const isLoading = seccionesLoading[activeTab];

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-[#EAE2D6] pb-4">
        {SECCIONES_META.map((sec) => {
          const isActive = activeTab === sec.id;
          const isLoaded = getContenidoSeccion(sec.id) !== null;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => setActiveTab(sec.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-[#8A817C] text-white shadow-sm'
                  : 'bg-[#F9F7F1] text-stone-600 hover:bg-[#EAE2D6]'
              }`}
            >
              <span>{sec.icono}</span>
              <span>{sec.label}</span>
              {isLoaded && !isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="min-h-[200px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-stone-500 space-y-4 animate-fadeIn">
            <Loader2 className="w-8 h-8 animate-spin text-[#8A817C]" />
            <p className="text-sm font-serif italic text-center max-w-sm">
              {activeTab === 'adn_astral' && 'Descifrando el tejido cósmico y tu Ikigai...'}
              {activeTab === 'anatomia_poder' && 'Analizando flujos de rango y democracia profunda...'}
              {activeTab === 'espejo_tribu' && 'Mirando en el espejo de la sombra comunitaria...'}
              {activeTab === 'sintonia_cnv' && 'Sintonizando el estilo de comunicación empática...'}
              {activeTab === 'mantenimiento_crisis' && 'Preparando el protocolo de mantenimiento y crisis...'}
            </p>
          </div>
        ) : activeContent ? (
          <div className="prose prose-stone max-w-none text-stone-700 leading-relaxed text-sm md:text-base space-y-4 animate-fadeIn">
            <Markdown>{activeContent}</Markdown>
          </div>
        ) : modoAdmin ? (
          <div className="text-center py-12 text-stone-400 italic text-sm bg-stone-50/50 rounded-2xl border border-dashed border-[#EAE2D6] w-full">
            Esta sección aún no ha sido generada por el miembro.
          </div>
        ) : (
          <div className="text-center py-12 text-stone-400 italic text-sm bg-stone-50/50 rounded-2xl border border-dashed border-[#EAE2D6] w-full">
            No hay contenido disponible para esta sección.
          </div>
        )}
      </div>
    </div>
  );
}
