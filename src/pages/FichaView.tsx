import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useComunidad } from '../contexts/ComunidadContext';
import { useFicha } from '../hooks/useFicha';
import { User, Edit2, Check, X, Fingerprint, Sparkles, Users, HeartPulse, History, RefreshCw, Loader2, MapPin, LogOut, Eye, Copy, Download } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { saveFicha, saveManual, saveResumenManual, DatosOnboarding, getComunidades, Comunidad, getTriadaFromFicha, Ficha, FichaDatosPersona, PRIVACIDAD_DEFAULT } from '../lib/appService';
import Markdown from 'react-markdown';
import { ManualSeccionesViewer } from '../components/ManualSeccionesViewer';
import { geocodeLugar } from '../lib/geocoding';
import { useComunidadActions } from '../hooks/useComunidadActions';
import { useTagArray } from '../hooks/useTagArray';
import { TagArrayEditor } from '../components/ui/TagArrayEditor';
import { FieldError } from '../components/ui/FieldError';
import { calcularKin } from '../lib/kinMaya';
import { useToast } from '../hooks/useToast';
import { generateManualPdf, convertMarkdownToHtml, PdfSection } from '../lib/utils/generatePdf';

const SECCIONES_MANUAL = [
  { id: 'adn_astral', label: 'ADN Astral', icon: '✨' },
  { id: 'anatomia_poder', label: 'Anatomía del Poder', icon: '👑' },
  { id: 'espejo_tribu', label: 'Espejo de la Tribu', icon: '👥' },
  { id: 'sintonia_cnv', label: 'Sintonía (CNV)', icon: '💬' },
  { id: 'mantenimiento_crisis', label: 'Mantenimiento y Crisis', icon: '🚨' }
] as const;

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
  const { 
    ficha, 
    loadingFicha, 
    reload,
    manualSecciones,
    seccionesLoading,
    isGeneratingResumen,
    generarSeccionLazy
  } = useFicha();
  const [editing, setEditing] = useState(false);
  const [localFicha, setLocalFicha] = useState(ficha);
  const [isGenerating, setIsGenerating] = useState(false);
  const [fichaEditadaDesdeGeneracion, setFichaEditadaDesdeGeneracion] = useState(false);
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [geoMessage, setGeoMessage] = useState('');
  const { comunidad, currentCommunityId } = useComunidad();
  const [copied, setCopied] = useState(false);
  const [activeManualTab, setActiveManualTab] = useState<'adn_astral' | 'anatomia_poder' | 'espejo_tribu' | 'sintonia_cnv' | 'mantenimiento_crisis'>('adn_astral');

  const toast = useToast();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const hasShownToastRef = useRef<boolean>(false);

  const { abandonarComunidad } = useComunidadActions();

  const handleCopyPasaporteUrl = () => {
    if (!comunidad?.slug || !appUser?.uid) return;
    const url = `${window.location.origin}/c/${comunidad.slug}/miembro/${appUser.uid}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleTogglePrivacidad = async (key: string) => {
    if (!appUser || !displayFicha) return;
    const currentPrivacidad = displayFicha.privacidad || PRIVACIDAD_DEFAULT;
    const nuevaPrivacidad = {
      ...currentPrivacidad,
      [key]: !currentPrivacidad[key as keyof typeof currentPrivacidad]
    };
    const updatedFicha = {
      ...displayFicha,
      privacidad: nuevaPrivacidad
    };

    setLocalFicha(updatedFicha);

    try {
      const triadaObj = {
        ofrendas: ofrendasState.tags,
        saberes: saberesState.tags,
        necesidades: necesidadesState.tags
      };
      await saveFicha(appUser.uid, datos as any, displayFicha.id || appUser.uid, true, triadaObj, nuevaPrivacidad);

      const { sincronizarPasaporte } = await import('../lib/pasaporte');
      await sincronizarPasaporte(updatedFicha, appUser.uid, appUser.displayName || undefined, appUser.photoURL || undefined);
      toast.success("Ajustes de privacidad sincronizados con tu Pasaporte");
    } catch (e) {
      console.error("Error al guardar privacidad:", e);
      toast.error("Error al guardar los ajustes de privacidad");
    }
  };
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveStep, setLeaveStep] = useState<1 | 2 | 3>(1);
  const [leaveCommunityId, setLeaveCommunityId] = useState('');
  const [leaveMotivo, setLeaveMotivo] = useState('');
  const [leaveComentario, setLeaveComentario] = useState('');
  const [userCommunities, setUserCommunities] = useState<Comunidad[]>([]);
  const [loadingCommunities, setLoadingCommunities] = useState(false);
  
  function getDatosPersona(ficha: Ficha | null | undefined): Partial<FichaDatosPersona> {
    if (!ficha) return {};
    if (ficha.datosPersona) return ficha.datosPersona;
    if (ficha.datosOnboarding) {
      return {
        ...ficha.datosOnboarding,
        antiguedad_anos: typeof ficha.datosOnboarding.antiguedad_anos === 'string'
          ? parseInt(ficha.datosOnboarding.antiguedad_anos, 10) || 0
          : ficha.datosOnboarding.antiguedad_anos
      } as Partial<FichaDatosPersona>;
    }
    return {};
  }

  const { register, handleSubmit, getValues, setValue, watch, formState: { errors, isSubmitting }, reset } = useForm<FichaFormData>({
    // @ts-ignore
    resolver: zodResolver(fichaSchema),
    defaultValues: getDatosPersona(ficha) as FichaFormData
  });

  const watchRol = watch("rol");

  const displayFicha = localFicha || ficha;
  const datos = getDatosPersona(displayFicha);
  const triada = getTriadaFromFicha(displayFicha);

  const resumen = displayFicha?.resumenManual as any;
  const secciones = resumen?.secciones || {};
  const todasGeneradas = SECCIONES_MANUAL.every(sec => {
    const uid = appUser?.uid || displayFicha?.userId || displayFicha?.id || '';
    const enFirestore = !!secciones[sec.id]?.narrativa;
    const enMemoria = !!manualSecciones[sec.id];
    const enCache = uid ? !!sessionStorage.getItem(`manual_${uid}_${sec.id}`) : false;
    return enFirestore || enMemoria || enCache;
  });

  useEffect(() => {
    if (loadingFicha || !displayFicha?.resumenManual || hasShownToastRef.current) return;

    if (!todasGeneradas) {
      toast.info("Visita cada pestaña para generar tu manual. Podrás descargarlo en PDF cuando estén todas listas.");
      hasShownToastRef.current = true;
    }
  }, [loadingFicha, displayFicha, todasGeneradas, toast]);

  const handleDownloadPdf = () => {
    setIsGeneratingPdf(true);
    try {
      const nombreMiembro = datos?.nombreCompleto || appUser?.displayName || 'Miembro de Kanarii';
      const arquetipo = displayFicha?.perfilVisual?.arquetipo || 'Miembro';
      const fecha = new Date().toLocaleDateString('es-ES');

      const secciones: PdfSection[] = SECCIONES_MANUAL.map(sec => {
        const uid = appUser?.uid || displayFicha?.userId || displayFicha?.id || '';
        const enFirestore = (displayFicha?.resumenManual as any)?.secciones?.[sec.id]?.narrativa || '';
        const enMemoria = manualSecciones[sec.id] || '';
        const enCache = uid ? sessionStorage.getItem(`manual_${uid}_${sec.id}`) || '' : '';
        const narrativa = enFirestore || enMemoria || enCache;
        const contenidoHtml = convertMarkdownToHtml(narrativa);
        return {
          titulo: sec.label,
          contenidoHtml
        };
      });

      generateManualPdf({
        nombreMiembro,
        arquetipo,
        fecha,
        secciones
      });
      
      toast.success("¡Preparando documento para imprimir/guardar como PDF!");
    } catch (err) {
      console.error("Error al generar PDF:", err);
      toast.error("Hubo un error al preparar el PDF del manual.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  useEffect(() => {
    if (displayFicha?.resumenManual) {
      generarSeccionLazy(activeManualTab);
    }
  }, [activeManualTab, displayFicha?.resumenManual, generarSeccionLazy]);

  const ofrendasState = useTagArray(getTriadaFromFicha(ficha).ofrendas);
  const saberesState = useTagArray(getTriadaFromFicha(ficha).saberes);
  const necesidadesState = useTagArray(getTriadaFromFicha(ficha).necesidades);

  // Calcular Kin Maya personal si hay fecha de nacimiento
  const kinMaya = datos?.fechaNacimiento ? calcularKin(datos.fechaNacimiento) : null;

  useEffect(() => {
    if (displayFicha) {
      const triadaObj = getTriadaFromFicha(displayFicha);
      ofrendasState.setTags(triadaObj.ofrendas || []);
      saberesState.setTags(triadaObj.saberes || []);
      necesidadesState.setTags(triadaObj.necesidades || []);
    }
  }, [displayFicha]);

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
      reset(getDatosPersona(ficha) as FichaFormData);
    }
  }, [ficha, loadingFicha]);

  useEffect(() => {
    if (showLeaveModal && appUser?.communityIds) {
      setLoadingCommunities(true);
      getComunidades().then(comms => {
        const filtered = comms.filter(c => appUser.communityIds?.includes(c.id));
        setUserCommunities(filtered);
        
        // Auto-seleccionar la comunidad actual
        if (currentCommunityId && appUser.communityIds.includes(currentCommunityId)) {
          setLeaveCommunityId(currentCommunityId);
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
    if (!appUser) return;
    const fichaId = displayFicha?.id || appUser.uid;
    
    const triadaObj = {
      ofrendas: ofrendasState.tags,
      saberes: saberesState.tags,
      necesidades: necesidadesState.tags
    };

    await saveFicha(appUser.uid, data as DatosOnboarding, fichaId, true, triadaObj);
    setLocalFicha({ 
      ...displayFicha, 
      id: fichaId,
      datosPersona: data as FichaDatosPersona, 
      datosOnboarding: undefined,
      triada: triadaObj
    });
    setEditing(false);
    if (displayFicha?.manualGenerado) {
      setFichaEditadaDesdeGeneracion(true);
    }
  };

  const handleRegenerateManual = async () => {
    if (!appUser || !datos) return;
    const fichaId = displayFicha?.id || appUser.uid;
    setIsGenerating(true);
    const triadaObj = {
      ofrendas: ofrendasState.tags,
      saberes: saberesState.tags,
      necesidades: necesidadesState.tags
    };
    try {
      await saveFicha(appUser.uid, datos as DatosOnboarding, fichaId, false, triadaObj);
      await saveResumenManual(appUser.uid, null, '');
      reload();
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
            <User className="text-[#6B705C] w-8 h-8" />
            <h1 className="text-3xl font-serif text-[#4A4E4D]">Tu Ficha Comunitaria</h1>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-[#EAE2D6] p-8 relative overflow-hidden mb-8">
          {!datos?.fechaNacimiento && (
            <div className="mb-6 p-5 bg-amber-50/70 border border-amber-200/60 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center md:text-left">
                <h3 className="font-serif font-bold text-base text-[#3E2723]">
                  ¿Quieres descubrir tu Manual Galáctico Completo? 🔮
                </h3>
                <p className="text-xs text-[#5D4037]/80">
                  Tienes tu Perfil Básico en 1 minuto activo. Rellena tu fecha y lugar de nacimiento al editar para activar tu Kin Maya, Carta Astral y Diseño Humano.
                </p>
              </div>
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-[#6B705C] hover:bg-[#5A5A40] text-white text-xs font-bold rounded-xl transition-all whitespace-nowrap shrink-0"
              >
                Completar Manual Galáctico
              </button>
            </div>
          )}
          <div className="absolute top-0 left-0 w-2 h-full bg-[#CB997E]"></div>
          
          {!editing ? (
            <div className="space-y-8">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-serif text-[#4A4E4D]">{datos?.nombre}</h2>
                    {comunidad?.slug && appUser?.uid && (
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/c/${comunidad.slug}/miembro/${appUser.uid}`)}
                          className="p-1 rounded-full hover:bg-stone-100 text-[#5A5A40] transition-colors"
                          title="Ver Pasaporte Comunitario"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={handleCopyPasaporteUrl}
                          className="p-1 rounded-full hover:bg-stone-100 text-[#5A5A40] transition-colors flex items-center gap-1.5"
                          title="Copiar enlace del Pasaporte"
                        >
                          <Copy size={18} />
                          {copied && (
                            <span className="text-xs font-serif text-[#CB997E] animate-fadeIn">
                              ¡Copiado!
                            </span>
                          )}
                        </button>
                      </div>
                    )}
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

                  {/* Firma Galáctica (Kin Maya) */}
                  {kinMaya && (
                    <div className="mt-4 pt-4 border-t border-[#EAE2D6]">
                      <div className="flex items-start gap-4 bg-[#F9F7F1] rounded-2xl px-5 py-4 border border-[#EAE2D6]">
                        <span className="text-3xl leading-none mt-0.5" aria-hidden="true">{kinMaya.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-1">Firma Galáctica</h4>
                          <p className="text-stone-800 font-medium text-base">{kinMaya.descripcionCorta}</p>
                          <p className="text-stone-500 text-sm mt-1 leading-relaxed">{kinMaya.rolComunitario}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Tríada Comunitaria */}
                <div className="space-y-6 md:col-span-2">
                  <div className="flex items-center gap-2 text-[#8A817C] border-b border-[#EAE2D6] pb-2">
                    <Sparkles className="w-5 h-5" />
                    <h3 className="text-lg font-serif">Tríada Comunitaria</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Ofrendas */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                        Ofrendas (Lo que aporto)
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {triada.ofrendas.length > 0 ? (
                          triada.ofrendas.map((tag, idx) => (
                            <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-stone-900 border border-emerald-200 dark:bg-emerald-950/20 dark:text-stone-100 dark:border-emerald-900/40">
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs italic text-stone-400">Sin definir todavía.</span>
                        )}
                      </div>
                    </div>

                    {/* Saberes */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-sky-700 dark:text-sky-400 uppercase tracking-wider">
                        Saberes y Habilidades
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {triada.saberes.length > 0 ? (
                          triada.saberes.map((tag, idx) => (
                            <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-stone-900 border border-sky-200 dark:bg-sky-950/20 dark:text-stone-100 dark:border-sky-900/40">
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs italic text-stone-400">Sin definir todavía.</span>
                        )}
                      </div>
                    </div>

                    {/* Necesidades */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                        Necesidades (Lo que requiero)
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {triada.necesidades.length > 0 ? (
                          triada.necesidades.map((tag, idx) => (
                            <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-stone-900 border border-amber-200 dark:bg-amber-950/20 dark:text-stone-100 dark:border-amber-900/40">
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs italic text-stone-400">Sin definir todavía.</span>
                        )}
                      </div>
                    </div>
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
                  <FieldError error={errors.nombre} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-stone-600">Fecha de Nacimiento</label>
                  <input type="date" {...register("fechaNacimiento")} className="w-full bg-[#F9F7F1] border border-[#EAE2D6] rounded-xl py-3 px-4 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#A5A58D]" />
                  <FieldError error={errors.fechaNacimiento} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-stone-600">Hora de Nacimiento</label>
                  <input type="time" {...register("hora")} className="w-full bg-[#F9F7F1] border border-[#EAE2D6] rounded-xl py-3 px-4 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#A5A58D]" />
                  <FieldError error={errors.hora} />
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
                  <FieldError error={errors.lugar} />
                </div>
                
                <div className="space-y-1">
                  <label className="text-sm font-medium text-stone-600">Género</label>
                  <select {...register("genero")} className="w-full bg-[#F9F7F1] border border-[#EAE2D6] rounded-xl py-3 px-4 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#A5A58D]">
                    <option value="hombre">hombre</option>
                    <option value="mujer">mujer</option>
                    <option value="no binario">no binario</option>
                    <option value="prefiero no decirlo">prefiero no decirlo</option>
                  </select>
                  <FieldError error={errors.genero} />
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
                  <FieldError error={errors.antiguedad_anos} />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium text-stone-600">Saberes y recorrido vital</label>
                  <textarea {...register("saberes")} rows={4} placeholder="Tu formación, experiencias, oficios, proyectos... todo cuenta" className="w-full bg-[#F9F7F1] border border-[#EAE2D6] rounded-xl py-3 px-4 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#A5A58D]" />
                  <FieldError error={errors.saberes} />
                </div>

                <div className="space-y-4 md:col-span-2 border-t border-[#EAE2D6] pt-4 mt-2">
                  <h3 className="text-lg font-serif text-[#4A4E4D]">Tríada Comunitaria (Estructurada)</h3>
                  <p className="text-xs text-stone-500">
                    Define tags específicos para facilitar la ayuda y colaboración en la comunidad. Presiona enter o introduce una coma para añadir cada elemento.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <TagArrayEditor
                      value={ofrendasState.tags}
                      onChange={ofrendasState.setTags}
                      label="Ofrendas (Lo que aportas)"
                      placeholder="Ej: diseño web, carpintería, cuidado..."
                      colorScheme="green"
                    />
                    
                    <TagArrayEditor
                      value={saberesState.tags}
                      onChange={saberesState.setTags}
                      label="Saberes y Habilidades"
                      placeholder="Ej: agroecología, facilitación..."
                      colorScheme="blue"
                      helperText="Habilidades o saberes específicos."
                    />
                    
                    <TagArrayEditor
                      value={necesidadesState.tags}
                      onChange={necesidadesState.setTags
                      }
                      label="Necesidades (Lo que requieres)"
                      placeholder="Ej: transporte, programar, herramientas..."
                      colorScheme="orange"
                    />
                  </div>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium text-stone-600">Estado de tensión</label>
                  <textarea {...register("tension")} rows={4} placeholder="¿Qué estás sintiendo hoy en la convivencia?" className="w-full bg-[#F9F7F1] border border-[#EAE2D6] rounded-xl py-3 px-4 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#A5A58D]" />
                  <FieldError error={errors.tension} />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-stone-600">Participación en Kanarii</label>
                  <textarea {...register("rol_comunidad")} rows={4} placeholder="¿Cómo contribuyes o te gustaría contribuir al proyecto?" className="w-full bg-[#F9F7F1] border border-[#EAE2D6] rounded-xl py-3 px-4 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#A5A58D]" />
                  <FieldError error={errors.rol_comunidad} />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-stone-600">Rol</label>
                  <select {...register("rol")} className="w-full bg-[#F9F7F1] border border-[#EAE2D6] rounded-xl py-3 px-4 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#A5A58D]">
                    <option value="propietario">Propietario / Núcleo</option>
                    <option value="miembro">Miembro</option>
                    <option value="voluntario">Voluntario</option>
                  </select>
                  <FieldError error={errors.rol} />
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

        {/* Panel de Privacidad */}
        {!editing && (
          <div className="bg-white rounded-3xl shadow-sm border border-[#EAE2D6] p-8 relative overflow-hidden mb-8">
            <div className="absolute top-0 left-0 w-2 h-full bg-[#A5A58D]"></div>
            
            <div className="flex items-center gap-3 mb-6">
              <Eye className="text-[#6B705C] w-6 h-6" />
              <h3 className="text-xl font-serif text-[#4A4E4D]">Privacidad del Pasaporte Comunitario</h3>
            </div>
            
            <p className="text-stone-500 text-sm mb-6 leading-relaxed">
              El Pasaporte Comunitario es tu carta de presentación social y pública en Kanarii. Elige qué dimensiones de tu perfil deseas compartir públicamente con la comunidad.
            </p>
            
            <div className="space-y-4">
              {[
                { key: 'arquetipo', label: 'Arquetipo y Perfil', desc: 'Muestra tu arquetipo de personalidad, fortalezas, sombras y rol sociocrático sugerido.' },
                { key: 'disenoHumano', label: 'Diseño Humano', desc: 'Muestra tu tipo de diseño humano, autoridad y perfil.' },
                { key: 'kinMaya', label: 'Kin Maya / Firma Galáctica', desc: 'Muestra tu Kin Maya, sello galáctico y rol comunitario maya.' },
                { key: 'datosAstrologicos', label: 'Datos Astrológicos', desc: 'Muestra tu Sol, Luna, Ascendente y elementos dominantes.' },
                { key: 'manualCompleto', label: 'Manual de Usuario Humano', desc: 'Muestra el manual de convivencia autogenerado con tus 5 secciones.' }
              ].map(({ key, label, desc }) => {
                const privacidad = displayFicha?.privacidad || PRIVACIDAD_DEFAULT;
                const isEnabled = privacidad[key as keyof typeof privacidad] ?? true;
                return (
                  <div key={key} className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-[#F9F7F1] border border-[#EAE2D6] transition-all duration-200">
                    <div className="flex-1 min-w-0">
                      <span className="font-serif font-medium text-stone-800 text-sm md:text-base">{label}</span>
                      <p className="text-stone-500 text-xs md:text-sm mt-0.5 leading-relaxed">{desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTogglePrivacidad(key)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isEnabled ? 'bg-[#6B705C]' : 'bg-stone-300'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          isEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Manual Galáctico Section */}
        {isGeneratingResumen || (displayFicha?.perfilVisual?.arquetipo && !displayFicha?.resumenManual) ? (
          <div className="bg-white rounded-3xl shadow-sm border border-[#EAE2D6] p-8 relative overflow-hidden flex flex-col items-center justify-center text-center">
            <div className="absolute top-0 left-0 w-2 h-full bg-[#8A817C]"></div>
            <div className="w-16 h-16 bg-[#F9F7F1] rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-[#8A817C] animate-pulse" />
            </div>
            <h2 className="text-2xl font-serif text-[#4A4E4D] mb-2">Estructurando tu Manual Galáctico</h2>
            <p className="text-stone-500 max-w-md mx-auto mb-6">
              El Facilitador Galáctico está analizando tus tránsitos y diseño para estructurar las 5 secciones de tu manual...
            </p>
            <div className="flex items-center gap-3 px-6 py-3 bg-[#F9F7F1] text-stone-500 rounded-full font-medium">
              <Loader2 className="w-5 h-5 animate-spin text-[#8A817C]" />
              <span>Tejiendo la estructura inicial...</span>
            </div>
          </div>
        ) : displayFicha?.resumenManual ? (
          <div className="bg-white rounded-3xl shadow-sm border border-[#EAE2D6] p-8 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-2 h-full bg-[#8A817C]"></div>
             
             <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3 text-[#4A4E4D]">
                  <Sparkles className="w-7 h-7 text-[#8A817C]" />
                  <h2 className="text-2xl font-serif">Manual de Usuario Humano</h2>
                </div>
                
                <div className="flex items-center gap-3">
                  {todasGeneradas && (
                    <button
                      type="button"
                      onClick={handleDownloadPdf}
                      disabled={isGeneratingPdf}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full hover:bg-emerald-100 transition-colors shadow-sm disabled:opacity-50"
                    >
                      {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      <span className="text-sm font-medium">
                        {isGeneratingPdf ? 'Generando PDF...' : 'Descargar mi Manual'}
                      </span>
                    </button>
                  )}

                  <button
                    onClick={handleRegenerateManual}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-4 py-2 bg-[#F9F7F1] text-stone-700 rounded-full hover:bg-[#EAE2D6] transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    <span className="text-sm font-medium">Regenerar mi manual</span>
                  </button>
                </div>
             </div>

             <ManualSeccionesViewer
               ficha={displayFicha}
               manualSecciones={manualSecciones}
               seccionesLoading={seccionesLoading}
               generarSeccionLazy={generarSeccionLazy}
             />
             
             {displayFicha.fechaGeneracion && (
                <div className="mt-8 pt-6 border-t border-[#EAE2D6] flex justify-between items-center text-sm text-stone-400">
                  <span>Generado por el Facilitador Galáctico</span>
                  <span>
                    El {new Date(displayFicha.fechaGeneracion.toDate ? displayFicha.fechaGeneracion.toDate() : displayFicha.fechaGeneracion).toLocaleDateString()}
                  </span>
                </div>
             )}
          </div>
        ) : contenidoManual ? (
          <div className="bg-white rounded-3xl shadow-sm border border-[#EAE2D6] p-8 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-2 h-full bg-[#8A817C]"></div>
             
             <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3 text-[#4A4E4D]">
                  <Sparkles className="w-7 h-7 text-[#8A817C]" />
                  <h2 className="text-2xl font-serif">Manual de Usuario Humano (Legacy)</h2>
                </div>
                
                <button
                  onClick={handleRegenerateManual}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-4 py-2 bg-[#F9F7F1] text-stone-700 rounded-full hover:bg-[#EAE2D6] transition-colors shadow-sm disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  <span className="text-sm font-medium">Actualizar al nuevo formato en capas</span>
                </button>
             </div>

              {contenidoManual && (
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-stone-700 font-mono text-sm whitespace-pre-wrap">
                  {contenidoManual}
                </div>
              )}
             
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
                <div className="space-y-6 text-center py-4">
                  <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                    <LogOut className="w-8 h-8 text-red-500" />
                  </div>
                  <div>
                    <h4 className="text-lg font-serif text-stone-900 mb-2">¿Confirmas que quieres salir?</h4>
                    <p className="text-sm text-stone-500 max-w-sm mx-auto">
                      Esta acción eliminará tu acceso a la comunidad. Podrás volver a unirte en el futuro si lo deseas.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer del modal */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-stone-100">
              {leaveStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setLeaveStep(prev => (prev - 1) as 1 | 2 | 3)}
                  className="px-4 py-2 text-stone-500 hover:text-stone-800 text-sm font-medium transition-colors"
                >
                  ← Atrás
                </button>
              ) : (
                <div />
              )}
              
              {leaveStep < 3 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (leaveStep === 2 && !leaveMotivo) return;
                    setLeaveStep(prev => (prev + 1) as 1 | 2 | 3);
                  }}
                  disabled={leaveStep === 2 && !leaveMotivo}
                  className="px-6 py-2 bg-[#4A4E4D] text-white rounded-xl text-sm font-medium hover:bg-[#363a39] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continuar →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleLeaveCommunity}
                  className="px-6 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Confirmar salida
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
