import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, ShieldCheck, Ticket, Key, Info, MessageSquare, ArrowRight, Loader2, X, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../contexts/AuthContext';
import { 
  Comunidad, 
  getComunidadesPublicas, 
  getSolicitudPendiente
} from '../lib/appService';
import { useComunidadActions } from '../hooks/useComunidadActions';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../components/Toaster';

/**
 * TODO: Revisión sistémica de visibilidad de inputs en toda la app.
 * Se ha detectado que algunos inputs tienen el mismo color de fondo que su contenedor.
 * Verificado en ComunidadesView y SolicitudModal.
 */

// --- COMPONENTES AUXILIARES ---

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b border-[#EAE2D6] flex justify-between items-center bg-[#FDFBF7]">
              <h2 className="text-xl font-serif text-[#4A4E4D]">{title}</h2>
              <button onClick={onClose} className="text-stone-400 hover:text-stone-600 p-1">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// --- VISTA PRINCIPAL ---

export function ComunidadesView() {
  const { appUser } = useAuth();
  const { redeemInvitacion, solicitarAcceso, isExecuting } = useComunidadActions();
  const { success: toastSuccess, error: toastError } = useToast();
  const navigate = useNavigate();
  
  const [inviteCode, setInviteCode] = useState('');
  const [comunidades, setComunidades] = useState<Comunidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComunidad, setSelectedComunidad] = useState<Comunidad | null>(null);
  const [showManifiesto, setShowManifiesto] = useState(false);
  const [showSolicitud, setShowSolicitud] = useState(false);
  const [solicitudMsg, setSolicitudMsg] = useState('');
  const [pendingRequests, setPendingRequests] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const list = await getComunidadesPublicas();
    setComunidades(list);
    
    if (appUser) {
      const pending: Record<string, boolean> = {};
      for (const c of list) {
        const sol = await getSolicitudPendiente(c.slug, appUser.uid);
        if (sol) pending[c.slug] = true;
      }
      setPendingRequests(pending);
    }
    setLoading(false);
  };

  const handleJoinByCode = async (codeOverride?: string) => {
    const rawCode = codeOverride || inviteCode;
    // Sanitizado robusto: remover todos los espacios intermedios/extremos y pasar a minúsculas
    const code = rawCode.replace(/\s+/g, '').toLowerCase();
    if (!code) return;

    await redeemInvitacion(code, appUser!.uid, {
      successMessage: '¡Bienvenido a la comunidad! ✨',
      errorMessage: null, // Silenciamos el toast genérico para tomar el control total en la vista
      onSuccess: () => navigate('/'),
      onError: (err: any) => {
        if (err?.message === 'YA_ES_MIEMBRO') {
          toastSuccess('Ya eres miembro de esta comunidad. ¡Te redirigimos! 🚀');
          navigate('/');
        } else {
          toastError('Código inválido, caducado o agotado.');
        }
      }
    });
  };

  const handleSendSolicitud = async () => {
    if (!selectedComunidad || solicitudMsg.trim().length < 20) return;

    setIsSubmitting(true);
    try {
      await solicitarAcceso(selectedComunidad.slug, appUser!.uid, solicitudMsg, {
        successMessage: 'Tu solicitud ha sido enviada. El equipo la revisará pronto.',
        onSuccess: () => {
          setPendingRequests(prev => ({ ...prev, [selectedComunidad.slug]: true }));
          setShowSolicitud(false);
          setSolicitudMsg('');
        }
      });
    } catch (error) {
      // El error ya lo maneja perform con un toast
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FDFBF7] text-[#8A817C]">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="font-medium">Buscando espacios para ti...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-6 pb-24">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Cabecera */}
        <div className="text-center space-y-4">
          <div className="inline-flex p-3 bg-[#EAE2D6] rounded-2xl mb-2">
            <Compass className="w-8 h-8 text-[#4A4E4D]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-serif text-[#4A4E4D]">Explorar Comunidades</h1>
          <p className="text-[#8A817C] max-w-lg mx-auto">
            Encuentra tu lugar en la red. Únete a un espacio existente o descubre nuevas formas de colaborar.
          </p>
        </div>

        {/* Sección 1: Código de Invitación */}
        <section className="bg-white border border-[#EAE2D6] rounded-3xl p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="p-4 bg-[#F9F7F1] rounded-2xl">
              <Key className="w-8 h-8 text-[#CB997E]" />
            </div>
            <div className="flex-1 space-y-1 text-center md:text-left">
              <h3 className="text-xl font-bold text-stone-800">¿Tienes un código?</h3>
              <p className="text-stone-500">Introduce tu código de invitación para acceso inmediato.</p>
            </div>
            <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
              <input 
                type="text" 
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value)}
                placeholder="ej: sabio-monte-42"
                className="w-full sm:w-48 rounded-xl border-[#EAE2D6] bg-[#F9F7F1] focus:border-[#CB997E] focus:ring-[#CB997E] transition-all placeholder:normal-case"
              />
              <button 
                onClick={() => handleJoinByCode()}
                disabled={isExecuting || !inviteCode.trim()}
                className="w-full sm:w-auto bg-[#A5A58D] hover:bg-[#6B705C] text-white px-6 py-3 sm:py-2 rounded-xl font-bold transition-all disabled:opacity-50 shadow-md shrink-0 flex items-center justify-center"
              >
                {isExecuting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Unirse'}
              </button>
            </div>
          </div>
        </section>

        {/* Sección 2: Directorio */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif text-[#4A4E4D]">Comunidades disponibles</h2>
            <span className="text-sm font-medium text-[#8A817C] bg-[#EAE2D6] px-3 py-1 rounded-full">
              {comunidades.length} espacios
            </span>
          </div>

          {comunidades.length === 0 ? (
            <div className="text-center py-20 bg-[#F9F7F1] rounded-3xl border-2 border-dashed border-[#EAE2D6]">
              <Info className="w-12 h-12 text-[#EAE2D6] mx-auto mb-4" />
              <p className="text-stone-500 font-medium text-lg">No hay comunidades públicas disponibles en este momento.</p>
              <p className="text-stone-400 text-sm mt-2">Si tienes un código de invitación, úsalo en la sección superior.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {comunidades.map(comunidad => {
                const isMember = appUser?.communityIds?.includes(comunidad.slug);
                const hasPending = pendingRequests[comunidad.slug];
                
                return (
                  <motion.div 
                    key={comunidad.id}
                    whileHover={{ y: -4 }}
                    className="bg-white border border-[#EAE2D6] rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col h-full"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-14 h-14 bg-[#F9F7F1] rounded-2xl flex items-center justify-center overflow-hidden border border-[#EAE2D6]">
                        {comunidad.logoUrl ? (
                          <img src={comunidad.logoUrl} alt={comunidad.nombre} className="w-full h-full object-cover" />
                        ) : (
                          <Compass className="w-7 h-7 text-[#A5A58D]" />
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {comunidad.plan === 'pro' && (
                          <span className="text-[10px] font-bold uppercase tracking-widest bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                            PRO
                          </span>
                        )}
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                          comunidad.requiereAprobacion 
                            ? 'bg-blue-50 text-blue-600 border-blue-100' 
                            : 'bg-green-50 text-green-600 border-green-100'
                        }`}>
                          {comunidad.requiereAprobacion ? 'Solicitud requerida' : 'Entrada libre'}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 space-y-2">
                      <h3 className="text-xl font-bold text-stone-800">{comunidad.nombre}</h3>
                      <p className="text-stone-500 text-sm line-clamp-3 leading-relaxed">
                        {comunidad.descripcion}
                      </p>
                    </div>

                    <div className="pt-6 mt-auto flex flex-col gap-3">
                      <button 
                        onClick={() => {
                          setSelectedComunidad(comunidad);
                          setShowManifiesto(true);
                        }}
                        className="w-full flex items-center justify-center gap-2 text-sm font-bold text-[#A5A58D] hover:text-[#6B705C] bg-[#F9F7F1] py-2 rounded-xl transition-colors"
                      >
                        <Info className="w-4 h-4" />
                        Ver manifiesto
                      </button>

                      {isMember ? (
                        <div className="w-full flex items-center justify-center gap-2 text-sm font-bold text-green-600 bg-green-50 py-3 rounded-xl border border-green-100">
                          <CheckCircle2 className="w-5 h-5" />
                          Ya eres miembro
                        </div>
                      ) : hasPending ? (
                        <div className="w-full flex items-center justify-center gap-2 text-sm font-bold text-blue-600 bg-blue-50 py-3 rounded-xl border border-blue-100 opacity-80 cursor-default">
                          Solicitud pendiente
                        </div>
                      ) : comunidad.requiereAprobacion ? (
                        <button 
                          onClick={() => {
                            setSelectedComunidad(comunidad);
                            setShowSolicitud(true);
                          }}
                          className="w-full flex items-center justify-center gap-2 bg-[#CB997E] hover:bg-[#B58368] text-white py-3 rounded-xl font-bold transition-all shadow-md group"
                        >
                          <MessageSquare className="w-5 h-5" />
                          Solicitar acceso
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Introduce código"
                            className="flex-1 text-sm rounded-xl border-[#EAE2D6] bg-[#F9F7F1] focus:border-[#CB997E] focus:ring-[#CB997E]"
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleJoinByCode((e.target as HTMLInputElement).value);
                            }}
                          />
                          <button 
                            onClick={(e) => {
                              const input = (e.currentTarget.previousSibling as HTMLInputElement);
                              handleJoinByCode(input.value);
                            }}
                            className="bg-[#A5A58D] hover:bg-[#6B705C] text-white p-3 rounded-xl transition-all shadow-md"
                          >
                            <ArrowRight className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Modales */}
      <Modal 
        isOpen={showManifiesto} 
        onClose={() => setShowManifiesto(false)} 
        title={selectedComunidad?.nombre || ''}
      >
        <div className="prose prose-stone max-w-none prose-p:text-stone-600 prose-headings:font-serif prose-headings:text-[#4A4E4D]">
          <ReactMarkdown>{selectedComunidad?.manifiesto || 'No hay manifiesto disponible.'}</ReactMarkdown>
        </div>
        <div className="mt-8 pt-6 border-t border-[#EAE2D6] flex justify-end">
           <button 
            onClick={() => setShowManifiesto(false)}
            className="px-6 py-2 text-[#8A817C] font-bold hover:bg-[#F9F7F1] rounded-xl transition-colors"
           >
             Cerrar
           </button>
        </div>
      </Modal>

      <Modal 
        isOpen={showSolicitud} 
        onClose={() => setShowSolicitud(false)} 
        title={`Solicitar acceso a ${selectedComunidad?.nombre}`}
      >
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3">
            <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700 leading-relaxed">
              Esta comunidad es privada. Explica brevemente por qué quieres unirte para que los administradores puedan conocerte.
            </p>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-stone-700">Mensaje de presentación *</label>
            <textarea 
              required
              rows={4}
              value={solicitudMsg}
              onChange={e => setSolicitudMsg(e.target.value)}
              placeholder="Hola, me gustaría unirme porque..."
              className="w-full rounded-2xl border-[#EAE2D6] bg-[#FDFBF7] focus:border-[#CB997E] focus:ring-[#CB997E] transition-all resize-none"
              disabled={isExecuting}
            />
            <div className="flex justify-between items-center px-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${solicitudMsg.length >= 20 ? 'text-green-500' : 'text-stone-400'}`}>
                {solicitudMsg.length} / mín 20 caracteres
              </span>
            </div>
          </div>
          <div className="pt-2 flex flex-col gap-3">
            <button 
              onClick={handleSendSolicitud}
              disabled={isSubmitting || solicitudMsg.length < 20}
              className="w-full bg-[#CB997E] hover:bg-[#B58368] text-white py-4 rounded-2xl font-bold transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enviar solicitud'}
            </button>
            <button 
              onClick={() => setShowSolicitud(false)}
              className="w-full py-2 text-[#8A817C] font-bold hover:bg-[#F9F7F1] rounded-xl transition-colors"
              disabled={isExecuting}
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
