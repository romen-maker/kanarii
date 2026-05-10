import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFicha } from '../hooks/useFicha';
import { Leaf, Edit2, Check, X, Fingerprint, Sparkles, Users, HeartPulse, History, RefreshCw, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { saveFicha, saveManual, DatosOnboarding } from '../lib/appService';
import Markdown from 'react-markdown';
import { ManualViewer } from '../components/ManualViewer';

const fichaSchema = z.object({
  nombre: z.string().min(1, 'Requerido'),
  fechaNacimiento: z.string().min(1, 'Requerido'),
  hora: z.string().min(1, 'Requerido'),
  lugar: z.string().min(1, 'Requerido'),
  genero: z.string().min(1, 'Requerido'),
  estudios: z.string().min(1, 'Requerido'),
  rol_arteara: z.string().min(1, 'Requerido'),
  antiguedad_anos: z.union([z.string(), z.number()]),
  tension: z.string().min(1, 'Requerido')
});

type FichaFormData = z.infer<typeof fichaSchema>;

export function FichaView() {
  const { appUser, logout } = useAuth();
  const navigate = useNavigate();
  const { ficha, loadingFicha } = useFicha();
  const [editing, setEditing] = useState(false);
  const [localFicha, setLocalFicha] = useState(ficha);
  const [isGenerating, setIsGenerating] = useState(false);
  const [fichaEditadaDesdeGeneracion, setFichaEditadaDesdeGeneracion] = useState(false);
  
  function getDatosPersona(ficha: any) {
    return ficha?.datosPersona ?? ficha?.datosOnboarding ?? {};
  }

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FichaFormData>({
    resolver: zodResolver(fichaSchema),
    defaultValues: getDatosPersona(ficha) as any
  });

  useEffect(() => {
    if (!loadingFicha && !ficha && !localFicha) {
      navigate('/onboarding');
    } else if (ficha) {
      if (!localFicha || localFicha.id !== ficha.id) {
        setLocalFicha(ficha);
        reset(getDatosPersona(ficha));
      }
    }
  }, [ficha, loadingFicha, navigate, reset]);

  if (loadingFicha || (!ficha && !localFicha)) return null;
  const displayFicha = localFicha || ficha;
  const datos = getDatosPersona(displayFicha);

  const onSubmit = async (data: FichaFormData) => {
    if (!appUser || !displayFicha?.id) return;
    await saveFicha(appUser.uid, data as DatosOnboarding, displayFicha.id);
    setLocalFicha({ ...displayFicha, datosPersona: data, datosOnboarding: undefined });
    setEditing(false);
    if (displayFicha?.manualGenerado) {
      setFichaEditadaDesdeGeneracion(true);
    }
  };

  const handleRegenerateManual = async () => {
    if (!appUser || !displayFicha?.id || !datos) return;
    setIsGenerating(true);
    try {
      await saveFicha(appUser.uid, datos as any, displayFicha.id);
      window.location.reload(); // Simple way to reload the updated ficha
    } catch (e) {
      console.error("Failed to generate manual:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800 p-6 flex flex-col items-center pb-20 md:pb-6">
      <div className="w-full max-w-3xl">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-3">
            <Leaf className="text-[#6B705C] w-8 h-8" />
            <h1 className="text-3xl font-serif text-[#4A4E4D]">Tu Ficha Comunitaria</h1>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <button onClick={() => navigate('/tareas')} className="text-sm font-medium text-[#A5A58D] hover:text-[#6B705C] transition-colors">
              Tareas
            </button>
            <button onClick={() => navigate('/actas')} className="text-sm font-medium text-[#A5A58D] hover:text-[#6B705C] transition-colors">
              Actas
            </button>
            {appUser?.role === 'admin' && (
              <button onClick={() => navigate('/admin')} className="text-sm font-medium text-[#A5A58D] hover:text-[#6B705C] transition-colors">
                Panel Admin
              </button>
            )}
            <button onClick={logout} className="text-sm font-medium text-stone-500 hover:text-stone-800 transition-colors">
              Cerrar sesión
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-[#EAE2D6] p-8 relative overflow-hidden mb-8">
          <div className="absolute top-0 left-0 w-2 h-full bg-[#CB997E]"></div>
          
          {!editing ? (
            <div className="space-y-8">
              <div className="flex justify-between items-start">
                <h2 className="text-3xl font-serif text-[#4A4E4D]">{datos?.nombre}</h2>
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#F9F7F1] text-stone-700 rounded-full hover:bg-[#EAE2D6] transition-colors shadow-sm"
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Editar</span>
                </button>
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
                      <p className="text-stone-700">{datos?.fechaNacimiento} a las {datos?.hora}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-1">Lugar</h4>
                      <p className="text-stone-700">{datos?.lugar}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-1">Género</h4>
                      <p className="text-stone-700">{datos?.genero}</p>
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
                    <p className="text-stone-700">{datos?.estudios}</p>
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
                      <p className="text-stone-700">{datos?.rol_arteara}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-1">Antigüedad</h4>
                      <p className="text-stone-700">{datos?.antiguedad_anos}</p>
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
                    <p className="text-stone-700 italic text-lg leading-relaxed">{datos?.tension}</p>
                  </div>
                </div>

                {/* 5. Revisión viva con fecha */}
                <div className="space-y-4 md:col-span-2 pt-6">
                  <div className="flex items-center gap-2 text-stone-400 justify-center text-sm">
                    <History className="w-4 h-4" />
                    <span>Ficha actualizada el {displayFicha?.updatedAt ? new Date(displayFicha.updatedAt.toDate ? displayFicha.updatedAt.toDate() : displayFicha.updatedAt).toLocaleDateString() : 'hoy'}</span>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-serif text-[#4A4E4D]">Editar Ficha</h2>
                <button type="button" onClick={() => setEditing(false)} className="text-stone-500 hover:text-stone-800">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.keys(fichaSchema.shape).map((key) => {
                  const labelMap: Record<string, string> = {
                    nombre: 'Nombre', fechaNacimiento: 'Fecha de Nacimiento', horaNacimiento: 'Hora de Nacimiento',
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
          )}
        </div>

        {/* Manual Galáctico Section */}
        {displayFicha?.manualGenerado ? (
          <div className="bg-white rounded-3xl shadow-sm border border-[#EAE2D6] p-8 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-2 h-full bg-[#8A817C]"></div>
             
             <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3 text-[#4A4E4D]">
                  <Sparkles className="w-7 h-7 text-[#8A817C]" />
                  <h2 className="text-2xl font-serif">Manual de Usuario Humano</h2>
                </div>
                
                {fichaEditadaDesdeGeneracion && (
                  <button
                    onClick={handleRegenerateManual}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-4 py-2 bg-[#F9F7F1] text-stone-700 rounded-full hover:bg-[#EAE2D6] transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    <span className="text-sm font-medium">Regenerar mi manual</span>
                  </button>
                )}
             </div>

             <ManualViewer content={displayFicha.manualGenerado || ""} />
             
             {displayFicha.fechaGeneracion && (
                <div className="mt-8 pt-6 border-t border-[#EAE2D6] flex justify-between items-center text-sm text-stone-400">
                  <span>Generado por el Facilitador Galáctico</span>
                  <span>
                    El {new Date(displayFicha.fechaGeneracion.toDate ? displayFicha.fechaGeneracion.toDate() : displayFicha.fechaGeneracion).toLocaleDateString()}
                  </span>
                </div>
             )}
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-[#EAE2D6] p-8 relative overflow-hidden flex flex-col items-center justify-center text-center">
            <div className="absolute top-0 left-0 w-2 h-full bg-[#8A817C]"></div>
            
            <div className="w-16 h-16 bg-[#F9F7F1] rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-[#8A817C]" />
            </div>
            
            <h2 className="text-2xl font-serif text-[#4A4E4D] mb-2">Tu Manual Galáctico está listo para nacer</h2>
            <p className="text-stone-500 max-w-md mx-auto mb-8">
              El Facilitador Galáctico analizará tu carta astral y creará tu Manual de Usuario personalizado para Arteara.
            </p>
            
            {isGenerating ? (
              <div className="flex items-center gap-3 px-6 py-3 bg-[#F9F7F1] text-stone-500 rounded-full font-medium">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>El Facilitador Galáctico está tejiendo tu manual...</span>
              </div>
            ) : (
              <button
                onClick={handleRegenerateManual}
                className="bg-[#A5A58D] hover:bg-[#6B705C] text-white py-3 px-8 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm"
              >
                <span>✨ Generar mi Manual</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
