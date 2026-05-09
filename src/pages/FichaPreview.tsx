import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Fingerprint, Sparkles, Users, HeartPulse, Leaf, Loader2 } from 'lucide-react';
import { syncPendingOnboarding, saveManual } from '../lib/appService';
import { generateUserManual } from '../lib/gemini';

export function FichaPreview() {
  const { appUser, login, updateConsent } = useAuth();
  const navigate = useNavigate();
  const [pendingFicha] = useState(() => JSON.parse(localStorage.getItem('kanarii_pendingFicha') || 'null'));
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const syncInProgress = useRef(false);

  useEffect(() => {
    if (appUser && isSaving && !syncInProgress.current) {
      syncInProgress.current = true;
      (async () => {
        setIsGenerating(true);
        const fichaId = await syncPendingOnboarding(appUser.uid);
        if (fichaId) {
          try {
            const manualText = await generateUserManual(pendingFicha);
            await saveManual(appUser.uid, manualText, fichaId);
          } catch (e) {
            console.error("Failed to generate manual:", e);
            // Even if manual fails, we saved the profile
          }
        }
        await updateConsent();
        navigate('/ficha');
      })();
    }
  }, [appUser, isSaving, navigate, updateConsent, pendingFicha]);

  if (!pendingFicha) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6">
        <div className="text-center text-stone-500">No hay ficha pendiente. Vuelve al inicio.</div>
      </div>
    );
  }

  const handleSaveClick = async () => {
    setIsSaving(true);
    if (!appUser) {
      await login();
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800 p-6 flex flex-col items-center pb-24">
      <div className="w-full max-w-3xl">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-3">
            <Leaf className="text-[#6B705C] w-8 h-8" />
            <h1 className="text-3xl font-serif text-[#4A4E4D]">Previsualización de tu Ficha</h1>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-[#EAE2D6] p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-[#CB997E]"></div>
          
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
              <Loader2 className="w-12 h-12 text-[#CB997E] animate-spin" />
              <h2 className="text-2xl font-serif text-[#4A4E4D]">Generando tu Manual Galáctico...</h2>
              <p className="text-stone-600 max-w-md">
                Consultando a las estrellas y trazando tu diseño humano. Este proceso puede tardar unos segundos mágicos.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex justify-between items-start">
                <h2 className="text-3xl font-serif text-[#4A4E4D]">{pendingFicha.nombre}</h2>
              </div>
              
              <div className="border border-[#CB997E]/30 bg-[#F9F7F1]/50 p-4 rounded-xl text-stone-600 mb-6 text-sm flex gap-3">
                <Sparkles className="w-5 h-5 text-[#CB997E] flex-shrink-0" />
                <p>Así es como se verá tu ficha en nuestra comunidad. Confirma tu registro para guardarla y ser parte de Tawăzawazt.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10 pt-2">
                
                {/* 1. Identidad base */}
                <div className="space-y-4 md:col-span-2">
                  <div className="flex items-center gap-2 text-[#CB997E] border-b border-[#EAE2D6] pb-2">
                    <Fingerprint className="w-5 h-5" />
                    <h3 className="text-lg font-serif">Identidad base</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-1">Nacimiento</h4>
                      <p className="text-stone-700">{pendingFicha.fechaNacimiento} a las {pendingFicha.horaNacimiento}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-1">Lugar</h4>
                      <p className="text-stone-700">{pendingFicha.lugarNacimiento}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-1">Género</h4>
                      <p className="text-stone-700">{pendingFicha.genero}</p>
                    </div>
                  </div>
                </div>

                {/* 2. Ikigai comunitario */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[#8A817C] border-b border-[#EAE2D6] pb-2">
                    <Sparkles className="w-5 h-5" />
                    <h3 className="text-lg font-serif">Ikigai comunitario</h3>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-1">Saberes y Estudios</h4>
                    <p className="text-stone-700">{pendingFicha.nivelEstudios}</p>
                  </div>
                </div>

                {/* 3. Rol y convivencia */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[#6B705C] border-b border-[#EAE2D6] pb-2">
                    <Users className="w-5 h-5" />
                    <h3 className="text-lg font-serif">Rol y convivencia</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-1">Participación en Kanarii</h4>
                      <p className="text-stone-700">{pendingFicha.rolProyecto}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-1">Antigüedad</h4>
                      <p className="text-stone-700">{pendingFicha.antiguedad}</p>
                    </div>
                  </div>
                </div>

                {/* 4. Estado de tensión y cuidado */}
                <div className="space-y-4 md:col-span-2">
                  <div className="flex items-center gap-2 text-[#B58368] border-b border-[#EAE2D6] pb-2">
                    <HeartPulse className="w-5 h-5" />
                    <h3 className="text-lg font-serif">Estado de tensión y cuidado</h3>
                  </div>
                  <div className="bg-[#F9F7F1] p-5 rounded-2xl border border-[#EAE2D6]">
                    <p className="text-stone-700 italic text-lg leading-relaxed">{pendingFicha.estadoTension}</p>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

        {!isGenerating && (
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSaveClick}
              disabled={isSaving}
              className="w-full md:w-auto bg-[#CB997E] hover:bg-[#B58368] text-white py-4 px-8 rounded-2xl font-medium transition-colors shadow-sm text-lg"
            >
              {isSaving ? 'Guardando en la red...' : 'Guardar mi ficha en la tribu'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
