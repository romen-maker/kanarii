import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Fingerprint, Sparkles, Users, HeartPulse, Leaf, Loader2, Edit2, Check, X, MapPin } from 'lucide-react';
import { syncPendingOnboarding, saveManual, calcularDatosBrutos, calcularDimensiones } from '../lib/appService';
import { generarPerfilVisual, generarManual } from '../lib/gemini';
import Markdown from 'react-markdown';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ManualViewer } from '../components/ManualViewer';
import { geocodeLugar } from '../lib/geocoding';

const fichaSchema = z.object({
  nombre: z.string().min(1, 'Requerido'),
  fechaNacimiento: z.string().min(1, 'Requerido'),
  hora: z.string().min(1, 'Requerido'),
  lugar: z.string().min(1, 'Requerido'),
  genero: z.string().min(1, 'Requerido'),
  saberes: z.string().min(1, 'Requerido'),
  rol_comunidad: z.string().min(1, 'Requerido'),
  antiguedad_anos: z.preprocess((val) => Number(val), z.number()),
  tension: z.string().min(1, 'Requerido'),
  latitud: z.preprocess((val) => val === undefined ? undefined : Number(val), z.number().optional()),
  longitud: z.preprocess((val) => val === undefined ? undefined : Number(val), z.number().optional()),
  timezone: z.string().optional(),
  rol: z.string().optional(),
  fechaLlegada: z.string().optional(),
  fechaSalida: z.string().optional(),
  habilidadesVoluntario: z.string().optional()
});

type FichaFormData = z.infer<typeof fichaSchema>;

