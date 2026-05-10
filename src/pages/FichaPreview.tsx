import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Fingerprint, Sparkles, Users, HeartPulse, Leaf, Loader2, Edit2, Check, X } from 'lucide-react';
import { syncPendingOnboarding, saveManual, calcularDatosBrutos, calcularDimensiones } from '../lib/appService';
import { generarPerfilVisual, generarManual } from '../lib/gemini';
import Markdown from 'react-markdown';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ManualViewer } from '../components/ManualViewer';

const fichaSchema = z.object({
  nombre: z.string().min(1, 'Requerido'),
  fechaNacimiento: z.string().min(1, 'Requerido'),
  hora: z.string().min(1, 'Requerido'),
  lugar: z.string().min(1, 'Requerido'),
  genero: z.string().min(1, 'Requerido'),
  estudios: z.string().min(1, 'Requerido'),
  rol_arteara: z.string().min(1, 'Requerido'),
  antiguedad_anos: z.string().min(1, 'Requerido'),
  tension: z.string().min(1, 'Requerido')
});

type FichaFormData = z.infer<typeof fichaSchema>;

export function FichaPreview() {
  const { appUser, login, updateConsent } = useAuth();
  const navigate = useNavigate();
  const [pendingFicha, setPendingFicha] = useState(() => JSON.parse(localStorage.getItem('kanarii_pendingFicha') || 'null'));
  
  const [estadoVista, setEstadoVista] = useState<'datos' | 'manual'>('datos');
  const [generatedManual, setGeneratedManual] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const syncInProgress = useRef(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FichaFormData>({
    resolver: zodResolver(fichaSchema),
    defaultValues: pendingFicha || {}
  });

  const onEditSubmit = (data: FichaFormData) => {
    setPendingFicha(data);
    localStorage.setItem('kanarii_pendingFicha', JSON.stringify(data));
    setIsEditing(false);
  };

  const handleGenerateManual = async () => {
    setIsGenerating(true);
    try {
      let latitud = 0; let longitud = 0; let timezone = 'UTC';
      if (pendingFicha.lugar) {
        try {
          const parsed = JSON.parse(pendingFicha.lugar);
          latitud = parsed.latitud; longitud = parsed.longitud; timezone = parsed.timezone;
        } catch (e) {}
      }
      const horaVal = !pendingFicha.hora || pendingFicha.hora.trim() === '00:00' ? '00:00' : pendingFicha.hora;
      
      const rawData = await calcularDatosBrutos({
        fecha: pendingFicha.fechaNacimiento,
        hora: horaVal,
        latitud, longitud, timezone
      });
      const datosPersona = { ...pendingFicha, hora: horaVal };
      const dimensiones = calcularDimensiones(rawData, datosPersona);
      const perfilVisual = await generarPerfilVisual(rawData, datosPersona, dimensiones);
      const manualText = await generarManual(rawData, datosPersona, perfilVisual);

      // Save previewed state locally so sync doesn't have to re-fetch if we decide to
      const updatedFicha = { ...pendingFicha, preview_perfilVisual: perfilVisual, preview_manual: manualText };
      setPendingFicha(updatedFicha);
      localStorage.setItem('kanarii_pendingFicha', JSON.stringify(updatedFicha));

      setGeneratedManual(manualText);
      setEstadoVista('manual');
    } catch (e) {
      console.error("Failed to generate manual", e);
      alert("Hubo un error al generar tu perfil. ¡Inténtalo más tarde o guarda tus datos sin generarlo ahora!");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (appUser && isSaving && !syncInProgress.current) {
      syncInProgress.current = true;
      (async () => {
        const fichaId = await syncPendingOnboarding(appUser.uid);
        if (fichaId && generatedManual) {
          try {
            await saveManual(appUser.uid, generatedManual, fichaId);
          } catch (e) {
            console.error("Failed to default manual:", e);
          }
        }
        await updateConsent();
        navigate('/ficha');
      })();
    }
  }, [appUser, isSaving, navigate, updateConsent, generatedManual]);

  if (!pendingFicha) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6">
        <div className="text-center text-stone-500">No hay ficha pendiente. Vuelve al inicio.</div>
      </div>
    );
  }

  const handleSaveClick = async () => {
    if (!appUser) {
      await login();
      setIsSaving(true);
    } else {
      setIsSaving(true);
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

        {isGenerating ? (
          <div className="bg-white rounded-3xl shadow-sm border border-[#EAE2D6] p-8 mt-12 flex flex-col items-center justify-center py-20 text-center space-y-6">
            <Loader2 className="w-12 h-12 text-[#CB997E] animate-spin" />
            <h2 className="text-2xl font-serif text-[#4A4E4D]">El Facilitador Galáctico está tejiendo tu manual...</h2>
            <p className="text-stone-600 max-w-md">
              Consultando a las estrellas y trazando tu diseño humano. Este proceso tomará unos segundos mágicos.
            </p>
          </div>
        ) : estadoVista === 'datos' ? (
          <div className="bg-white rounded-3xl shadow-sm border border-[#EAE2D6] p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-[#CB997E]"></div>
            
            {isEditing ? (
              <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-serif text-[#4A4E4D]">Editar Datos</h2>
                  <button type="button" onClick={() => setIsEditing(false)} className="text-stone-500 hover:text-stone-800">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.keys(fichaSchema.shape).map((key) => {
                    const labelMap: Record<string, string> = {
                      nombre: 'Nombre', fechaNacimiento: 'Fecha de Nacimiento', hora: 'Hora de Nacimiento',
                      lugar: 'Lugar de Nacimiento', genero: 'Género', estudios: 'Nivel de Estudios',
                      rol_arteara: 'Rol en Proyecto', antiguedad_anos: 'Antigüedad', tension: 'Estado de Tensión'
                    };

                    return (
                      <div key={key} className="space-y-1">
                        <label className="text-sm font-medium text-stone-600">{labelMap[key]}</label>
                        <input
                          {...register(key as keyof FichaFormData)}
                          className="w-full bg-[#F9F7F1] border border-[#EAE2D6] rounded-xl py-3 px-4 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#A5A58D]"
                        />
                        {errors[key as keyof FichaFormData] && (
                          <p className="text-red-500 text-xs">{errors[key as keyof FichaFormData]?.message}</p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="pt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#A5A58D] hover:bg-[#6B705C] text-white py-3 px-8 rounded-xl font-medium transition-colors flex items-center gap-2"
                  >
                    {isSubmitting ? 'Guardando...' : <><Check className="w-5 h-5"/> Guardar Cambios</>}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-8">
                <div className="flex justify-between items-start">
                  <h2 className="text-3xl font-serif text-[#4A4E4D]">Tus datos de registro</h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#F9F7F1] text-stone-700 rounded-full hover:bg-[#EAE2D6] transition-colors shadow-sm cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span className="text-sm font-medium">✏️ Editar datos</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10 pt-2">
                  <div className="space-y-4 md:col-span-2">
                    <div className="flex items-center gap-2 text-[#CB997E] border-b border-[#EAE2D6] pb-2">
                      <Fingerprint className="w-5 h-5" />
                      <h3 className="text-lg font-serif">Identidad base</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-1">Nombre</h4>
                        <p className="text-stone-700">{pendingFicha.nombre}</p>
                      </div>
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

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[#6B705C] border-b border-[#EAE2D6] pb-2">
                      <Users className="w-5 h-5" />
                      <h3 className="text-lg font-serif">Rol y convivencia</h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-1">Participación en Kanarii</h4>
                        <p className="text-stone-700">{pendingFicha.rol_arteara}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-1">Antigüedad</h4>
                        <p className="text-stone-700">{pendingFicha.antiguedad}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 md:col-span-2">
                    <div className="flex items-center gap-2 text-[#B58368] border-b border-[#EAE2D6] pb-2">
                      <HeartPulse className="w-5 h-5" />
                      <h3 className="text-lg font-serif">Estado de tensión y cuidado</h3>
                    </div>
                    <div className="bg-[#F9F7F1] p-5 rounded-2xl border border-[#EAE2D6]">
                      <p className="text-stone-700 italic text-lg leading-relaxed">{pendingFicha.tension}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={handleGenerateManual}
                    className="w-full md:w-auto bg-[#CB997E] hover:bg-[#B58368] text-white py-4 px-8 rounded-2xl font-medium transition-colors shadow-sm text-lg cursor-pointer flex justify-center items-center gap-2"
                  >
                    <Sparkles className="w-5 h-5"/>
                    ✨ Generar mi Manual Galáctico
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-[#EAE2D6] p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-[#8A817C]"></div>
              
              <div className="flex justify-between items-start mb-8">
                <h2 className="text-3xl font-serif text-[#4A4E4D]">Este será tu perfil en la comunidad</h2>
              </div>
              
              <ManualViewer content={generatedManual || ""} />
            </div>

            <div className="flex flex-col md:flex-row justify-end gap-4 mt-8">
              <button
                onClick={() => setEstadoVista('datos')}
                className="w-full md:w-auto bg-white border border-[#EAE2D6] text-stone-700 hover:bg-[#F9F7F1] py-4 px-8 rounded-2xl font-medium transition-colors shadow-sm text-lg cursor-pointer flex justify-center items-center"
              >
                ✏️ Editar datos y regenerar
              </button>
              
              <button
                onClick={handleSaveClick}
                disabled={isSaving}
                className="w-full md:w-auto bg-[#A5A58D] hover:bg-[#6B705C] text-white py-4 px-8 rounded-2xl font-medium transition-colors shadow-sm text-lg cursor-pointer flex justify-center items-center"
              >
                {isSaving ? (
                  <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Guardando en la red...</span>
                ) : (
                  'Guardar mi ficha en la tribu'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
