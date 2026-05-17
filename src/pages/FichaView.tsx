import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFicha } from '../hooks/useFicha';
import { Leaf, Edit2, Check, X, Fingerprint, Sparkles, Users, HeartPulse, History, RefreshCw, Loader2, MapPin, LogOut } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { saveFicha, saveManual, DatosOnboarding, getComunidades, Comunidad } from '../lib/appService';
import Markdown from 'react-markdown';
import { ManualViewer } from '../components/ManualViewer';
import { geocodeLugar } from '../lib/geocoding';
import { useComunidadActions } from '../hooks/useComunidadActions';

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

export function FichaView() {
  const { appUser, logout } = useAuth();
  const navigate = useNavigate();
  const { ficha, loadingFicha } = useFicha();
  const [editing, setEditing] = useState(false);
  const [localFicha, setLocalFicha] = useState(ficha);
  const [isGenerating, setIsGenerating] = useState(false);
  const [fichaEditadaDesdeGeneracion, setFichaEditadaDesdeGeneracion] = useState(false);
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [geoMessage, setGeoMessage] = useState('');
  
  const { abandonarComunidad } = useComunidadActions();
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveStep, setLeaveStep] = useState<1 | 2 | 3>(1);
  const [leaveCommunityId, setLeaveCommunityId] = useState('');
  const [leaveMotivo, setLeaveMotivo] = useState('');
  const [leaveComentario, setLeaveComentario] = useState('');
  const [userCommunities, setUserCommunities] = useState<Comunidad[]>([]);
  const [loadingCommunities, setLoadingCommunities] = useState(false);
  
  function getDatosPersona(ficha: any) {
    return ficha?.datosPersona ?? ficha?.datosOnboarding ?? {};
  }

  const { register, handleSubmit, getValues, setValue, watch, formState: { errors, isSubmitting }, reset } = useForm<FichaFormData>({
    // @ts-ignore
    resolver: zodResolver(fichaSchema),
    defaultValues: getDatosPersona(ficha) as any
  });

  const watchRol = watch("rol");

  const displayFicha = localFicha || ficha;
  const datos = getDatosPersona(displayFicha);

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

  useEffect(() => {
    if (!loadingFicha && !ficha && !localFicha) {
      navigate('/onboarding');
    } else if (ficha) {
      setLocalFicha(ficha);
      reset(getDatosPersona(ficha) as any);
    }
  }, [ficha, loadingFicha]);

  useEffect(() => {
    if (showLeaveModal && appUser?.communityIds) {
      setLoadingCommunities(true);
      getComunidades().then(comms => {
        const filtered = comms.filter(c => appUser.communityIds?.includes(c.id));
        setUserCommunities(filtered);
        
        // Auto-seleccionar la comunidad actual
        if (displayFicha?.communityId && appUser.communityIds.includes(displayFicha.communityId)) {
          setLeaveCommunityId(displayFicha.communityId);
        } else if (filtered.length > 0) {
          setLeaveCommunityId(filtered[0].id);
        }
        
        // Si pertenece a 1 sola comunidad, salta directamente al paso 2
        if (appUser.communityIds.length <= 1) {
          setLeaveStep(2);
        } else {
          setLeaveStep(1);
        }
        setLoadingCommunities(false);
      }).catch(err => {
        console.error("Failed to load user communities:", err);
        setLoadingCommunities(false);
      });
    }
  }, [showLeaveModal, appUser, displayFicha]);

  if (loadingFicha || (!ficha && !localFicha)) return null;

  const handleLeaveCommunity = async () => {
    if (!appUser || !leaveCommunityId) return;
    
    const feedback = {
      motivo: leaveMotivo,
      comentario: leaveComentario
    };
    
    setShowLeaveModal(false);
    await abandonarComunidad(appUser.uid, leaveCommunityId, feedback, {
      onSuccess: () => {
        navigate('/comunidades');
      }
    });
  };

  const onSubmit = async (data: FichaFormData) => {
    if (!appUser || !displayFicha?.id) return;
    await saveFicha(appUser.uid, data as DatosOnboarding, displayFicha.id, true);
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

  const contenidoManual = displayFicha?.manualMarkdown ?? displayFicha?.manualGenerado ?? null;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800 p-6 flex flex-col items-center pb-20 md:pb-6">
      <div className="w-full max-w-3xl">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-3">
            <Leaf className="text-[#6B705C] w-8 h-8" />
            <h1 className="text-3xl font-serif text-[#4A4E4D]">Tu Ficha Comunitaria</h1>
          </div>
          {/* Navegación eliminada (unificada en Sidebar/BottomNav) */}
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-[#EAE2D6] p-8 relative overflow-hidden mb-8">
          <div className="absolute top-0 left-0 w-2 h-full bg-[#CB997E]"></div>
          
          {!editing ? (
            <div className="space-y-8">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-serif text-[#4A4E4D]">{datos?.nombre}</h2>
                    {datos?.rol && (
                      <div className="flex">
                        {datos.rol === 'propietario' && <span className="px-3 py-1 bg-green-800 text-white rounded-full text-xs font-medium">Propietario/a</span>}
                        {datos.rol === 'miembro' && <span className="px-3 py-1 bg-green-600 text-white rounded-full text-xs font-medium">Miembro</span>}
                        {datos.rol === 'voluntario' && (
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            datos.fechaSalida && new Date(datos.fechaSalida) < new Date() 
                              ? 'bg-teal-50 text-teal-700 border border-teal-200 opacity-80'
                              : 'bg-teal-600 text-white'
                          }`}>
                            Voluntario/a {datos.fechaSalida ? (
                              new Date(datos.fechaSalida) < new Date()
                                ? '· ya partió'
                                : `· hasta ${new Date(datos.fechaSalida).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`
                            ) : ''}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#F9F7F1] text-stone-700 rounded-full hover:bg-[#EAE2D6] transition-colors shadow-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Editar</span>
                  </button>
                  {appUser?.communityIds && appUser.communityIds.length > 0 && (
                    <button
                      onClick={() => setShowLeaveModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-full hover:bg-red-100 transition-colors shadow-sm border border-red-200"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm font-medium">Salir de la Comunidad</span>
                    </button>
                  )}
                </div>
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
                    <h4 className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-1">Saberes y Recorrido Vital</h4>
                    <p className="text-stone-700">{datos?.saberes}</p>
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
                      <p className="text-stone-700">{datos?.rol_comunidad}</p>
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
            <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-serif text-[#4A4E4D]">Editar Ficha</h2>
                <button type="button" onClick={() => setEditing(false)} className="text-stone-500 hover:text-stone-800">
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
          )}
        </div>

        {/* Manual Galáctico Section */}
        {contenidoManual ? (
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

             <ManualViewer content={contenidoManual} />
             
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
              El Facilitador Galáctico analizará tu carta astral y creará tu Manual de Usuario personalizado.
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

      {showLeaveModal && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full border border-[#EAE2D6] shadow-2xl relative overflow-hidden animate-scaleIn flex flex-col max-h-[90vh]">
            <div className="absolute top-0 left-0 w-full h-2 bg-[#CB997E]"></div>
            
            {/* Header del modal */}
            <div className="flex justify-between items-center mb-6 border-b border-stone-100 pb-4">
              <div>
                <h3 className="text-xl font-serif text-stone-900">Salir de la Comunidad</h3>
                <p className="text-xs text-stone-400 font-bold uppercase tracking-wider mt-1">Paso {leaveStep} de 3</p>
              </div>
              <button 
                onClick={() => {
                  setShowLeaveModal(false);
                  setLeaveStep(1);
                  setLeaveMotivo('');
                  setLeaveComentario('');
                }} 
                className="p-1.5 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido según el paso */}
            <div className="flex-1 overflow-y-auto pr-1">
              {leaveStep === 1 && (
                <div className="space-y-4">
                  <div className="text-sm text-stone-600 mb-2">
                    Perteneces a múltiples comunidades. ¿De cuál de ellas deseas salir?
                  </div>
                  {loadingCommunities ? (
                    <div className="flex flex-col items-center justify-center py-12 text-stone-400">
                      <Loader2 className="w-8 h-8 animate-spin mb-2" />
                      <span className="text-sm">Cargando tus comunidades...</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {userCommunities.map(comm => (
                        <label 
                          key={comm.id} 
                          className={`flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                            leaveCommunityId === comm.id 
                              ? 'border-[#CB997E] bg-[#FDFBF7] shadow-sm' 
                              : 'border-stone-200 hover:border-stone-300'
                          }`}
                        >
                          <input 
                            type="radio" 
                            name="leave-community" 
                            checked={leaveCommunityId === comm.id}
                            onChange={() => setLeaveCommunityId(comm.id)}
                            className="text-[#CB997E] focus:ring-[#CB997E] h-4 w-4 border-stone-300"
                          />
                          <div className="flex-1">
                            <span className="font-serif font-medium text-stone-800 text-base">{comm.nombre}</span>
                            {comm.descripcion && (
                              <p className="text-xs text-stone-400 line-clamp-1 mt-0.5">{comm.descripcion}</p>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {leaveStep === 2 && (
                <div className="space-y-5">
                  <div>
                    <p className="text-sm text-stone-600">
                      Para ayudarnos a cuidar y mejorar la convivencia en Kanarii, por favor comparte el motivo principal de tu baja.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest block mb-1">Motivo (Obligatorio)</label>
                    <div className="grid grid-cols-1 gap-2.5">
                      {[
                        "Me voy a vivir a otro lugar",
                        "No tengo tiempo",
                        "No me siento alineado/a",
                        "Conflicto no resuelto",
                        "Motivo personal",
                        "Otro"
                      ].map((motivo) => (
                        <button
                          key={motivo}
                          type="button"
                          onClick={() => setLeaveMotivo(motivo)}
                          className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                            leaveMotivo === motivo
                              ? 'bg-[#4A4E4D] text-white border-[#4A4E4D]'
                              : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                          }`}
                        >
                          {motivo}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest block mb-1">Comentario libre (Opcional)</label>
                    <textarea
                      value={leaveComentario}
                      onChange={(e) => setLeaveComentario(e.target.value)}
                      rows={3}
                      placeholder="Comparte cualquier detalle, sugerencia de mejora o agradecimiento..."
                      className="w-full bg-[#F9F7F1] border border-[#EAE2D6] rounded-xl py-3 px-4 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#A5A58D] text-sm resize-none"
                    />
                  </div>
                </div>
              )}

              {leaveStep === 3 && (
                <div className="space-y-6">
                  <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex gap-3.5 items-start">
                    <span className="text-red-500 font-bold text-lg leading-none shrink-0 mt-0.5">⚠️</span>
                    <div>
                      <h4 className="text-sm font-bold text-red-800">Consecuencias de la salida</h4>
                      <ul className="list-disc list-inside text-xs text-red-700 leading-normal mt-1.5 space-y-1">
                        <li>Perderás el acceso a los tableros de proyectos, tareas, actas y tablón.</li>
                        <li>No estarás listado como miembro activo de la comunidad.</li>
                        <li>Se revocarán tus permisos de edición e interacción.</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 bg-[#FDFBF7] rounded-2xl border border-[#EAE2D6] flex gap-3.5 items-start">
                    <span className="text-teal-600 font-bold text-lg leading-none shrink-0 mt-0.5">✓</span>
                    <div>
                      <h4 className="text-sm font-bold text-stone-800">Qué conservarás en tu perfil</h4>
                      <ul className="list-disc list-inside text-xs text-stone-600 leading-normal mt-1.5 space-y-1">
                        <li>Tu ficha de identidad comunitaria no se borrará.</li>
                        <li>Tu Manual de Usuario Humano seguirá siendo tuyo y accesible.</li>
                        <li>Tus contribuciones previas quedarán registradas históricamente.</li>
                      </ul>
                    </div>
                  </div>

                  <p className="text-xs text-stone-400 text-center italic mt-2">
                    Podrás volver a solicitar acceso o unirte con un código de invitación en cualquier momento.
                  </p>
                </div>
              )}
            </div>

            {/* Footer / Botones */}
            <div className="flex justify-between items-center mt-8 border-t border-stone-100 pt-4">
              <div>
                {leaveStep > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (leaveStep === 2 && appUser?.communityIds && appUser.communityIds.length <= 1) {
                        return;
                      }
                      setLeaveStep((prev) => (prev - 1) as any);
                    }}
                    className="px-5 py-2.5 border border-stone-200 hover:bg-stone-50 text-stone-600 rounded-xl text-sm font-medium transition-colors"
                  >
                    Atrás
                  </button>
                )}
              </div>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowLeaveModal(false);
                    setLeaveStep(1);
                    setLeaveMotivo('');
                    setLeaveComentario('');
                  }}
                  className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-sm font-medium transition-colors"
                >
                  Cancelar
                </button>

                {leaveStep < 3 ? (
                  <button
                    type="button"
                    disabled={leaveStep === 1 ? !leaveCommunityId : !leaveMotivo}
                    onClick={() => setLeaveStep((prev) => (prev + 1) as any)}
                    className="px-5 py-2.5 bg-[#A5A58D] hover:bg-[#6B705C] text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    Continuar
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleLeaveCommunity}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
                  >
                    Confirmar y Salir
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