export function FichaPreview() {
  const { appUser, login, updateConsent } = useAuth();
  const navigate = useNavigate();
  const [pendingFicha, setPendingFicha] = useState<any>(() => JSON.parse(localStorage.getItem('kanarii_pendingFicha') || 'null'));
  
  const [estadoVista, setEstadoVista] = useState<'datos' | 'manual'>('datos');
  const [generatedManual, setGeneratedManual] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const syncInProgress = useRef(false);

  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [geoMessage, setGeoMessage] = useState('');

  const { register, handleSubmit, getValues, setValue, watch, formState: { errors, isSubmitting } } = useForm<FichaFormData>({
    // @ts-ignore
    resolver: zodResolver(fichaSchema),
    defaultValues: pendingFicha || {}
  });

  const watchRol = watch("rol");

  const onEditSubmit = (data: FichaFormData) => {
    setPendingFicha(data);
    localStorage.setItem('kanarii_pendingFicha', JSON.stringify(data));
    setIsEditing(false);
  };

  const handleVerificarUbicacion = async () => {
    const lugarStr = getValues("lugar");
    if (!lugarStr) return;
    
    setGeoStatus('loading');
    setGeoMessage('');
    try {
      const geoResult = await geocodeLugar(lugarStr);
      setValue('latitud', geoResult.latitud);
      setValue('longitud', geoResult.longitud);
      setValue('timezone', geoResult.timezone);
      setValue('lugar', geoResult.lugarNormalizado);
      setGeoStatus('success');
      setGeoMessage(`✓ ${geoResult.lugarNormalizado} (${geoResult.latitud}, ${geoResult.longitud})`);
    } catch (e: any) {
      setGeoStatus('error');
      setGeoMessage(e.message || "No se encontró esta ubicación, intenta ser más específico");
    }
  };

  const handleGenerateManual = async () => {
    setIsGenerating(true);
    try {
      let latitud = pendingFicha.latitud ? parseFloat(pendingFicha.latitud.toString()) : 0;
      let longitud = pendingFicha.longitud ? parseFloat(pendingFicha.longitud.toString()) : 0;
      let timezone = pendingFicha.timezone || 'UTC';
      
      if (!latitud && !longitud && pendingFicha.lugar) {
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
      const updatedFicha = { ...pendingFicha, preview_perfilVisual: perfilVisual, preview_manual: manualText, preview_dimensiones: dimensiones };
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
              <form onSubmit={handleSubmit(onEditSubmit as any)} className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-serif text-[#4A4E4D]">Editar Datos</h2>
                  <button type="button" onClick={() => setIsEditing(false)} className="text-stone-500 hover:text-stone-800">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-stone-600">Nombre</label>
                    <input {...register("nombre")} className="w-full bg-[#F9F7F1] border border-[#EAE2D6] rounded-xl py-3 px-4 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#A5A58D]" />
                    {errors.nombre && <p className="text-red-500 text-xs">{errors.nombre.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-stone-600">Fecha de Nacimiento</label>
                    <input type="date" {...register("fechaNacimiento")} className="w-full bg-[#F9F7F1] border border-[#EAE2D6] rounded-xl py-3 px-4 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#A5A58D]" />
                    {errors.fechaNacimiento && <p className="text-red-500 text-xs">{errors.fechaNacimiento.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-stone-600">Hora de Nacimiento</label>
                    <input type="time" {...register("hora")} className="w-full bg-[#F9F7F1] border border-[#EAE2D6] rounded-xl py-3 px-4 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#A5A58D]" />
                    {errors.hora && <p className="text-red-500 text-xs">{errors.hora.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-stone-600">Lugar de Nacimiento</label>
                    <div className="relative">
                      <input type="text" placeholder="Ej: Las Palmas de Gran Canaria, España" {...register("lugar", { onBlur: handleVerificarUbicacion })} className="w-full bg-[#F9F7F1] border border-[#EAE2D6] rounded-xl py-3 px-4 pr-12 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#A5A58D]" />
                      <button type="button" onClick={handleVerificarUbicacion} disabled={geoStatus === 'loading'} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-stone-400 hover:text-stone-600 bg-transparent rounded-lg">
                        {geoStatus === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5" />}
                      </button>
                    </div>
                    {geoMessage && (
                      <p className={`text-xs mt-1 ${geoStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {geoMessage}
                      </p>
                    )}
                    {errors.lugar && <p className="text-red-500 text-xs">{errors.lugar.message}</p>}
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-stone-600">Género</label>
                    <select {...register("genero")} className="w-full bg-[#F9F7F1] border border-[#EAE2D6] rounded-xl py-3 px-4 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#A5A58D]">
                      <option value="hombre">hombre</option>
                      <option value="mujer">mujer</option>
                      <option value="no binario">no binario</option>
                      <option value="prefiero no decirlo">prefiero no decirlo</option>
                    </select>
                    {errors.genero && <p className="text-red-500 text-xs">{errors.genero.message}</p>}
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-stone-600">Antigüedad (años)</label>
                    <select {...register("antiguedad_anos", { valueAsNumber: true })} className="w-full bg-[#F9F7F1] border border-[#EAE2D6] rounded-xl py-3 px-4 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#A5A58D]">
                      <option value={0}>Recién llegado/a (menos de 3 meses)</option>
                      <option value={0.5}>Menos de 1 año</option>
                      <option value={1}>1 año</option>
                      <option value={2}>2 años</option>
                      <option value={3}>3 años</option>
                      <option value={4}>4 años</option>
                      <option value={5}>5 años o más</option>
                    </select>
                    {errors.antiguedad_anos && <p className="text-red-500 text-xs">{errors.antiguedad_anos.message}</p>}
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-sm font-medium text-stone-600">Saberes y recorrido vital</label>
                    <textarea {...register("saberes")} rows={4} placeholder="Tu formación, experiencias, oficios, proyectos... todo cuenta" className="w-full bg-[#F9F7F1] border border-[#EAE2D6] rounded-xl py-3 px-4 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#A5A58D]" />
                    {errors.saberes && <p className="text-red-500 text-xs">{errors.saberes.message}</p>}
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-sm font-medium text-stone-600">Estado de tensión</label>
                    <textarea {...register("tension")} rows={4} placeholder="¿Qué estás sintiendo hoy en la convivencia?" className="w-full bg-[#F9F7F1] border border-[#EAE2D6] rounded-xl py-3 px-4 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#A5A58D]" />
                    {errors.tension && <p className="text-red-500 text-xs">{errors.tension.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-stone-600">Participación en Kanarii</label>
                    <textarea {...register("rol_comunidad")} rows={4} placeholder="¿Cómo contribuyes o te gustaría contribuir al proyecto?" className="w-full bg-[#F9F7F1] border border-[#EAE2D6] rounded-xl py-3 px-4 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#A5A58D]" />
                    {errors.rol_comunidad && <p className="text-red-500 text-xs">{errors.rol_comunidad.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-stone-600">Rol</label>
                    <select {...register("rol")} className="w-full bg-[#F9F7F1] border border-[#EAE2D6] rounded-xl py-3 px-4 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#A5A58D]">
                      <option value="propietario">Propietario / Núcleo</option>
                      <option value="miembro">Miembro</option>
                      <option value="voluntario">Voluntario</option>
                    </select>
                    {errors.rol && <p className="text-red-500 text-xs">{errors.rol.message}</p>}
                  </div>

                  {watchRol === 'voluntario' && (
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-stone-600">Fecha de salida (opcional)</label>
                      <input type="date" {...register("fechaSalida")} className="w-full bg-[#F9F7F1] border border-[#EAE2D6] rounded-xl py-3 px-4 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#A5A58D]" />
                    </div>
                  )}
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
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <h2 className="text-3xl font-serif text-[#4A4E4D]">Tus datos de registro</h2>
                      {pendingFicha?.rol && (
                        <div className="flex">
                          {pendingFicha.rol === 'propietario' && <span className="px-3 py-1 bg-green-800 text-white rounded-full text-xs font-medium">Propietario/a</span>}
                          {pendingFicha.rol === 'miembro' && <span className="px-3 py-1 bg-green-600 text-white rounded-full text-xs font-medium">Miembro</span>}
                          {pendingFicha.rol === 'voluntario' && (
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              pendingFicha.fechaSalida && new Date(pendingFicha.fechaSalida) < new Date() 
                                ? 'bg-teal-50 text-teal-700 border border-teal-200 opacity-80'
                                : 'bg-teal-600 text-white'
                            }`}>
                              Voluntario/a {pendingFicha.fechaSalida ? (
                                new Date(pendingFicha.fechaSalida) < new Date()
                                  ? '· ya partió'
                                  : `· hasta ${new Date(pendingFicha.fechaSalida).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`
                              ) : ''}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
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
                        <p className="text-stone-700">{pendingFicha.fechaNacimiento} a las {pendingFicha.hora}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-1">Lugar</h4>
                        <p className="text-stone-700">{pendingFicha.lugar}</p>
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
                      <h4 className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-1">Saberes y Recorrido Vital</h4>
                      <p className="text-stone-700">{pendingFicha.saberes}</p>
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
                        <p className="text-stone-700">{pendingFicha.rol_comunidad}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-1">Antigüedad</h4>
                        <p className="text-stone-700">{pendingFicha.antiguedad_anos}</p>
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
