import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Users, CheckCircle2, Lock, Globe, BookOpen, ArrowLeft, Loader2, MessageSquare, AlertTriangle, Settings, Eye, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../contexts/AuthContext';
import { useComunidad } from '../contexts/ComunidadContext';
import { Comunidad, getComunidad, getUltimaSolicitud, SolicitudAcceso } from '../lib/appService';
import { useComunidadActions } from '../hooks/useComunidadActions';
import { useToast } from '../components/Toaster';
import { AuthGateModal } from '../components/AuthGateModal';
import { ConfiguracionComunidadPanel } from '../components/ConfiguracionComunidadPanel';
import { useCommunityMembers } from '../hooks/useCommunityMembers';
import { useTareas } from '../hooks/useTareas';
import { useProyectos } from '../hooks/useProyectos';
import { useTranslation } from 'react-i18next';

export function FichaComunidadView() {
  const { t } = useTranslation('communities');
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { appUser } = useAuth();
  const { setCommunityId } = useComunidad();
  const { solicitarAcceso, unirseComunidad, isExecuting } = useComunidadActions();
  const toast = useToast();

  const [comunidad, setComunidad] = useState<Comunidad | null>(null);
  const [loading, setLoading] = useState(true);
  const [latestRequest, setLatestRequest] = useState<SolicitudAcceso | null>(null);
  const [solicitudMsg, setSolicitudMsg] = useState('');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginMode, setLoginMode] = useState<'login' | 'onboarding'>('login');
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'presentacion' | 'miembros' | 'actividad'>('presentacion');

  const isAdmin = appUser?.role === 'admin';
  const isCommunityAdmin = !!(isAdmin || (comunidad?.adminUids && Array.isArray(comunidad.adminUids) && comunidad.adminUids.includes(appUser?.uid || '')));
  const isMember = appUser?.communityIds?.includes(comunidad?.slug || '') || false;

  const { members, loading: loadingMembers } = useCommunityMembers(comunidad?.slug);
  const { items: tareas, loading: loadingTareas } = useTareas(comunidad?.slug);
  const { items: proyectos, loading: loadingProyectos } = useProyectos(comunidad?.slug);

  const handleToggleEdit = () => {
    if (!isEditingMode && comunidad) {
      setCommunityId(comunidad.slug);
    }
    setIsEditingMode(!isEditingMode);
  };

  useEffect(() => {
    async function loadComunidad() {
      if (!slug) return;
      setLoading(true);
      try {
        const data = await getComunidad(slug);
        setComunidad(data);

        if (data && appUser) {
          const req = await getUltimaSolicitud(data.slug, appUser.uid);
          setLatestRequest(req);
        }
      } catch (err) {
        console.error('Error al cargar la comunidad:', err);
      } finally {
        setLoading(false);
      }
    }
    loadComunidad();
  }, [slug, appUser]);

  const handleJoinDirect = async () => {
    if (!comunidad || !appUser) return;
    try {
      await unirseComunidad(comunidad.slug, appUser.uid, {
        onSuccess: () => {
          toast.success('¡Te has unido a la comunidad! Bienvenido/a. 🎉');
          navigate(`/admin`);
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendRequest = async () => {
    if (!comunidad || !appUser || solicitudMsg.trim().length < 20) return;
    try {
      await solicitarAcceso(comunidad.slug, appUser.uid, solicitudMsg, {
        onSuccess: async () => {
          toast.success('Tu solicitud de acceso ha sido enviada con éxito.');
          const req = await getUltimaSolicitud(comunidad.slug, appUser.uid);
          setLatestRequest(req);
          setSolicitudMsg('');
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const openLoginModal = (mode: 'login' | 'onboarding') => {
    setLoginMode(mode);
    setIsLoginModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FDFBF7] text-[#8A817C]">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#A5A58D]" />
        <p className="font-medium font-serif">{t('loadingDetails')}</p>
      </div>
    );
  }

  if (!comunidad) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-stone-800">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500 border border-rose-100 shadow-inner">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-serif text-[#4A4E4D]">{t('notFoundTitle')}</h1>
          <p className="text-stone-600">
            {t('notFoundDesc', { slug })}
          </p>
          <div className="pt-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-[#A5A58D] hover:bg-[#6B705C] text-white py-3 px-6 rounded-2xl font-bold transition-all shadow-md"
            >
              <ArrowLeft className="w-5 h-5" />
              {t('backToHome')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isPrivate = comunidad.esPublica === false;

  if (isPrivate && !isMember) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-stone-800">
        <div className="max-w-md w-full text-center space-y-6 bg-white border border-[#EAE2D6] rounded-[2rem] p-8 shadow-lg">
          <div className="w-20 h-20 bg-[#F9F7F1] rounded-full flex items-center justify-center mx-auto text-[#6B705C] border border-[#EAE2D6]">
            <Lock className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-serif text-[#4A4E4D]">{t('privateTitle')}</h1>
          <p className="text-stone-600 leading-relaxed">
            {t('privateDesc')}
          </p>
          <div className="pt-4 flex flex-col gap-3">
            <Link
              to="/comunidades"
              className="inline-flex items-center justify-center gap-2 bg-[#A5A58D] hover:bg-[#6B705C] text-white py-3 px-6 rounded-2xl font-bold transition-all shadow-md"
            >
              {t('exploreOtherCommunities')}
            </Link>
            <Link
              to="/"
              className="text-[#CB997E] hover:underline font-bold text-sm"
            >
              {t('goToWelcome')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const hasPending = latestRequest?.estado === 'pendiente';
  const hasRejected = latestRequest?.estado === 'rechazada';

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-6 pb-24 text-stone-800 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Cabecera y Botón de Volver */}
        <div className="flex items-center justify-between">
          <Link
            to={appUser ? '/comunidades' : '/'}
            className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors font-bold text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            {appUser ? t('backToCommunities') : t('backToHome')}
          </Link>
        </div>

        {/* Ficha Principal de la Comunidad */}
        <div className="bg-white border border-[#EAE2D6] rounded-[2.5rem] shadow-xl overflow-hidden relative">
          
          {/* Portada / Banner */}
          {comunidad.bannerUrl ? (
            <div 
              className="h-48 md:h-64 bg-cover bg-center w-full" 
              style={{ backgroundImage: `url(${comunidad.bannerUrl})` }} 
            />
          ) : (
            <div 
              className="h-48 md:h-64 w-full" 
              style={{ background: 'linear-gradient(135deg, oklch(0.72 0.08 60), oklch(0.58 0.12 140))' }} 
            />
          )}

          {/* Botón de configuración/edición visible solo para admins */}
          {isCommunityAdmin && (
            <button
              onClick={handleToggleEdit}
              className="absolute top-4 right-4 bg-white/90 hover:bg-white backdrop-blur-sm border border-[#EAE2D6] p-2.5 rounded-2xl text-stone-700 shadow-md hover:shadow-lg transition-all z-10 flex items-center gap-1.5 font-semibold text-xs uppercase tracking-wider px-4 animate-fade-in"
            >
              {isEditingMode ? (
                <>
                  <Eye className="w-4 h-4 text-[#A5A58D]" />
                  {t('viewPublicCard')}
                </>
              ) : (
                <>
                  <Settings className="w-4 h-4 text-[#CB997E]" />
                  {t('settings')}
                </>
              )}
            </button>
          )}

          {isEditingMode ? (
            <div className="p-6 md:p-8">
              <ConfiguracionComunidadPanel
                onUpdated={async () => {
                  setIsEditingMode(false);
                  if (slug) {
                    try {
                      const data = await getComunidad(slug);
                      setComunidad(data);
                    } catch (err) {
                      console.error('Error al recargar comunidad:', err);
                    }
                  }
                }}
                onCancel={() => setIsEditingMode(false)}
              />
            </div>
          ) : (
            <div className="p-6 md:p-8 space-y-8">
              
              {/* Bloque A: Info Básica y Logo Superpuesto */}
              <div className="relative border-b border-[#EAE2D6] pb-6">
                <div className="absolute -top-16 md:-top-20 left-0 w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-white border-2 border-[#EAE2D6] shadow-md flex items-center justify-center overflow-hidden z-10">
                  {comunidad.logoUrl ? (
                    <img
                      src={comunidad.logoUrl}
                      alt={comunidad.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl md:text-5xl font-serif text-[#6B705C] font-bold">
                      {comunidad.nombre.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="pt-10 md:pt-0 md:pl-40 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <h1 className="text-2xl md:text-4xl font-serif text-[#4A4E4D] font-bold">
                        {comunidad.nombre}
                      </h1>
                      <span className="px-3 py-1 bg-[#F9F7F1] text-[#6B705C] text-xs font-bold rounded-full border border-[#EAE2D6] uppercase tracking-wider">
                        {comunidad.tipo ? comunidad.tipo.charAt(0).toUpperCase() + comunidad.tipo.slice(1) : t('node')}
                      </span>
                    </div>

                    {comunidad.ubicacion && (
                      <div className="flex items-center gap-1.5 text-stone-500 text-sm font-medium">
                        <MapPin className="w-4 h-4 text-[#CB997E]" />
                        <span>
                          {comunidad.ubicacion.municipio}, {comunidad.ubicacion.region}, {comunidad.ubicacion.pais}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Ocupación / Capacidad */}
                  <div className="w-full md:w-auto min-w-[240px] bg-[#F9F7F1]/50 border border-[#EAE2D6]/40 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-[#8A817C] uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-[#A5A58D]" />
                        {members.length} {t(members.length === 1 ? 'member_one' : 'member_other')}
                      </span>
                      {comunidad.capacidad && comunidad.capacidad > 0 ? (
                        <span>{t('occupationLimit', { limit: comunidad.capacidad })}</span>
                      ) : null}
                    </div>
                    
                    {comunidad.capacidad && comunidad.capacidad > 0 ? (
                      <div className="space-y-1">
                        <div className="w-full bg-stone-200/60 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-[#A5A58D] h-full rounded-full transition-all duration-500" 
                            style={{ width: `${Math.min(100, (members.length / comunidad.capacidad) * 100)}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-right text-stone-400 font-medium">
                          {t('occupationPercent', { percent: Math.round((members.length / comunidad.capacidad) * 100) })}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Layout principal: 2 columnas en desktop */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Columna Izquierda (2/3): Tabs y Contenido */}
                <div className="md:col-span-2 space-y-6">
                  
                  {/* Barra de pestañas */}
                  <div className="flex border-b border-[#EAE2D6] gap-2 overflow-x-auto scrollbar-none">
                    {(['presentacion', 'miembros', 'actividad'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-3 font-bold text-xs md:text-sm border-b-2 transition-all uppercase tracking-widest whitespace-nowrap ${
                          activeTab === tab
                            ? 'border-[#CB997E] text-[#CB997E]'
                            : 'border-transparent text-stone-400 hover:text-stone-700'
                        }`}
                      >
                        {t(`tabs.${tab}` as any)}
                      </button>
                    ))}
                  </div>

                  {/* Vistas de pestañas con transiciones CSS nativas */}
                  <div className="relative">
                    
                    {/* Tab: Presentación */}
                    {activeTab === 'presentacion' && (
                      <div className="space-y-6 transition-all duration-200 ease-out opacity-100 translate-y-0">
                        <p className="text-stone-600 text-base md:text-lg leading-relaxed whitespace-pre-line">
                          {comunidad.descripcion}
                        </p>

                        {/* Etiquetas */}
                        {comunidad.tags && comunidad.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {comunidad.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-3 py-1.5 bg-[#F9F7F1] border border-[#EAE2D6] text-stone-700 text-xs font-semibold rounded-xl"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Manifiesto */}
                        {comunidad.manifiesto && (
                          <div className="space-y-3 pt-6 border-t border-stone-100">
                            <h3 className="text-lg md:text-xl font-serif text-[#4A4E4D] font-bold flex items-center gap-2">
                              <BookOpen className="w-5 h-5 text-[#A5A58D]" />
                              {t('manifesto')}
                            </h3>
                            <div className="bg-[#FDFBF7] border border-[#EAE2D6] rounded-3xl p-6 md:p-8 text-stone-700 prose prose-stone max-w-none prose-p:text-stone-600 prose-headings:font-serif prose-headings:text-[#4A4E4D]">
                              <ReactMarkdown>{comunidad.manifiesto}</ReactMarkdown>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tab: Miembros */}
                    {activeTab === 'miembros' && (
                      <div className="space-y-6 transition-all duration-200 ease-out opacity-100 translate-y-0">
                        {loadingMembers ? (
                          <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-[#A5A58D]" />
                          </div>
                        ) : (
                          <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {members.map((member) => {
                                // FIX 1: Fallback inteligente de nombre → displayName → inicial del email
                                const displayName = member.nombre && member.nombre !== 'Sin Nombre'
                                  ? member.nombre
                                  : member.displayName || (member.email ? member.email.split('@')[0] : 'Miembro');
                                const avatarInitial = displayName.charAt(0).toUpperCase();

                                return (
                                  <div key={member.id} className="bg-[#F9F7F1]/30 border border-[#EAE2D6]/40 rounded-2xl p-4 flex items-center gap-3">
                                    {member.photoURL ? (
                                      <img src={member.photoURL} alt={displayName} className="w-12 h-12 rounded-full object-cover border border-[#EAE2D6]" />
                                    ) : (
                                      <div className="w-12 h-12 rounded-full bg-[#A5A58D]/10 text-[#6B705C] border border-[#EAE2D6] flex items-center justify-center font-bold text-lg">
                                        {avatarInitial}
                                      </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                      <p className="font-bold text-stone-800 truncate">{displayName}</p>
                                      {member.rol_comunidad && (
                                        <p className="text-xs text-[#CB997E] font-semibold">{member.rol_comunidad}</p>
                                      )}
                                      <div className="flex flex-wrap gap-1.5 mt-1">
                                        {member.arquetipo_s3 && (
                                          <span className="inline-block px-2 py-0.5 bg-[#CB997E]/10 text-[#CB997E] text-[10px] font-bold rounded-full border border-[#CB997E]/20">
                                            {member.arquetipo_s3}
                                          </span>
                                        )}
                                        {member.tipo_hd && (
                                          <span className="inline-block px-2 py-0.5 bg-[#A5A58D]/10 text-[#6B705C] text-[10px] font-bold rounded-full border border-[#A5A58D]/20">
                                            {member.tipo_hd}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {!isMember && (
                              <div className="bg-[#F9F7F1]/50 border border-[#EAE2D6]/40 rounded-3xl p-6 text-center space-y-4 shadow-sm">
                                <Users className="w-10 h-10 text-[#CB997E] mx-auto" />
                                <div className="space-y-1">
                                  <h4 className="text-lg font-bold text-stone-800">¿Quieres conocer más a los miembros?</h4>
                                  <p className="text-sm text-stone-600 max-w-md mx-auto">
                                    Únete a este espacio para poder ver perfiles completos, conectar con la comunidad y compartir proyectos.
                                  </p>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {/* Tab: Actividad */}
                    {activeTab === 'actividad' && (
                      <div className="space-y-6 transition-all duration-200 ease-out opacity-100 translate-y-0">
                        {loadingTareas || loadingProyectos ? (
                          <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-[#A5A58D]" />
                          </div>
                        ) : (
                          <>
                            {/* Tareas */}
                            <div className="space-y-3">
                              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Tareas Recientes</h4>
                              {tareas.length === 0 ? (
                                <div className="bg-[#F9F7F1]/20 border border-[#EAE2D6]/30 rounded-2xl p-6 text-center text-sm text-stone-500">
                                  No hay tareas registradas.
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {tareas.slice(0, 5).map((tarea) => (
                                    <div key={tarea.id} className="bg-white border border-[#EAE2D6] rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm">
                                      <div className="min-w-0 flex-1">
                                        <p className="font-bold text-stone-800 truncate">{tarea.titulo}</p>
                                        {isMember && tarea.descripcion && (
                                          <p className="text-sm text-stone-600 line-clamp-1 mt-0.5">{tarea.descripcion}</p>
                                        )}
                                      </div>
                                      <div className="shrink-0 flex items-center gap-2">
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                                          tarea.estado === 'completada'
                                            ? 'bg-green-50 text-green-700 border border-green-200'
                                            : 'bg-stone-100 text-stone-600'
                                        }`}>
                                          {tarea.estado || 'pendiente'}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Proyectos */}
                            <div className="space-y-3 pt-4">
                              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Proyectos Activos</h4>
                              {proyectos.length === 0 ? (
                                <div className="bg-[#F9F7F1]/20 border border-[#EAE2D6]/30 rounded-2xl p-6 text-center text-sm text-stone-500">
                                  No hay proyectos activos.
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {proyectos.slice(0, 5).map((proyecto) => (
                                    <div key={proyecto.id} className="bg-white border border-[#EAE2D6] rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm">
                                      <div className="min-w-0 flex-1">
                                        <p className="font-bold text-stone-800 truncate">{proyecto.titulo}</p>
                                        {isMember && proyecto.descripcion && (
                                          <p className="text-sm text-stone-600 line-clamp-1 mt-0.5">{proyecto.descripcion}</p>
                                        )}
                                      </div>
                                      <div className="shrink-0">
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                                          proyecto.estado === 'en_marcha'
                                            ? 'bg-green-50 text-green-700 border border-green-200'
                                            : 'bg-stone-100 text-stone-600'
                                        }`}>
                                          {proyecto.estado || 'planificado'}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )}

                  </div>
                </div>

                {/* Columna Derecha (1/3): CTAs de Acceso y Participación */}
                <div className="space-y-6">
                  <div className="bg-[#F9F7F1]/50 border border-[#EAE2D6] rounded-3xl p-6 shadow-md space-y-6 sticky top-6">
                    <div>
                      <h3 className="text-lg font-serif font-bold text-[#4A4E4D] mb-2">{t('join')}</h3>
                      <p className="text-sm text-[#8A817C] leading-relaxed">
                        {comunidad.esPublica
                          ? t('accessState.requestDirect')
                          : t('privateDesc')}
                      </p>
                    </div>

                    <div className="border-t border-[#EAE2D6] pt-6">
                      {isMember ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-green-700 font-bold text-sm bg-green-50 border border-green-200 rounded-2xl p-4">
                            <CheckCircle2 className="w-5 h-5 shrink-0" />
                            <span>{t('accessState.alreadyMember')}</span>
                          </div>
                          <button
                            onClick={() => navigate('/admin')}
                            className="w-full bg-[#A5A58D] hover:bg-[#6B705C] text-white py-3.5 px-6 rounded-2xl font-bold transition-all shadow-md flex items-center justify-center gap-2"
                          >
                            {t('accessState.goToAdmin')}
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      ) : !appUser ? (
                        <div className="space-y-4">
                          <button
                            onClick={() => openLoginModal('login')}
                            className="w-full bg-[#A5A58D] hover:bg-[#6B705C] text-white py-3.5 px-6 rounded-2xl font-bold transition-all shadow-md text-center"
                          >
                            {t('accessState.loginToJoin')}
                          </button>
                          <button
                            onClick={() => openLoginModal('onboarding')}
                            className="w-full border border-[#A5A58D] text-[#A5A58D] hover:bg-white py-3.5 px-6 rounded-2xl font-bold transition-all text-center"
                          >
                            {t('accessState.registerToJoin')}
                          </button>
                        </div>
                      ) : comunidad.requiereAprobacion ? (
                        <div className="space-y-4">
                          {hasPending ? (
                            <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-5 flex flex-col gap-3 text-[#1E3A8A]">
                              <div className="flex items-center gap-2">
                                <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
                                <span className="font-bold text-sm">{t('accessState.pending')}</span>
                              </div>
                              {latestRequest?.mensaje && (
                                <div className="bg-white/80 border border-blue-100 rounded-xl p-3 text-stone-700 text-xs italic">
                                  "{latestRequest.mensaje}"
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {hasRejected && (
                                <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 text-rose-900 text-xs">
                                  <p className="font-bold mb-1">{t('accessState.rejected')}</p>
                                </div>
                              )}

                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
                                  {t('accessState.charCount', { count: solicitudMsg.trim().length })}
                                </label>
                                <textarea
                                  rows={4}
                                  value={solicitudMsg}
                                  onChange={(e) => setSolicitudMsg(e.target.value)}
                                  placeholder={t('accessState.placeholderMessage')}
                                  className="w-full bg-white border border-[#EAE2D6] rounded-2xl p-3 text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-[#A5A58D] transition-all text-sm outline-none"
                                />
                              </div>

                              <button
                                onClick={handleSendRequest}
                                disabled={isExecuting || solicitudMsg.trim().length < 20}
                                className="w-full bg-[#CB997E] hover:bg-[#B58368] text-white py-3.5 px-6 rounded-2xl font-bold transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                              >
                                <MessageSquare className="w-5 h-5" />
                                {t('accessState.sendRequest')}
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={handleJoinDirect}
                          disabled={isExecuting}
                          className="w-full bg-[#CB997E] hover:bg-[#B58368] text-white py-3.5 px-6 rounded-2xl font-bold transition-all shadow-md flex items-center justify-center gap-2"
                        >
                          {t('accessState.joinDirect')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>
      </div>

      {/* Modal de login/onboarding */}
      <AuthGateModal
        isOpen={isLoginModalOpen}
        mode={loginMode}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}
