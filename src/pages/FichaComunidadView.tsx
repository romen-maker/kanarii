import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { MapPin, Users, CheckCircle2, Lock, Globe, BookOpen, ArrowLeft, Loader2, MessageSquare, AlertTriangle, Settings, Eye } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../contexts/AuthContext';
import { useComunidad } from '../contexts/ComunidadContext';
import { Comunidad, getComunidad, getUltimaSolicitud, SolicitudAcceso } from '../lib/appService';
import { useComunidadActions } from '../hooks/useComunidadActions';
import { useToast } from '../components/Toaster';
import { AuthGateModal } from '../components/AuthGateModal';
import { ConfiguracionComunidadPanel } from '../components/ConfiguracionComunidadPanel';

export function FichaComunidadView() {
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

  const isAdmin = appUser?.role === 'admin';
  const isCommunityAdmin = !!(isAdmin || (comunidad?.adminUids && Array.isArray(comunidad.adminUids) && comunidad.adminUids.includes(appUser?.uid || '')));

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
          // Forzar la recarga o redirección al panel de la comunidad
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
          // Actualizar estado de solicitud local
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
        <p className="font-medium font-serif">Cargando detalles del espacio...</p>
      </div>
    );
  }

  // 1. Error 404 si la comunidad no existe
  if (!comunidad) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-stone-800">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500 border border-rose-100 shadow-inner">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-serif text-[#4A4E4D]">Espacio no encontrado</h1>
          <p className="text-stone-600">
            La comunidad con el identificador <span className="font-mono bg-stone-100 px-1.5 py-0.5 rounded text-rose-700">/c/{slug}</span> no existe o ha sido eliminada.
          </p>
          <div className="pt-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-[#A5A58D] hover:bg-[#6B705C] text-white py-3 px-6 rounded-2xl font-bold transition-all shadow-md"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Si la comunidad es privada y el usuario no pertenece a ella
  const isMember = appUser?.communityIds?.includes(comunidad.slug) || false;
  const isPrivate = comunidad.esPublica === false;

  if (isPrivate && !isMember) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-stone-800">
        <div className="max-w-md w-full text-center space-y-6 bg-white border border-[#EAE2D6] rounded-[2rem] p-8 shadow-lg">
          <div className="w-20 h-20 bg-[#F9F7F1] rounded-full flex items-center justify-center mx-auto text-[#6B705C] border border-[#EAE2D6]">
            <Lock className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-serif text-[#4A4E4D]">Comunidad Privada</h1>
          <p className="text-stone-600 leading-relaxed">
            Este espacio es privado. Para acceder a su contenido, ver su manifiesto o unirte, debes recibir una invitación directa de un miembro de la comunidad.
          </p>
          <div className="pt-4 flex flex-col gap-3">
            <Link
              to="/comunidades"
              className="inline-flex items-center justify-center gap-2 bg-[#A5A58D] hover:bg-[#6B705C] text-white py-3 px-6 rounded-2xl font-bold transition-all shadow-md"
            >
              Explorar otras comunidades
            </Link>
            <Link
              to="/"
              className="text-[#CB997E] hover:underline font-bold text-sm"
            >
              Ir a la página de bienvenida
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Determinar los estados de las solicitudes si requiere aprobación
  const hasPending = latestRequest?.estado === 'pendiente';
  const hasRejected = latestRequest?.estado === 'rechazada';

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-6 pb-24 text-stone-800 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Cabecera y Botón de Volver */}
        <div className="flex items-center justify-between">
          <Link
            to={appUser ? '/comunidades' : '/'}
            className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors font-bold text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            {appUser ? 'Volver a Comunidades' : 'Volver al Inicio'}
          </Link>
        </div>

        {/* Ficha Principal de la Comunidad */}
        <div className="bg-white border border-[#EAE2D6] rounded-[2.5rem] shadow-xl overflow-hidden">
          {/* Banner superior con fondo terracota suave */}
          <div className="h-32 bg-gradient-to-r from-[#CB997E]/30 to-[#A5A58D]/30 flex items-end px-8 pb-4 relative">
            {/* Logo de la comunidad */}
            {!isEditingMode && (
              <div className="absolute -bottom-8 left-8 w-24 h-24 rounded-[1.8rem] bg-white border-2 border-[#EAE2D6] shadow-md flex items-center justify-center overflow-hidden">
                {comunidad.logoUrl ? (
                  <img
                    src={comunidad.logoUrl}
                    alt={comunidad.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-serif text-[#6B705C] font-bold">
                    {comunidad.nombre.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            )}

            {/* Botón de configuración/edición visible solo para admins */}
            {isCommunityAdmin && (
              <button
                onClick={handleToggleEdit}
                className="absolute top-4 right-4 bg-white/80 hover:bg-white backdrop-blur-sm border border-[#EAE2D6] p-2.5 rounded-full text-stone-700 shadow-sm hover:shadow transition-all z-10 flex items-center gap-1.5 font-semibold text-xs uppercase tracking-wider px-4"
              >
                {isEditingMode ? (
                  <>
                    <Eye className="w-4 h-4 text-[#A5A58D]" />
                    Ver Ficha Pública
                  </>
                ) : (
                  <>
                    <Settings className="w-4 h-4 text-[#CB997E]" />
                    Configuración
                  </>
                )}
              </button>
            )}
          </div>

          {isEditingMode ? (
            <div className="p-8">
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
            <div className="pt-12 px-8 pb-8 space-y-6">
            {/* Título e Info Básica */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-serif text-[#4A4E4D] font-bold">
                  {comunidad.nombre}
                </h1>
                {/* Badges de Tipo y Capacidad */}
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-[#F9F7F1] text-[#6B705C] text-xs font-bold rounded-full border border-[#EAE2D6]">
                    {comunidad.tipo ? comunidad.tipo.charAt(0).toUpperCase() + comunidad.tipo.slice(1) : 'Otro'}
                  </span>
                  {comunidad.capacidad && comunidad.capacidad > 0 && (
                    <span className="px-3 py-1 bg-stone-100 text-stone-600 text-xs font-bold rounded-full flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {comunidad.capacidad} max.
                    </span>
                  )}
                </div>
              </div>

              {/* Ubicación */}
              {comunidad.ubicacion && (
                <div className="flex items-center gap-1.5 text-stone-500 text-sm font-medium">
                  <MapPin className="w-4 h-4 text-[#CB997E]" />
                  <span>
                    {comunidad.ubicacion.municipio}, {comunidad.ubicacion.region}, {comunidad.ubicacion.pais}
                  </span>
                </div>
              )}
            </div>

            {/* Descripción */}
            <p className="text-stone-600 text-base md:text-lg leading-relaxed max-w-3xl">
              {comunidad.descripcion}
            </p>

            {/* Etiquetas (Tags) */}
            {comunidad.tags && comunidad.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {comunidad.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-[#FDFBF7] hover:bg-[#F9F7F1] border border-[#EAE2D6] text-stone-700 text-xs font-medium rounded-xl transition-all"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Manifiesto si existe */}
            {comunidad.manifiesto && (
              <div className="space-y-3 pt-4 border-t border-[#EAE2D6]">
                <h3 className="text-lg font-serif text-[#4A4E4D] font-bold flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#A5A58D]" />
                  Manifiesto de Convivencia
                </h3>
                <div className="bg-[#FDFBF7] border border-[#EAE2D6] rounded-2xl p-6 text-stone-700 prose prose-stone max-w-none prose-p:text-stone-600 prose-headings:font-serif prose-headings:text-[#4A4E4D]">
                  <ReactMarkdown>{comunidad.manifiesto}</ReactMarkdown>
                </div>
              </div>
            )}

            {/* Sección de Acción / Unirse */}
            <div className="pt-6 border-t border-[#EAE2D6]">
              {isMember ? (
                // Caso A: Ya es miembro de la comunidad
                <div className="bg-green-50/50 border border-green-100 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-green-950">Ya eres parte de este espacio</p>
                      <p className="text-sm text-green-800">
                        Tienes acceso a todas las herramientas del panel de administración y tablón de anuncios.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/admin')}
                    className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-2xl font-bold transition-all shrink-0"
                  >
                    Ir al panel
                  </button>
                </div>
              ) : !appUser ? (
                // Caso B: El usuario no está logueado
                <div className="bg-[#FDFBF7] border border-[#EAE2D6] rounded-3xl p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <Globe className="w-6 h-6 text-[#CB997E] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-stone-800">Unete a la comunidad</p>
                      <p className="text-sm text-stone-600">
                        {comunidad.requiereAprobacion
                          ? 'Esta comunidad requiere aprobación por parte de los administradores. Para enviar tu solicitud de acceso debes iniciar sesión primero.'
                          : 'Esta comunidad es pública y no requiere aprobación. Inicia sesión para formar parte de ella al instante.'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      onClick={() => openLoginModal('login')}
                      className="bg-[#A5A58D] hover:bg-[#6B705C] text-white py-3.5 px-8 rounded-2xl font-bold transition-all shadow-md text-center"
                    >
                      {comunidad.requiereAprobacion
                        ? 'Iniciar sesión para solicitar acceso'
                        : 'Iniciar sesión para unirte'}
                    </button>
                    <button
                      onClick={() => openLoginModal('onboarding')}
                      className="border border-[#A5A58D] text-[#A5A58D] hover:bg-[#F9F7F1] py-3.5 px-8 rounded-2xl font-bold transition-all text-center"
                    >
                      Crear una cuenta nueva
                    </button>
                  </div>
                </div>
              ) : comunidad.requiereAprobacion ? (
                // Caso C: Logueado, requiere aprobación
                <div className="space-y-4">
                  {hasPending ? (
                    <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-6 flex items-start gap-3 text-[#1E3A8A]">
                      <Loader2 className="w-6 h-6 text-blue-600 animate-spin shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-blue-950">Solicitud en revisión</p>
                        <p className="text-sm text-blue-800">
                          Tu solicitud de acceso para unirte a <strong>{comunidad.nombre}</strong> está en espera de revisión por parte de los administradores.
                        </p>
                        <div className="mt-3 bg-white/70 border border-blue-100 rounded-2xl p-4 text-stone-700 text-sm">
                          <span className="font-bold text-xs uppercase tracking-widest text-[#CB997E] block mb-1">
                            Tu mensaje:
                          </span>
                          "{latestRequest?.mensaje}"
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#FDFBF7] border border-[#EAE2D6] rounded-3xl p-6 space-y-4">
                      <div>
                        <p className="font-bold text-stone-800">Solicitar acceso</p>
                        <p className="text-sm text-stone-600">
                          Explica al equipo y residentes por qué deseas formar parte de este espacio. Los administradores revisarán tu solicitud.
                        </p>
                      </div>

                      {hasRejected && (
                        <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 text-rose-900 text-sm">
                          <p className="font-bold mb-1">Tu solicitud anterior fue rechazada:</p>
                          {latestRequest?.motivoRechazo && (
                            <p className="font-semibold text-stone-700">{latestRequest.motivoRechazo}</p>
                          )}
                          {latestRequest?.detalleRechazo && (
                            <p className="text-stone-500 italic mt-0.5">"{latestRequest.detalleRechazo}"</p>
                          )}
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
                          Mensaje de motivación (mínimo 20 caracteres)
                        </label>
                        <textarea
                          rows={4}
                          value={solicitudMsg}
                          onChange={(e) => setSolicitudMsg(e.target.value)}
                          placeholder="Hola tribu, me gustaría unirme porque..."
                          className="w-full bg-white border border-[#EAE2D6] rounded-2xl p-4 text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-[#A5A58D] transition-all text-sm"
                        />
                      </div>

                      <button
                        onClick={handleSendRequest}
                        disabled={isExecuting || solicitudMsg.trim().length < 20}
                        className="bg-[#CB997E] hover:bg-[#B58368] text-white py-3 px-6 rounded-2xl font-bold transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <MessageSquare className="w-5 h-5" />
                        Solicitar unirse
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // Caso D: Logueado, público sin aprobación
                <div className="bg-[#FDFBF7] border border-[#EAE2D6] rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-stone-800">Forma parte de esta comunidad</p>
                    <p className="text-sm text-stone-600">
                      Este es un espacio abierto a cualquier miembro de Kanarii. ¡Únete de inmediato!
                    </p>
                  </div>
                  <button
                    onClick={handleJoinDirect}
                    disabled={isExecuting}
                    className="bg-[#CB997E] hover:bg-[#B58368] text-white py-3.5 px-8 rounded-2xl font-bold transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    Unirse a la comunidad
                  </button>
                </div>
              )}
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
